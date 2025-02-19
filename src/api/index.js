import dotenv from "dotenv";

import instance from "./interceptor.js";

dotenv.config();
const adminPath = process.env.V2BOARD_ADMIN_PATH;
export function userLogin(data) {
  return instance.post(`/passport/auth/login`, data);
}

export function systemSettings(authData) {
  return instance.get(`/${adminPath}/config/fetch`, {
    headers: { Authorization: authData },
  });
}

export function userInfo(params, authData) {
  return instance.get(`/${adminPath}/user/fetch?${params}`, {
    headers: { Authorization: authData },
  });
}

export function userNodes(authData) {
  return instance.get(`/${adminPath}/server/manage/getNodes`, {
    headers: { Authorization: authData },
  });
}
