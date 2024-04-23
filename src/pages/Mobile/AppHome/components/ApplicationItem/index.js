import React from 'react';
import { Icon } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import AppStatus from 'src/pages/AppHomepage/AppCenter/components/AppStatus';
import { generateRandomPassword, addBehaviorLog } from 'src/util';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import { transferExternalLinkUrl } from 'src/pages/AppHomepage/AppCenter/utils';
import styled from 'styled-components';
import cx from 'classnames';

const AppItemWrap = styled.div`
  display: flex;
  align-items: center;
  background-color: #f8f8f8;
  border-radius: 8px;
  width: calc(50% - 5px);
  height: 56px;
  margin-bottom: 10px;
  padding-left: 12px;
  position: relative;
  .iconWrap {
    width: ${({ radius }) => radius + 'px'};
    height: ${({ radius }) => radius + 'px'};
    border-radius: 50%;
    color: #fff;
    font-size: 32px;
    text-align: center;
    margin-right: 10px;
  }
  .appName {
    min-width: 0;
    padding-right: 10px;
    .name {
      font-size: 14px;
      &.app {
        word-break: break-all;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        line-height: 18px;
      }
    }
  }
  .appStatusWrap {
    right: -8px;
    top: -10px;
    bottom: unset;
    left: unset;
  }
`;

export default function ApplicationItem(props) {
  const { data = {}, direction = 'vertical', ...rest } = props;
  const {
    id,
    createType,
    urlTemplate,
    projectId,
    icon,
    iconUrl,
    iconColor = '#2196f3',
    navColor,
    lightColor,
    appStatus,
    fixed,
    isGoodsStatus,
    isNew,
    name,
    type,
    itemName,
    itemId,
    itemUrl,
    sectionId,
    onClick,
  } = data || {};
  const black = '#1b2025' === navColor;
  const light = [lightColor, '#ffffff', '#f5f6f7'].includes(navColor);
  const isUpgrade = appStatus === 4;

  const { className, index, iconSize, radius = 40 } = rest;

  // 应用/应用项 水平显示
  if (direction === 'horizontal') {
    return (
      <AppItemWrap
        radius={radius}
        className={cx(`appItem ${className}`, { mRight10: index % 2 === 0 })}
        key={id}
        onClick={() => {
          if (!!type) {
            //应用项
            addBehaviorLog(type === 2 ? 'worksheet' : 'customPage', itemId); // 埋点
            window.mobileNavigateTo(`/mobile/recordList/${id}/${sectionId}/${itemId}`);
            return;
          }
          addBehaviorLog('app', id); // 埋点
          if (createType === 1) {
            e.stopPropagation();
            e.preventDefault();
            window.open(transferExternalLinkUrl(urlTemplate, projectId, id));
            return;
          }
          localStorage.removeItem('currentNavWorksheetId');
          safeLocalStorageSetItem('currentGroupInfo', JSON.stringify({}));
          window.mobileNavigateTo(`/mobile/app/${id}`);
        }}
      >
        <div
          className="iconWrap"
          style={{ backgroundColor: !!type ? getRgbaByColor(navColor || iconColor, 0.08) : navColor || iconColor }}
        >
          {iconUrl ? (
            <SvgIcon
              url={!!type ? itemUrl : iconUrl}
              fill={!!type ? navColor || iconColor : black || light ? iconColor : '#fff'}
              size={iconSize || 30}
              addClassName="mTop7"
            />
          ) : (
            <Icon icon={icon} className="Font30" />
          )}
        </div>
        <div className="appName flex">
          <div className={cx('name', { app: !type, ellipsis: !!type })}>{!!type ? itemName : name}</div>
          {!!type && <div className="des ellipsis Font12 Gray_9">{name}</div>}
        </div>
        {id === 'add' || (!fixed && !isUpgrade && !isNew) ? null : (
          <AppStatus
            className="appStatusWrap"
            isGoodsStatus={isGoodsStatus}
            isNew={isNew}
            fixed={fixed}
            isUpgrade={isUpgrade}
          />
        )}
      </AppItemWrap>
    );
  }

  return (
    <div className="myAppItemWrap InlineBlock" key={`${data.id}-${generateRandomPassword(10)}`}>
      <div
        className="myAppItem mTop24"
        onClick={e => {
          if (id !== 'add') {
            addBehaviorLog('app', id); // 埋点
          }
          if (createType === 1) {
            e.stopPropagation();
            e.preventDefault();
            window.open(transferExternalLinkUrl(urlTemplate, projectId, id));
            return;
          }
          localStorage.removeItem('currentNavWorksheetId');
          safeLocalStorageSetItem('currentGroupInfo', JSON.stringify({}));
          onClick ? onClick() : window.mobileNavigateTo(`/mobile/app/${id}`);
        }}
      >
        <div className="myAppItemDetail TxtCenter Relative" style={{ backgroundColor: navColor || iconColor }}>
          {iconUrl ? (
            <SvgIcon url={iconUrl} fill={black || light ? iconColor : '#fff'} size={32} addClassName="mTop12" />
          ) : (
            <Icon icon={icon} className="Font30" />
          )}
          {id === 'add' || (!fixed && !isUpgrade && !isNew) ? null : (
            <AppStatus isGoodsStatus={isGoodsStatus} isNew={isNew} fixed={fixed} isUpgrade={isUpgrade} />
          )}
        </div>
        <span className="breakAll LineHeight16 Font13 mTop10 contentText" style={{ WebkitBoxOrient: 'vertical' }}>
          {name}
        </span>
      </div>
    </div>
  );
}
