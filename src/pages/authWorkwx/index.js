import { ajax, login, browserIsMobile, getRequest, checkLogin, formatOtherParam, addOtherParam } from 'src/util/sso';
import { setPssId } from 'src/util/pssId';
import preall from 'src/common/preall';

const { code, state, url, p, ...otherParam } = getRequest();
const isMobile = browserIsMobile();

if (code) {
  if (checkLogin()) {
    if (url) {
      location.href = decodeURIComponent(url);
    } else {
      location.href = isMobile ? `/mobile` : `/app`;
    }
  } else {
    ajax.post({
      url: __api_server__.main + 'Login/WorkWeiXinAppLoginByApp',
      data: {
        code,
        state,
      },
      async: true,
      succees: result => {
        const { accountResult, sessionId } = result.data;
        if (accountResult === 1) {
          preall({ type: 'function' });
          setPssId(sessionId);
          if (url) {
            location.href = decodeURIComponent(url);
          } else {
            location.href = isMobile ? `/mobile` : `/app`;
          }
        }
      },
      error: login,
    });
  }
} else {
  const otherParamString = formatOtherParam(otherParam);
  const newUrl = addOtherParam(url, otherParamString);
  if (checkLogin()) {
    if (newUrl) {
      location.href = newUrl;
    } else {
      location.href = isMobile ? `/mobile` : `/app`;
    }
  } else {
    const hosts = location.host.split('.');
    const projectId = p || hosts[0];
    ajax.post({
      url: __api_server__.main + 'Login/GetWorkWeiXinCorpInfoByApp',
      data: {
        projectId,
      },
      async: true,
      succees: result => {
        const { corpId, agentId, state } = result.data;
        const redirect_uri = encodeURIComponent(
          `${location.origin}/auth/workwx?url=${newUrl ? encodeURIComponent(newUrl) : ''}`,
        );
        location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${corpId}&agentid=${agentId}&redirect_uri=${redirect_uri}&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
      },
      error: login,
    });
  }
}
