import React, { Fragment } from 'react';
import './index.less';
import account from 'src/api/account';
import accountSetting from 'src/api/accountSetting';
import accountGuideController from 'src/api/accountGuide';
import { Checkbox, Select } from 'antd';
import { LoadDiv, Tooltip, Dialog } from 'ming-ui';
import EditPassword from './EditPassword';
import { initBindAcoount } from '../components/InitBindAccountDialog';
import { validateFunc } from '../components/ValidateInfo';
import accountController from 'src/api/account';
import cx from 'classnames';
import captcha from 'src/components/captcha';
import common from '../common';
import { encrypt } from 'src/util';

let accountList = [
  { key: 'weiXinBind', icon: 'icon-wechat', color: 'weiBindColor', label: _l('微信') },
  { key: 'qqBind', icon: 'icon-qq', color: 'qqBindColor', label: _l('QQ') },
  { key: 'workBind', color: 'workBindColor', needHide: true },
];

const tipsConfig = {
  mobilePhone: _l(
    '绑定手机号作为你的登录账号。同时也是管理个人账户和使用系统服务的重要依据。为便于您以后的操作及账户安全，请您尽快绑定。',
  ),
  isTwoauthentication: _l('两步验证是在输入账号密码后，额外增加一道安全屏障（手机短信或邮箱验证码），保障您的帐号安全'),
};

const ERROR_MESSAGE = {
  0: _l('解绑失败'),
  5: _l('解绑失败，账号不存在'),
  6: _l('解绑失败，密码错误'),
  7: _l('解绑失败，邮箱和手机，请至少保留其一'),
};

const TPType = {
  weiXinBind: 1,
  qqBind: 2,
};

