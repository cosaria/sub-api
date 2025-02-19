// 模块级变量（私有）
let state = {
  userInfo: null,
};

export function setUserInfo(userInfo) {
  state.userInfo = userInfo;
}

export function getUserInfo() {
  return state.userInfo;
}
