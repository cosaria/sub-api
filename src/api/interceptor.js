import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

// 创建 axios 实例
const instance = axios.create({
  baseURL: process.env.V2BOARD_HOST,
  timeout: 10000,
});

instance.interceptors.request.use(
  (config) => {
    const authToken = process.env.V2BOARD_AUTH_TOKEN;
    if (authToken) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.authorization = authToken;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