const WORKBINDOPTION = state => {
  switch (state) {
    case 1:
      return { icon: 'icon-invite-ding', label: _l('钉钉') };
    case 2:
    case 3:
      return { icon: 'icon-enterprise_wechat', label: _l('企业微信') };
    case 4:
      return { icon: 'icon-welink', label: _l('Welink') };
    case 5:
    case 6:
      return { icon: 'icon-feishu', label: _l('飞书') };
  }
};
export default class AccountChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      mobilePhone: '',
      qqBind: { isBind: false },
      weiXinBind: { isBind: false },
      workBind: { isBind: false },
      loading: false,
      joinFriendMode: 1,
      isVerify: false,
      isPrivateMobile: false,
      isPrivateEmail: false,
      needInit: false, //是否需要初始化
      showWarn: true,
      isTwoauthentication: false,
      wxQRCodeLoading: true,
      editPasswordVisible: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData = () => {
    this.setState({ loading: true });
    $.when(this.getAccount(), this.getInfo()).then((account, info) => {
      this.setState({
        email: account.email,
        isVerify: account.isVerify,
        mobilePhone: account.mobilePhone,
        isHavePrj: account.isHavePrj,
        qqBind: account.qqBind,
        weiXinBind: account.weiXinBind,
        workBind: account.workBind,
        needInit: account.isIntergration && !account.mobilePhone,
        joinFriendMode: info.joinFriendMode,
        isPrivateMobile: info.isPrivateMobile,
        isPrivateEmail: info.isPrivateEmail,
        isTwoauthentication: info.isTwoauthentication,
        loading: false,
      });
    });
  };

  getAccount() {
    return account.getAccountInfo({});
  }

  getInfo() {
    return accountSetting.getAccountSettings({});
  }

  //微信或qq绑定
  handleBind(type) {
    const currentType = this.state[type] || {};
    if (!currentType.state) {
      if (type === 'weiXinBind') {
        var url = '/qrcode';
        var wWidth = 400;
        var wHeight = 400;
        var positionObj = this.getWindowPosition(wWidth, wHeight);
        this.showNewWindow(url, wWidth, wHeight, positionObj.left, positionObj.top);
      } else {
        var url = 'http://tp.mingdao.com/qq/authRequest';
        var wWidth = 750;
        var wHeight = 500;
        var positionObj = this.getWindowPosition(wWidth, wHeight);
        this.showNewWindow(url, wWidth, wHeight, positionObj.left, positionObj.top);
      }
    } else {
      const text = type === 'weiXinBind' ? _l('微信') : 'QQ';
      Dialog.confirm({
        title: _l('解绑%0', text),
        description: _l('确认解绑%0，解绑之后不能通过%1登录？', text, text),
        onOk: () => this.cancelBindAccount(currentType.state, type),
      });
    }
  }

  //微信或qq解绑
  cancelBindAccount(state, type) {
    account
      .unBindAccount({
        state: state,
        tpType: TPType[type],
      })
      .then(data => {
        if (data) {
          this.setState({
            [type]: { isBind: false },
          });
        } else {
          alert(_l('取消绑定失败'), 2);
        }
      })
      .fail();
  }

  showNewWindow(url, width, height, left, top) {
    window.open(
      url,
      'newWindow',
      'width=' +
        width +
        ',height=' +
        height +
        ',left=' +
        left +
        ',top=' +
        top +
        ',toolbar=no,menubar=no,scrollbars=no,resizable=no,location=no, status=no',
    );
  }

  getWindowPosition(width, height) {
    return {
      top: ($(window).height() - height) / 2,
      left: ($(window).width() - width) / 2,
    };
  }

  // 绑定账号（邮箱和手机）
  handleBindAccount(type) {
    validateFunc({
      title: type === 'email' ? _l('绑定邮箱') : _l('绑定手机号码'),
      type,
      des: '您需要先绑定手机号，才能继续创建组织',
      showStep: true,
      callback: function () {
        location.reload();
      },
    });
  }

  // 解绑账号（邮箱和手机）
  handleUnBindAccount(type) {
    const { email, mobilePhone, isVerify } = this.state;
    if (!(mobilePhone && email && isVerify)) {
      alert(_l('无法解绑，邮箱和手机，请至少保留其一'), 2);
      return;
    }
    validateFunc({
      title: type === 'email' ? _l('解绑邮箱') : _l('解绑手机号'),
      type,
      callback: ({ password }) => {
        accountController[type === 'email' ? 'unbindEmail' : 'unbindMobile']({
          password: encrypt(password),
        }).then(data => {
          if (data === 1) {
            location.reload();
          } else {
            alert(ERROR_MESSAGE[data], 2);
          }
        });
      },
    });
  }

  // 修改帐号
  handleChangeAccount(type) {
    validateFunc({
      title: type === 'email' ? _l('修改邮箱') : _l('修改手机号码'),
      type,
      showStep: true,
      callback: function () {
        location.reload();
      },
    });
  }

  // common修改
  sureSettings(settingNum, value, successCallback) {
    accountSetting
      .editAccountSetting({
        settingType: common.settingOptions[settingNum],
        settingValue: value,
      })
      .then(data => {
        if (data) {
          alert(_l('设置成功'));
          if (_.isFunction(successCallback)) {
            successCallback();
          }
        } else {
          alert(_l('操作失败'), 2);
        }
      })
      .fail();
  }

  // 隐私设置
  joinFriend = () => {
    return (
      <Fragment>
        <div className="LineHeight36 accountJoinFrirndBox">
          <span className="InlineBlock accountLabel Gray_75">{_l('添加我的方式')}</span>
          <Select
            value={this.state.joinFriendMode}
            onChange={joinFriendMode =>
              this.sureSettings('joinFriendMode', joinFriendMode, () => {
                this.setState({ joinFriendMode });
              })
            }
          >
            <Select.Option value={0}>{_l('允许任何人')}</Select.Option>
            <Select.Option value={1}>{_l('需要身份验证')}</Select.Option>
            <Select.Option value={2}>{_l('不允许任何人')}</Select.Option>
          </Select>
        </div>
        <div className="mTop32 flexRow">
          <span className="InlineBlock accountLabel Gray_75">{_l('手机和邮箱')}</span>
          <span className="flexColumn">
            <Checkbox
              className="Gray"
              checked={this.state.isPrivateMobile}
              onChange={e => {
                const isPrivateMobile = e.target.checked;
                this.sureSettings('isPrivateMobile', isPrivateMobile, () => {
                  this.setState({ isPrivateMobile });
                });
              }}
            >
              {_l('手机号仅自己可见')}
            </Checkbox>
            <Checkbox
              className="Gray"
              checked={this.state.isPrivateEmail}
              onChange={e => {
                const isPrivateEmail = e.target.checked;
                this.sureSettings('isPrivateEmail', isPrivateEmail, () => {
                  this.setState({ isPrivateEmail });
                });
              }}
            >
              {_l('邮箱仅自己可见')}
            </Checkbox>
          </span>
        </div>
      </Fragment>
    );
  };

  // 取消绑定手机或邮箱红点提示
  handleCancelRed(type) {
    accountGuideController
      .setAccountGuide({
        userGuideSetting: common.guideType[type],
      })
      .then(() => {
        window.location.reload();
      });
  }

  //验证邮箱
  handleReviewEmail() {
    var throttled = _.throttle(
      function(res) {
        if (res.ret === 0) {
          account
            .sendProjectBindEmail({
              ticket: res.ticket,
              randStr: res.randstr,
              captchaType: md.global.getCaptchaType(),
            })
            .then(function(data) {
              if (data) {
                alert(_l('发送成功'));
              } else {
                alert(_l('发送失败'), 2);
              }
            });
        }
      },
      10000,
      { leading: true },
    );

    if (md.global.getCaptchaType() === 1) {
      new captcha(throttled);
    } else {
      new TencentCaptcha(md.global.Config.CaptchaAppId.toString(), throttled).show();
    }
  }

  //提示框
  renderWarning() {
    const { needInit, showWarn } = this.state;
    return (
      <div className={cx('initPasswordWarning', { Hidden: !(needInit && showWarn) })}>
        <span className="warnColor">
          <span className="icon-error1 Font16 mRight8 TxtMiddle" />
          <span>{_l('建议您绑定手机号，绑定后可以直接在官网和 App 登录')}</span>
        </span>
        <span className="icon-clear Font16 ThemeHoverColor3 Hand" onClick={() => this.setState({ showWarn: false })} />
      </div>
    );
  }

  renderTips = key => {
    return (
      <Tooltip popupPlacement="top" text={<span>{tipsConfig[key]}</span>}>
        <span className="icon-novice-circle Gray_bd Hand mLeft5 Font15" />
      </Tooltip>
    );
  };

  renderRedDot = (isShow, key) => {
    return (
      <span
        className={cx('Right Gray_9e Hover_49 Hand redDot', { Hidden: !isShow })}
        onClick={() => this.handleCancelRed(key)}
      >
        {_l('取消红点提示')}
      </span>
    );
  };

  // 注销
  dealLoagout = () => {
    account.validateLogoffAccount().then(res => {
      if (res === 1) {
        location.href = '/cancellation';
      } else if (res === 20) {
        alert(_l('您是平台唯一管理员，无法注销'), 2);
      } else if (res === 30) {
        alert(_l('您尚有未退出的组织，请先至 个人中心-我的组织 退出所有组织，方可注销'), 2);
      }
    });
  };

  render() {
    const { email, mobilePhone, loading, isVerify, needInit, workBind = {}, editPasswordVisible } = this.state;
    const mobilePhoneWarnLight = md.global.Account.guideSettings.accountMobilePhone && !mobilePhone;
    const emailWarnLight = md.global.Account.guideSettings.accountEmail && (!email || !isVerify);

    if (workBind.isBind) {
      const workBindDetail = WORKBINDOPTION(Number(workBind.state)) || {};
      accountList = accountList.map(item => (item.key === 'workBind' ? { ...item, ...workBindDetail } : item));
    }

    if (loading) {
      return <LoadDiv className="mTop40" />;
    }
    return (
      <div className="accountChartContainer">
        <div className="Font17 Bold Gray mBottom40">{_l('账户')}</div>
        {this.renderWarning()}
        <div className="accountRowItem clearfix">
          <div className="accountLabel Gray_75">
            {_l('手机')}
            {!mobilePhone && this.renderTips('mobilePhone')}
          </div>
          <span>
            <span className="Gray Relative">
              {mobilePhone || _l('未绑定')}
              {mobilePhoneWarnLight && <span className="warnLight warnLightMEPosition warnLightPhone" />}
            </span>
            {mobilePhone ? (
              <Fragment>
                <span
                  className="Hand ThemeColor3 Hover_49 mLeft24 mRight24"
                  onClick={() => this.handleChangeAccount('mobile')}
                >
                  {_l('修改')}
                </span>
                <span className="Hand ThemeColor3 Hover_49" onClick={() => this.handleUnBindAccount('mobile')}>
                  {_l('解绑')}
                </span>
              </Fragment>
            ) : (
              <span
                className="Hand ThemeColor3 Hover_49 mLeft24"
                onClick={() => {
                  if (needInit) {
                    initBindAcoount({
                      title: _l('绑定手机号'),
                      showFooter: false,
                      getData: this.getData,
                    });
                  } else {
                    this.handleBindAccount('mobile');
                  }
                }}
              >
                {_l('绑定')}
              </span>
            )}
          </span>
          {this.renderRedDot(mobilePhoneWarnLight, 'accountMobilePhone')}
        </div>
        {needInit ? null : (
          <Fragment>
            <div className="accountRowItem clearfix">
              <div className="accountLabel Gray_75">{_l('邮箱')}</div>
              <span>
                <span className="Gray Relative">
                  {email ? (
                    <span>
                      <span className={cx(isVerify ? '' : 'Gray_9e mRight12')}>{email}</span>
                      {!isVerify && <span>{_l('未验证')}</span>}
                    </span>
                  ) : (
                    _l('未绑定')
                  )}
                  {emailWarnLight ? <span className="warnLight warnLightMEPosition warnLightEmail" /> : null}
                </span>
                {email ? (
                  <Fragment>
                    <span
                      className="Hand ThemeColor3 Hover_49 mLeft24 mRight24"
                      onClick={() => this.handleChangeAccount('email')}
                    >
                      {_l('修改')}
                    </span>
                    {isVerify ? (
                      <span className="Hand ThemeColor3 Hover_49" onClick={() => this.handleUnBindAccount('email')}>
                        {_l('解绑')}
                      </span>
                    ) : (
                      <span className="Hand ThemeColor3 Hover_49" onClick={() => this.handleReviewEmail()}>
                        {_l('验证')}
                      </span>
                    )}
                  </Fragment>
                ) : (
                  <span className="Hand ThemeColor3 Hover_49 mLeft24" onClick={() => this.handleBindAccount('email')}>
                    {_l('绑定')}
                  </span>
                )}
              </span>
              {this.renderRedDot(emailWarnLight, 'accountEmail')}
            </div>
            <div className="accountRowItem">
              <div className="accountLabel Gray_75">{_l('密码')}</div>
              <span className="Hand ThemeColor3 Hover_49" onClick={() => this.setState({ editPasswordVisible: true })}>
                {_l('修改')}
              </span>
            </div>
          </Fragment>
        )}
        {!md.global.Config.IsLocal && (
          <div className="accountRowItem">
            <div className="accountLabel Gray_75">{_l('账号绑定')}</div>
            {accountList.map(({ key, label, color, icon, needHide = false }, index) => {
              const data = this.state[key] || {};
              return (
                <span className={cx({ mLeft80: index, Hidden: needHide && !data.isBind })}>
                  <span className={cx('Font16', icon, data.isBind ? color : 'Gray_9e')}></span>
                  <span className="Gray mLeft12">{label}</span>
                  {data.isBind && <span className="mLeft8 Gray_9e">{_l('已绑定：%0', data.nickName)}</span>}
                  {!needHide && (
                    <span className="Hand ThemeColor3 Hover_49 mLeft24" onClick={() => this.handleBind(key)}>
                      {data.isBind ? _l('解绑') : _l('绑定')}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
        )}
        {md.global.Config.IsPlatformLocal && (
          <div className="accountRowItem">
            <div className="accountLabel Gray_75">{_l('账户注销')}</div>
            <div className="logout Hand" onClick={this.dealLoagout}>
              {_l('注销')}
            </div>
          </div>
        )}
        <div className="Font17 Bold Gray mBottom40 mTop20">{_l('隐私')}</div>
        {this.joinFriend()}
        <Dialog
          title={_l('修改密码')}
          showFooter={false}
          visible={editPasswordVisible}
          onCancel={() => this.setState({ editPasswordVisible: false })}
          className="editPasswordDialogId"
        >
          <EditPassword closeDialog={() => this.setState({ editPasswordVisible: false })} />
        </Dialog>
      </div>
    );
  }
}
