// 模块级变量（私有）
let state = {
  userInfo: null,
  url: null,
};

export function setUserInfo(userInfo) {
  state.userInfo = userInfo;
}

export function getUserInfo() {
  return state.userInfo;
}

export function setUrl(url) {
  state.url = url;
}

export function getUrl() {
  return state.url;
}
