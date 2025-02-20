import { generateSurgeShadowSocks2022Password } from "../crypto.js";
import { getUserInfo, getUrl } from "../../constants/index.js";

import { generateGeneralContent } from "./constants.js";

class SurgeConfig {
  constructor(props, protocol, nodes) {
    this.props = props;
    this.protocol = protocol;
    this.nodes = nodes;
    this.userInfo = getUserInfo();
  }

  generateShadowSocksProxyContent() {
    return this.nodes.map((node) => {
      const config = [
        `${node.name}=ss`,
        node.host,
        node.port,
        `encrypt-method=${node.cipher}`,
        `password=${this.userInfo.uuid}`,
        "tfo=true",
        "udp-relay=true",
      ];
      return config.filter(Boolean).join(", ");
    });
  }

  generateShadowSocks2022ProxyContent() {
    return this.nodes.map((node) => {
      const password = generateSurgeShadowSocks2022Password(
        String(node.created_at),
        this.userInfo.uuid
      );

      const config = [
        `${node.name}=ss`,
        node.host,
        node.port,
        `encrypt-method=${node.cipher}`,
        `password=${password}`,
        "tfo=true",
        "udp-relay=true",
      ];
      return config.filter(Boolean).join(", ");
    });
  }

  generateTrojanProxyContent() {
    return this.nodes.map((node) => {
      const config = [
        `${node.name}=trojan`,
        node.host,
        node.port,
        `password=${this.userInfo.uuid}`,
        node.server_name ? `sni=${node.server_name}` : "",
        node.allow_insecure
          ? "skip-cert-verify=true"
          : "skip-cert-verify=false",
        "tfo=true",
        "udp-relay=true",
      ];
      return config.filter(Boolean).join(", ");
    });
  }

  generateVmessProxyContent() {
    return this.nodes.map((node) => {
      const config = [
        `${node.name}=vmess`,
        node.host,
        node.port,
        `username=${this.userInfo.uuid}`,
        "vmess-aead=true",
        "tfo=true",
        "udp-relay=true",
      ];
      return config.filter(Boolean).join(", ");
    });
  }

  generateProxyContent() {
    let proxyEntries = [];

    switch (this.protocol) {
      case "shadowsocks":
        proxyEntries = this.generateShadowSocksProxyContent();
        break;
      case "shadowsocks2022":
        proxyEntries = this.generateShadowSocks2022ProxyContent();
        break;
      case "trojan":
        proxyEntries = this.generateTrojanProxyContent();
        break;
      case "vmess":
        proxyEntries = this.generateVmessProxyContent();
        break;
      default:
        break;
    }

    const direct = `🎯 本地直连=direct`;

    return `[Proxy]\n${proxyEntries.join("\n")}\n${direct}\n`;
  }

  customNodeInfo(emoji, name, areaNodes) {
    return `${emoji ? `${emoji} ` : ""}${name} = select, ${
      emoji ? "🚀 " : ""
    }代理节点, ${Object.keys(areaNodes)
      .map((key) => areaNodes[key].split(" = ")[0])
      .join(", ")}, ${emoji ? "🎯 " : ""}本地直连, include-other-group=${
      emoji ? "📡 " : ""
    }我的节点`;
  }

