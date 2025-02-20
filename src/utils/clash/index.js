import { generateSurgeShadowSocks2022Password } from "../crypto.js";
import { getUserInfo, getUrl } from "../../constants/index.js";

import { generateGeneralContent } from "./constants.js";

class ClashConfig {
  constructor(props, protocol, nodes) {
    this.props = props;
    this.protocol = protocol;
    this.nodes = nodes;
    this.userInfo = getUserInfo();
  }

  generateShadowSocksProxyContent() {
    return this.nodes.map((node) => {
      return `  - { name: ${node.name}, type: ss, server: ${node.host}, port: ${node.port}, cipher: ${node.cipher}, password: ${this.userInfo.uuid}, udp: true }`;
    });
  }

  generateShadowSocks2022ProxyContent() {
    return this.nodes.map((node) => {
      const password = generateSurgeShadowSocks2022Password(
        String(node.created_at),
        this.userInfo.uuid
      );
      return `  - { name: ${node.name}, type: ss, server: ${node.host}, port: ${node.port}, cipher: ${node.cipher}, password: ${password}, udp: true }`;
    });
  }
  generateTrojanProxyContent() {
    return this.nodes.map((node) => {
      return `  - { name: ${node.name}, type: trojan, server: ${
        node.host
      }, port: ${node.port}, password: ${this.userInfo.uuid}, ${
        node.server_name ? `sni=${node.server_name}` : ""
      }, ${
        node.allow_insecure ? "skip-cert-verify=true" : "skip-cert-verify=false"
      }, udp: true }`;
    });
  }
  generateVmessProxyContent() {
    return this.nodes.map((node) => {
      return `  - { name: ${node.name}, type: vmess, server: ${node.host}, port: ${node.port}, uuid: ${this.userInfo.uuid}, alterId: 0, cipher: auto, udp: true }`;
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

    return `proxies:\n${proxyEntries.join("\n")}\n`;
  }

  customNodeInfo(emojiPrefix, name, type = "select") {
    const serverNames = this.nodes.map((node) => node.name).join(", ");

    return `  - { name: ${
      this.props.emoji ? emojiPrefix : ""
    }${name}, type: ${type}, proxies: [${serverNames}] }`;
  }

  generateProxyGroupContent() {
    const { autoCheck, areaGroup, showNode, emoji } = this.props;

    const createAreaNode = (emojiPrefix, name, regexFilter) => {
      return `- { name: ${
        emoji ? emojiPrefix : ""
      }${name}, type: url-test, proxies: [], url: https://www.gstatic.com/generate_204, interval: 300, tolerance: 50, timeout: 5000, max-failed-times: 5, lazy: false, hidden: true }`;
    };

    const areaNodes = areaGroup
      ? {
          hkNode: createAreaNode("🇭🇰 ", "香港节点", "香港"),
          twNode: createAreaNode("🇨🇳 ", "台湾节点", "台湾"),
          sgNode: createAreaNode("🇸🇬 ", "狮城节点", "狮城"),
          jpNode: createAreaNode("🇯🇵 ", "日本节点", "日本"),
          usNode: createAreaNode("🇺🇲 ", "美国节点", "美国"),
        }
      : {};

    const proxyNode = this.customNodeInfo("🚀 ", "代理节点");
    const myNode = this.customNodeInfo("📡 ", "我的节点");
    const microsoftNode = this.customNodeInfo("🪟 ", "微软服务");
    const googleNode = this.customNodeInfo("🔍 ", "谷歌服务");
    const appleNode = this.customNodeInfo("🍎 ", "苹果服务");
    const gameNode = this.customNodeInfo("🎮 ", "游戏平台");
    const aiNode = this.customNodeInfo("🤖 ", "人工智能");
    const cryptoNode = this.customNodeInfo("🪙 ", "加密货币");
    const telegramNode = this.customNodeInfo("📟 ", "电报信息");
    const mediaNode = this.customNodeInfo("📽️ ", "国际媒体");
    const fishNode = this.customNodeInfo("🐠 ", "漏网之鱼");
    const autoNode = this.customNodeInfo("🌏 ", "自动选择", "url-test");

    const directNode = `  - { name: 🎯 本地直连, type: select, proxies: [DIRECT], hidden: true }`;

    return [
      "proxy-groups:",
      proxyNode,
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
      autoNode,
      directNode,
    ]
      .filter(Boolean)
      .join("\n");
  }

  customRuleProviderInfo(name, url) {
    return `  ${name}: { type: http, behavior: classical, format: yaml, interval: 86400, url: ${url}, path: ./RuleProviders/${name}.yaml }`;
  }

  generateRuleProvidersContent() {
    const Microsoft = this.customRuleProviderInfo(
      "Microsoft",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Microsoft/Microsoft.yaml"
    );

    const GitHub = this.customRuleProviderInfo(
      "GitHub",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/GitHub/GitHub.yaml"
    );

    const Google = this.customRuleProviderInfo(
      "Google",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Google/Google.yaml"
    );

    const Apple = this.customRuleProviderInfo(
      "Apple",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Apple/Apple_All_No_Resolve.yaml"
    );

    const GlobalMedia = this.customRuleProviderInfo(
      "GlobalMedia",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/GlobalMedia/GlobalMedia_All_No_Resolve.yaml"
    );

    const Netflix = this.customRuleProviderInfo(
      "Netflix",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Netflix/Netflix.yaml"
    );

    const TikTok = this.customRuleProviderInfo(
      "TikTok",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/TikTok/TikTok.yaml"
    );

    const Game = this.customRuleProviderInfo(
      "Game",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Game/Game.yaml"
    );

    const GameDownload = this.customRuleProviderInfo(
      "GameDownload",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Game/GameDownload.yaml"
    );

    const GameDownloadCN = this.customRuleProviderInfo(
      "GameDownloadCN",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Game/GameDownloadCN.yaml"
    );

    const OpenAI = this.customRuleProviderInfo(
      "OpenAI",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/OpenAI/OpenAI.yaml"
    );

    const Gemini = this.customRuleProviderInfo(
      "Gemini",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Gemini/Gemini.yaml"
    );

    const Copilot = this.customRuleProviderInfo(
      "Copilot",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Copilot/Copilot_No_Resolve.yaml"
    );

    const Claude = this.customRuleProviderInfo(
      "Claude",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Claude/Claude_No_Resolve.yaml"
    );

    const Crypto = this.customRuleProviderInfo(
      "Crypto",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Crypto/Crypto_No_Resolve.yaml"
    );

    const Cryptocurrency = this.customRuleProviderInfo(
      "Cryptocurrency",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Cryptocurrency/Cryptocurrency_No_Resolve.yaml"
    );

    const Telegram = this.customRuleProviderInfo(
      "Telegram",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Telegram/Telegram_No_Resolve.yaml"
    );

    const Global = this.customRuleProviderInfo(
      "Global",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Global/Global_All_No_Resolve.yaml"
    );

    const Lan = this.customRuleProviderInfo(
      "Lan",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Lan/Lan_All_No_Resolve.yaml"
    );

    const Download = this.customRuleProviderInfo(
      "Download",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/Download/Download_All_No_Resolve.yaml"
    );

    const ChinaMax = this.customRuleProviderInfo(
      "ChinaMax",
      "https://cdn.jsdelivr.net/gh/blackmatrix7/ios_rule_script@master/rule/Clash/ChinaMax/ChinaMax_All_No_Resolve.yaml"
    );

    return [
      "rule-providers:",
      Microsoft,
      GitHub,
      Google,
      Apple,
      GlobalMedia,
      Netflix,
      TikTok,
      Game,
      GameDownload,
      GameDownloadCN,
      OpenAI,
      Gemini,
      Copilot,
      Claude,
      Crypto,
      Cryptocurrency,
      Telegram,
      Global,
      Lan,
      Download,
      ChinaMax,
    ]
      .filter(Boolean)
      .join("\n");
  }

  generateRulesContent() {
    return `rules:
  - DOMAIN-SUFFIX,halo.do,🚀 代理节点
  - DOMAIN-SUFFIX,eo-edgefunctions1.com,🎯 本地直连
  - RULE-SET,Microsoft,🪟 微软服务, extended-matching
  - RULE-SET,GitHub,🪟 微软服务, extended-matching
  - RULE-SET,Google,🔍 谷歌服务, extended-matching
  - RULE-SET,Apple,🍎 苹果服务, extended-matching
  - RULE-SET,GlobalMedia,📽️ 国际媒体, extended-matching
  - RULE-SET,Netflix,📽️ 国际媒体, extended-matching
  - RULE-SET,TikTok,📽️ 国际媒体, extended-matching
  - RULE-SET,Game,🎮 游戏平台, extended-matching
  - RULE-SET,GameDownload,🎯 本地直连, extended-matching
  - RULE-SET,GameDownloadCN,🎯 本地直连, extended-matching
  - RULE-SET,OpenAI,🤖 人工智能, extended-matching
  - RULE-SET,Gemini,🤖 人工智能, extended-matching
  - RULE-SET,Copilot,🤖 人工智能, extended-matching
  - RULE-SET,Claude,🤖 人工智能, extended-matching
  - RULE-SET,Crypto,🪙 加密货币, extended-matching
  - RULE-SET,Cryptocurrency,🪙 加密货币, extended-matching
  - RULE-SET,Global,🚀 代理节点, extended-matching
  - RULE-SET,Lan,🎯 本地直连, extended-matching
  - RULE-SET,Download,🎯 本地直连, extended-matching
  - RULE-SET,ChinaMax,🎯 本地直连, extended-matching
  - MATCH,🐠 漏网之鱼
`;
  }

  generateConfig() {
    const url = getUrl();
    const general = generateGeneralContent(url);
    const proxy = this.generateProxyContent();
    const proxyGroup = this.generateProxyGroupContent();
    const ruleProviders = this.generateRuleProvidersContent();
    const rules = this.generateRulesContent();
    return [general, proxy, proxyGroup, ruleProviders, rules]
      .filter(Boolean)
      .join("\n");
  }
}

export default ClashConfig;
