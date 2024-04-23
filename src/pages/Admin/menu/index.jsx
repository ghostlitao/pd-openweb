import React, { Component } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { Tooltip, UpgradeIcon } from 'ming-ui';
import Trigger from 'rc-trigger';
import pathToRegexp from 'path-to-regexp';
import { navigateTo } from 'src/router/navigateTo';
import { getFeatureStatus } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import cx from 'classnames';
import './index.less';
import _ from 'lodash';

@withRouter
export default class AdminLeftMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCompanyName: '',
      isExtend: this.props.isExtend,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { projectId },
      },
      location: { pathname },
      menuList,
    } = this.props;
    md.global.Account.projects &&
      md.global.Account.projects.map(item => {
        if (item.projectId === projectId) {
          this.setState({
            currentCompanyName: item.companyName,
          });
        }
      });

    const nav = _.find(menuList, item =>
      _.some(item.subMenuList, it => _.some(it.routes, ({ path }) => pathToRegexp(path).test(pathname))),
    );
    if (pathname.indexOf('home') > -1) {
      this.setState({ userExpand: true });
    }
    if (pathname.indexOf('home') === -1 && !_.isEmpty(nav)) {
      this.setState({ [`${nav.key}Expand`]: true });
    }
  }

  componentWillReceiveProps(nextProps) {
    const {
      location: { pathname },
      menuList,
    } = nextProps;
    const nav = _.find(menuList, item =>
      _.some(item.subMenuList, it => _.some(it.routes, ({ path }) => pathToRegexp(path).test(pathname))),
    );
    if (pathname.indexOf('home') === -1 && !_.isEmpty(nav)) {
      this.setState({ [`${nav.key}Expand`]: true });
    }
  }

  renderLinkItem = ({ icon, name, menuPath, routes, featureId, key, hasBeta = false }, index) => {
    const { subListVisible, isExtend } = this.state;
    const {
      location: { pathname },
      match: {
        params: { projectId },
      },
    } = this.props;
    if (key === 'billinfo' && !md.global.Config.IsPlatformLocal) return;
    if (key === 'weixin' && md.global.SysSettings.hideWeixin) return;
    if (
      key === 'platformintegration' &&
      md.global.SysSettings.hideWorkWeixin &&
      md.global.SysSettings.hideDingding &&
      md.global.SysSettings.hideFeishu &&
      md.global.SysSettings.hideWelink
    )
      return;

    const isActive = () => {
      return _.some(routes, route => pathToRegexp(route.path).test(pathname));
    };
    const route = routes[0] || {};
    const compile = pathToRegexp.compile(menuPath || route.path);
    const path =
      route.path && route.path.indexOf(':projectId') === -1 ? compile({ 0: projectId }) : compile({ projectId });
    let featureType = getFeatureStatus(projectId, featureId);
    const isHome = key === 'home';
    if (_.includes(['analytics', 'applog', 'computing'], key) && !featureType) return;

    const platIntegrationUpgrade = _.every(
      [
        VersionProductType.workwxIntergration,
        VersionProductType.dingIntergration,
        VersionProductType.feishuIntergration,
        VersionProductType.WelinkIntergration,
      ],
      item => getFeatureStatus(projectId, item) === '2',
    );

    const licenseType = (md.global.Account.projects.find(o => o.projectId === projectId) || {}).licenseType;
    const isFreeUpgrade = licenseType === 0 && _.includes(['groups', 'orgothers'], key);

    return (
      <li className={cx('item', { active: isActive() && subListVisible })}>
        <NavLink
          to={path}
          className={isHome ? 'pLeft12' : 'pLeft40'}
          activeClassName={cx('activeItem bold', { activeExtend: isExtend })}
          isActive={isActive}
          onClick={() => this.setState({ subListVisible: false, menuGroupKey: null })}
        >
          {icon && <i className={cx('Font20 Gray mRight10 homeIcon', icon)} />}
          {!isExtend && key === 'home' ? (
            ''
          ) : (
            <div className="subName">
              {name}
              {hasBeta && <i className="icon-beta1 betaIcon" />}
              {(featureType === '2' || (key === 'platformintegration' && platIntegrationUpgrade) || isFreeUpgrade) && (
                <UpgradeIcon />
              )}
            </div>
          )}
        </NavLink>
      </li>
    );
  };

  handleTransition() {
    this.setState(
      {
        isExtend: !this.state.isExtend,
      },
      () => {
        safeLocalStorageSetItem('adminList_isUp', this.state.isExtend);
      },
    );
  }

  render() {
    const { currentCompanyName, isExtend, subListVisible, menuGroupKey } = this.state;
    const { menuList = [], match, location } = this.props;
    const { params } = match;
    const { pathname } = location;
    const { isSuperAdmin } = md.global.Account.projects.find(v => v.projectId === params.projectId) || {};

    return (
      <div id="menuList" className={cx(isExtend ? 'extendList' : 'closeList')}>
        <div className="ThemeBGColor9 h100 Relative menuContainer">
          <div className="title">
            <div
              className="companyName Hand"
              onClick={() => {
                navigateTo(`/admin/home/${params.projectId}`);
              }}
            >
              {currentCompanyName}
            </div>
            <Tooltip
              popupPlacement="right"
              offset={[10, 0]}
              text={<span>{isExtend ? _l('隐藏侧边栏') : _l('展开侧边栏')}</span>}
            >
              <span
                className={cx('Hand Font12 ThemeColor9 titleIconBox Block', isExtend ? 'icon-back-02' : 'icon-next-02')}
                onClick={this.handleTransition.bind(this)}
              ></span>
            </Tooltip>
          </div>
          <div className="listContainer pTop8 pBottom30">
            {isExtend
              ? menuList
                  .filter(it => (isSuperAdmin ? true : !_.includes(['logs'], it.key)))
                  .map((item, index) => {
                    const { key, title, icon, subMenuList = [] } = item;

                    return (
                      <div key={index} className={cx({ Hidden: !subMenuList.length })}>
                        {title ? (
                          <div
                            className="subTitle flexRow alignItemsCenter Hand"
                            onClick={() => {
                              this.setState({ [`${key}Expand`]: !this.state[`${key}Expand`] });
                            }}
                          >
                            <i className={cx('Font20 Gray mRight10', icon)} />
                            <span className="flex">{title}</span>
                            <i
                              className={cx('expandIcon Font16 Gray_75 mRight12', {
                                'icon-arrow-up-border': !this.state[`${key}Expand`],
                                'icon-arrow-down-border': this.state[`${key}Expand`],
                              })}
                            />
                          </div>
                        ) : (
                          _.map(subMenuList, this.renderLinkItem)
                        )}
                        {key === 'home' ? (
                          ''
                        ) : (
                          <ul
                            className="manageItems overflowHidden"
                            style={{
                              height: !this.state[`${key}Expand`]
                                ? 0
                                : key === 'organization' && !md.global.Config.IsPlatformLocal
                                ? (subMenuList.length - 1) * 48
                                : subMenuList.length * 48,
                            }}
                          >
                            {_.map(subMenuList, this.renderLinkItem)}
                          </ul>
                        )}
                      </div>
                    );
                  })
              : menuList
                  .filter(it => (isSuperAdmin ? true : !_.includes(['logs'], it.key)))
                  .map(item => {
                    const { key, title, icon, subMenuList = [] } = item;
                    const currentPathNames = _.reduce(
                      subMenuList,
                      (result, { routes = [] }) => {
                        let temp = routes.map(r => r.path);
                        return result.concat(temp);
                      },
                      [],
                    );

                    return (
                      <div key={key} className={cx({ Hidden: !subMenuList.length })}>
                        {key === 'home' ? (
                          _.map(subMenuList, this.renderLinkItem)
                        ) : (
                          <Trigger
                            action={['click']}
                            popupVisible={subListVisible && menuGroupKey === key}
                            onPopupVisibleChange={visible => this.setState({ subListVisible: visible })}
                            popup={
                              <div className="hoverMenuWrap">
                                <div className="Gray_9e Font12 pLeft20 mBottom10">{title}</div>
                                <ul className="manageItems overflowHidden" style={{ height: subMenuList.length * 48 }}>
                                  {_.map(subMenuList, this.renderLinkItem)}
                                </ul>
                              </div>
                            }
                            popupAlign={{
                              points: ['tr', 'br'],
                              offset: [-40, -40],
                              overflow: { adjustX: true, adjustY: true },
                            }}
                          >
                            <div
                              className={cx('shrinkNav flexRow alignItemsCenter Hand', {
                                activeSubTitle: _.some(currentPathNames, path => pathToRegexp(path).test(pathname)),
                              })}
                              onMouseEnter={() => this.setState({ subListVisible: true, menuGroupKey: key })}
                            >
                              <i className={cx('Font20 Gray mRight10', icon)} />
                            </div>
                          </Trigger>
                        )}
                      </div>
                    );
                  })}
          </div>
        </div>
      </div>
    );
  }
}
