// GeneralContent
export const generateGeneralContent = (
  url
) => `#!MANAGED-CONFIG ${url} interval=43200 strict=true

[General]
// > 日志级别
loglevel = notify
// > 监听地址
http-listen = 0.0.0.0:6888
socks5-listen = 0.0.0.0:6889
// 展示错误页面
show-error-page-for-reject = true
// > 允许Wi-Fi访问
allow-wifi-access = true
wifi-access-http-port = 6888
wifi-access-socks5-port = 6889

// > All Hybrid 网络并发
all-hybrid = false
// > IPv6 支持
ipv6 = ture
ipv6-vif = auto
// > 测试超时
test-timeout = 6
// > Internet 测试 URL
internet-test-url = http://connectivitycheck.platform.hicloud.com/generate_204
// > 代理测速 URL
proxy-test-url = http://www.google.com/generate_204
// 游戏优化: 开启后优先处理 UDP 数据，会增加系统负载
udp-priority = false
// > 当节点不支持UDP时，默认fallback 到reject
udp-policy-not-supported-behaviour = REJECT
// > DNS 服务器
dns-server = 223.5.5.5, 119.29.29.29
// DNS 劫持
hijack-dns = 8.8.8.8:53, 8.8.4.4:53
// > 排除简单主机名
exclude-simple-hostnames = true
// > GeoIP数据库
geoip-maxmind-url = https://raw.githubusercontent.com/Hackl0us/GeoIP2-CN/release/Country.mmdb
// > 从 /etc/hosts 读取 DNS 记录
read-etc-hosts = true
// > 远程控制器
http-api-web-dashboard = true
use-default-policy-if-wifi-not-primary = false
`;