  generateProxyGroupContent() {
    const { autoCheck, areaGroup, showNode, emoji } = this.props;

    const serverNames = this.nodes.map((node) => node.name).join(", ");
    const createAreaNode = (emojiPrefix, name, regexFilter) =>
      `${emoji ? emojiPrefix : ""}${name} = smart, include-other-group=${
        emoji ? "📡 " : ""
      }我的节点, update-interval=0, no-alert=1, hidden=${
        showNode ? "0" : "1"
      }, include-all-proxies=0, policy-regex-filter=${regexFilter}`;

    const areaNodes = areaGroup
      ? {
          hkNode: createAreaNode("🇭🇰 ", "香港节点", "香港"),
          twNode: createAreaNode("🇨🇳 ", "台湾节点", "台湾"),
          sgNode: createAreaNode("🇸🇬 ", "狮城节点", "狮城"),
          jpNode: createAreaNode("🇯🇵 ", "日本节点", "日本"),
          usNode: createAreaNode("🇺🇲 ", "美国节点", "美国"),
          globalNode: createAreaNode(
            "🇺🇳 ",
            "全球节点",
            "^((?!香港|台湾|日本|狮城|美国).)*$"
          ),
        }
      : {};

    const node = `${emoji ? "🚀 " : ""}代理节点 = select, ${
      autoCheck ? `${emoji ? "🌏 " : ""}自动选择,` : ""
    } ${emoji ? "📡 " : ""}我的节点`;
    const myNode = `${
      emoji ? "📡 " : ""
    }我的节点 = select, include-other-group=${
      emoji ? "📮 " : ""
    }所有节点, include-all-proxies=0`;
    const allNode = `${
      emoji ? "📮 " : ""
    }所有节点 = select, ${serverNames}, hidden=1`;
    const autoCheckNode = `${
      emoji ? "🌏 " : ""
    }自动选择 = smart, include-other-group=${
      emoji ? "📡 " : ""
    }我的节点, update-interval=0, no-alert=1, hidden=${
      showNode ? "0" : "1"
    }, include-all-proxies=0`;

    const microsoftNode = this.customNodeInfo("🪟", "微软服务", areaNodes);
    const googleNode = this.customNodeInfo("🔍", "谷歌服务", areaNodes);
    const appleNode = this.customNodeInfo("🍎", "苹果服务", areaNodes);
    const gameNode = this.customNodeInfo("🎮", "游戏平台", areaNodes);
    const aiNode = this.customNodeInfo("🤖", "人工智能", areaNodes);
    const cryptoNode = this.customNodeInfo("🪙", "加密货币", areaNodes);
    const telegramNode = this.customNodeInfo("📟", "电报信息", areaNodes);
    const mediaNode = this.customNodeInfo("📽️", "国际媒体", areaNodes);
    const fishNode = this.customNodeInfo("🐠", "漏网之鱼", areaNodes);

    return [
      "[Proxy Group]",
      node,
      myNode,
      microsoftNode,
      googleNode,
      appleNode,
      gameNode,
      aiNode,
      cryptoNode,
      telegramNode,
      mediaNode,
      fishNode,
      allNode,
      autoCheck ? autoCheckNode : "",
      ...Object.values(areaNodes),
    ]
      .filter(Boolean)
      .join("\n");
  }

  generateRuleContent() {
    const { emoji } = this.props;
    return `
[Rule]
DOMAIN,smart.media.cloudaria.net,🎯 本地直连
DOMAIN-SUFFIX,halo.do,🚀 代理节点
DOMAIN-SUFFIX,eo-edgefunctions1.com,🎯 本地直连
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Microsoft/Microsoft.list, 🪟 微软服务, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/GitHub/GitHub.list, 🪟 微软服务, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Google/Google.list, 🔍 谷歌服务, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Apple/Apple_All_No_Resolve.list, 🍎 苹果服务, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/GlobalMedia/GlobalMedia_All_No_Resolve.list, 📽️ 国际媒体, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Netflix/Netflix.list, 📽️ 国际媒体, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/TikTok/TikTok.list, 📽️ 国际媒体, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Game/Game.list, 🎮 游戏平台, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Game/GameDownload/GameDownload.list, 🎯 本地直连, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Game/GameDownloadCN/GameDownloadCN.list, 🎯 本地直连, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/OpenAI/OpenAI.list, 🤖 人工智能, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Gemini/Gemini.list, 🤖 人工智能, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Copilot/Copilot.list, 🤖 人工智能, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Claude/Claude.list, 🤖 人工智能, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Crypto/Crypto.list, 🪙 加密货币, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Cryptocurrency/Cryptocurrency.list, 🪙 加密货币, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Telegram/Telegram.list, 📟 电报信息, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Global/Global_All_No_Resolve.list, 🚀 代理节点, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Lan/Lan.list, 🎯 本地直连, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/Download/Download.list, 🎯 本地直连, extended-matching
RULE-SET, https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Surge/ChinaMax/ChinaMax_All_No_Resolve.list, 🎯 本地直连, extended-matching
FINAL, ${emoji ? "🐠 " : ""}漏网之鱼, dns-failed
`;
  }

  generateConfig() {
    const url = getUrl();
    const proxy = this.generateProxyContent();
    const general = generateGeneralContent(url);
    const proxyGroup = this.generateProxyGroupContent();
    const rule = this.generateRuleContent();
    return [general, proxy, proxyGroup, rule].filter(Boolean).join("\n");
  }
}

export default SurgeConfig;
