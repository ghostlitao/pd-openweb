import moment from 'moment';

/**
 * 设置 md_pss_id
 * @param {string} id
 */
export const setPssId = (id, verification = false) => {
  if (id) {
    const userAgent = window.navigator.userAgent.toLowerCase();

    if (md.global.Config.IsLocal && md.global.Config.SessionCookieExpireMinutes) {
      const expireDate = moment()
        .add(md.global.Config.SessionCookieExpireMinutes, 'm')
        .toDate();
      window.setCookie('md_pss_id', id, expireDate);
    } else if (
      verification ||
      userAgent.includes('dingtalk') ||
      userAgent.includes('miniprogram') ||
      location.href.indexOf('localhost') > -1
    ) {
      window.setCookie('md_pss_id', id);
    }

    if (window.top !== window.self || md.global.Config.HttpOnly) {
      safeLocalStorageSetItem('md_pss_id', id);
    }
  }
};

/**
 * 获取 md_pss_id
 * @returns {string} md_pss_id
 */
export const getPssId = () => {
  const storagePssId = window.localStorage.getItem('md_pss_id');
  const cookiePssId = window.getCookie('md_pss_id');

  return cookiePssId || storagePssId;
};

/**
 * 删除 md_pss_id
 */
export const removePssId = () => {
  window.delCookie('md_pss_id');
  window.localStorage.removeItem('md_pss_id');
};
