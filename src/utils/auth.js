import axios from "axios";
import dotenv from "dotenv";

import { decodeBase64 } from "./crypto.js";
import { setUserInfo } from "../constants/index.js";
import {
  userLogin,
  systemSettings,
  userInfo,
  userNodes,
} from "../api/index.js";

dotenv.config();

export const parseShadowsocksLinks = (ssLinks) => {
  // 将输入的 ssLinks 按行分割
  const links = ssLinks.split("\n").filter((link) => link.trim() !== "");
  // 解析每个链接
  const nodes = links.map((ssLink) => {
    // 提取 Base64 部分
    const base64Part = ssLink.split("ss://")[1].split("@")[0];
    // 解码 Base64
    const decoded = atob(base64Part);
    // 提取加密方法和密码
    const [method, password] = decoded.split(":");
    // 提取主机名和端口
    const hostAndPort = ssLink.split("@")[1].split("#")[0];
    const [server, port] = hostAndPort.split(":");
    // 提取节点名称
    const name = decodeURIComponent(ssLink.split("#")[1]).trim();
    // 返回解析结果
    return { method, password, server, port: parseInt(port, 10), name };
  });

  return nodes;
};

/**
 * V2Board 客户端
 */
class V2BoardClient {
  constructor(token, protocol) {
    this.token = token;
    this.protocol = protocol;
    this.authData = null;
    this.systemSettings = null;
    this.userInfo = null;
  }

  login() {
    const adminEmail = process.env.V2BOARD_ADMIN_EMAIL;
    const adminPassword = process.env.V2BOARD_ADMIN_PASSWORD;
    const data = { email: adminEmail, password: adminPassword };

    return new Promise((resolve, reject) => {
      userLogin(data)
        .then((response) => {
          const authData = response.data.data;
          if (authData.is_admin !== 1) {
            reject(new Error("配置文件中的 V2Board 账户不是管理员"));
          }
          this.authData = authData.auth_data;
          resolve(authData.auth_data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  settings() {
    return new Promise((resolve, reject) => {
      systemSettings(this.authData)
        .then((response) => {
          const res = response.data.data;
          this.systemSettings = res;
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async subscribe() {
    return new Promise((resolve, reject) => {
      axios
        .get(this.userInfo.subscribe_url)
        .then((response) => {
          const ssLinks = decodeBase64(response.data);
          const nodes = parseShadowsocksLinks(ssLinks);
          resolve(nodes);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async info() {
    return new Promise((resolve, reject) => {
      const params = `filter[0][key]=token&filter[0][condition]=%3D&filter[0][value]=${this.token}&pageSize=10&current=1&total=1`;
      userInfo(params, this.authData)
        .then((response) => {
          const res = response.data.data[0];
          setUserInfo(res);
          this.userInfo = res;
          resolve(res);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  async nodes() {
    try {
      const response = await userNodes(this.authData);
      const nodesData = response.data.data;
      const { protocol, userInfo } = this;

      const isShadowsocks2022 = protocol === "shadowsocks2022";
      const ssCipher = isShadowsocks2022
        ? "2022-blake3-aes-256-gcm"
        : "chacha20-ietf-poly1305";
      const nodeType = isShadowsocks2022 ? "shadowsocks" : protocol;

      const resultNodes = nodesData.filter((node) => {
        const isTypeMatching = node.type === nodeType;
        const isCipherMatching =
          nodeType !== "shadowsocks" || node.cipher === ssCipher;
        const isParentNonNull = node.parent_id !== null;
        const isGroupMatched = node.group_id.includes(
          String(userInfo.group_id)
        );

        return (
          isTypeMatching &&
          isCipherMatching &&
          isParentNonNull &&
          isGroupMatched
        );
      });

      return resultNodes;
    } catch (error) {
      throw error;
    }
  }

  async fetchResponse() {
    await this.login();
    await this.info();
    const nodes = await this.nodes();
    return nodes;
  }
}

export default V2BoardClient;
