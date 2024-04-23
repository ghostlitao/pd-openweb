import React from 'react';
import { LoadDiv, Tooltip, Checkbox, RadioGroup } from 'ming-ui';
import accountSetting from 'src/api/accountSetting';
import cx from 'classnames';
import './index.less';
import langConfig from 'src/common/langConfig';
import common from '../common';
import _ from 'lodash';

const configs = [
  // {
  //  id: 'wechartnotice',
  //  label: _l('微信通知'),
  //  component: 'weixinSwitch',
  // },
  {
    label: _l('语言设置'),
    component: 'languague',
  },
];

export default class AccountChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // / 隐私设置，加我好友的类型
      joinFriendMode: 1,
      // 手机号是否仅自己可见
      isPrivateMobile: false,
      // 邮箱是否仅自己可见
      isPrivateEmail: false,
      loading: false,
      disabledSetLanguage: false,
    };
  }

  componentDidMount() {
    this.getData();
  }

  getData() {
    this.setState({ loading: true });
    accountSetting.getAccountSettings({}).then(data => {
      this.setState({
        joinFriendMode: data.joinFriendMode,
        isPrivateMobile: data.isPrivateMobile,
        isPrivateEmail: data.isPrivateEmail,
        isOpenMessageSound: data.isOpenMessageSound,
        isOpenMessageTwinkle: data.isOpenMessageTwinkle,
        backHomepageWay: data.backHomepageWay,
        loading: false,
      });
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
        localStorage.removeItem('accountSettings');
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

  //语言设置
  languague = () => {
    return (
      <div className="languagueSetting">
        {langConfig.map(item => {
          return (
            <div
              className={cx('languagueItem', {
                active: (getCookie('i18n_langtag') || md.global.Config.DefaultLang) === item.key,
              })}
              onClick={() => {
                if (this.state.disabledSetLanguage) return;
                if (!md.global.Account.isPortal) {
                  this.setState({ disabledSetLanguage: true });
                  const settingValue = { 'zh-Hans': '0', en: '1', ja: '2', 'zh-Hant': '3' };
                  accountSetting
                    .editAccountSetting({ settingType: '6', settingValue: settingValue[item.key] })
                    .then(res => {
                      if (res) {
                        setCookie('i18n_langtag', item.key);
                        window.location.reload();
                      }
                    })
                    .fail(err => {
                      this.setState({ disabledSetLanguage: false });
                    });
                } else {
                  setCookie('i18n_langtag', item.key);
                  window.location.reload();
                }
              }}
            >
              {item.value}
            </div>
          );
        })}
      </div>
    );
  };

  render() {
    if (this.state.loading) {
      return <LoadDiv className="mTop40" />;
    }
    return (
      <div className="systemSettingsContainer">
        <div className="mTop24 Gray Font15 Bold">{_l('偏好设置')}</div>
        {configs.map((item, index) => {
          return (
            <div className="systemSettingItem" key={index}>
              <div className="systemSettingsLabel Gray_75">{item.label}</div>
              <div className="systemSettingsRight">{this[item.component]()}</div>
            </div>
          );
        })}
        <div className="systemSettingItem borderNoe">
          <div className="systemSettingsLabel Gray_75">{_l('浏览器新消息通知')}</div>
          <div className="systemSettingsRight">
            <div className="Gray_75 mBottom16">{_l('当有新消息时以何种方式提醒')}</div>
            <div className="mBottom16">
              <Checkbox
                checked={this.state.isOpenMessageSound}
                onClick={isOpenMessageSound => {
                  this.sureSettings('isOpenMessageSound', !isOpenMessageSound ? 1 : 0, () => {
                    window.isOpenMessageSound = !isOpenMessageSound;
                    this.setState({
                      isOpenMessageSound: !isOpenMessageSound,
                    });
                  });
                }}
              >
                {_l('通知音')}
              </Checkbox>
            </div>
            <div>
              <Checkbox
                checked={this.state.isOpenMessageTwinkle}
                onClick={isOpenMessageTwinkle => {
                  this.sureSettings('isOpenMessageTwinkle', !isOpenMessageTwinkle ? 1 : 0, () => {
                    window.isOpenMessageTwinkle = !isOpenMessageTwinkle;
                    this.setState({
                      isOpenMessageTwinkle: !isOpenMessageTwinkle,
                    });
                  });
                }}
              >
                {_l('浏览器标签闪烁')}
              </Checkbox>
            </div>
          </div>
        </div>
        <div className="systemSettingItem borderNoe">
          <div className="systemSettingsLabel Gray_75">{_l('应用返回首页方式')}</div>
          <div className="systemSettingsRight">
            <RadioGroup
              size="middle"
              className="mBottom20"
              vertical={true}
              data={[
                {
                  text: _l('点击直接返回'),
                  value: 1,
                },
                {
                  text: _l('悬停时先侧滑打开应用列表'),
                  value: 2,
                }
              ]}
              checkedValue={this.state.backHomepageWay}
              onChange={value => {
                this.sureSettings('backHomepageWay', value, () => {
                  window.backHomepageWay = value;
                  this.setState({
                    backHomepageWay: value
                  });
                });
              }}
            ></RadioGroup>
          </div>
        </div>
      </div>
    );
  }
}
