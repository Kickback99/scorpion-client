// 定义需要携带 token 的路径列表（即"需要登录认证的接口"）
export const AUTH_REQUIRED_PATHS = [
  '/test',
  '/user/userDetailInfo',
  '/user/favorites',
  '/user/content/article',
  '/user/favorite/toggle',
  '/user/msg/comment/byId',
  '/user/msg/comment/reply',
  '/user/comments/'

  // 订单相关
  /* '/order/',
  '/payment/', */
  // 购物车相关
  // '/cart/',
  // 用户信息相关（除了登录注册）
  /* '/user/profile',
  '/user/update' */
];

// 导出匹配函数
export const isAuthRequired = (url) => {
  return AUTH_REQUIRED_PATHS.some(path => {
    // 如果路径以 '/' 结尾，说明是前缀匹配
    if (path.endsWith('/')) {
      return url.startsWith(path);
    }
    // 否则精确匹配
    return url === path || url.includes(path);
  });
};