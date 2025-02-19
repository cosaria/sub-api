const parseShadowsocksLinks = (ssLinks) => {
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
