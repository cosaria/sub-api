import express from "express";
import V2BoardClient from "./utils/auth.js";
import SurgeConfig from "./utils/surge/index.js";
import SurfboardConfig from "./utils/surfboard/index.js";
import ClashConfig from "./utils/clash/index.js";

import { setUrl } from "./constants/index.js";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Halo Converters");
});

app.get("/sub/:token/:protocol", async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  setUrl(url);
  const [platform, protocol] = req.params.protocol.split(":")[1].split("+");

  const client = new V2BoardClient(req.params.token, protocol);
  const nodes = await client.fetchResponse();
  // const subscribeNodes = await client.subscribe();

  const queryParams = {
    emoji:
      req.query.emoji === "false" || req.query.emoji === "0" ? false : true, // 是否显示 emoji
    areaGroup:
      req.query.areaGroup === "false" || req.query.areaGroup === "0"
        ? false
        : true, // 是否地区分组
  };

  if (platform === "surge") {
    const surgeConfig = new SurgeConfig(queryParams, protocol, nodes);
    const config = surgeConfig.generateConfig();
    const fileName = "Halo Cloud.conf";
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(config);
  } else if (platform === "surfboard") {
    const surfboardConfig = new SurfboardConfig(queryParams, protocol, nodes);
    const config = surfboardConfig.generateConfig();
    const fileName = "Halo Cloud.conf";
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(config);
  } else if (platform === "clash") {
    const clashConfig = new ClashConfig(queryParams, protocol, nodes);
    const config = clashConfig.generateConfig();
    const fileName = "Halo Cloud.yaml";
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(config);
  } else {
    const clashConfig = new ClashConfig(queryParams, protocol, nodes);
    const config = clashConfig.generateConfig();
    const fileName = "Halo Cloud.yaml";
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Content-Disposition", `attachment; filename=${fileName}`);
    res.send(config);
  }
});

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
