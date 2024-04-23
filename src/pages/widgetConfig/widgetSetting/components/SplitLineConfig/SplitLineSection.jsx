import React, { useState, useEffect, useRef } from 'react';
import { Icon } from 'ming-ui';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/setting';
import { SectionItemWrap } from './style';
import SvgIcon from 'src/components/SvgIcon';
import WidgetStatus from 'src/pages/widgetConfig/widgetDisplay/components/WidgetStatus.jsx';
import { browserIsMobile } from 'src/util';
import { getExpandWidgetIds } from './config';
import { controlState } from 'src/components/newCustomFields/tools/utils.js';
import cx from 'classnames';
import _ from 'lodash';

export default function SplitLineSection(props) {
  // fromType = 'display' 表单详情
  const {
    data,
    sectionstyle,
    widgets = [],
    activeWidget = {},
    totalErrors = [],
    from,
    fromType,
    renderData = [],
    setNavVisible,
  } = props;
  const { enumDefault2 = 0, controlName, controlId } = data;
  const { theme = '#2196f3', color = '#333', icon = '', hidetitle } = getAdvanceSetting(data);
  const isMobile = browserIsMobile();
  const [visible, setVisible] = useState(enumDefault2 !== 2);
  const curControls = fromType === 'display' ? renderData : _.flatten(widgets);
  const expandWidgetIds = getExpandWidgetIds(curControls, data, from);
  const $ref = useRef();
  let $originIds = useRef([]);

  useEffect(() => {
    handleExpand(enumDefault2 !== 2);
    $originIds.current = expandWidgetIds;
  }, [controlId]);

  useEffect(() => {
    if (totalErrors.length > 0) {
      const visibleErrors = totalErrors
        .filter(i => _.includes(expandWidgetIds, i.controlId) && i.showError)
        .filter(i => {
          const currentControl = _.find(renderData, da => da.controlId === i.controlId);
          return controlState(currentControl, from).visible && controlState(currentControl, from).editable;
        });
      if (visibleErrors.length > 0 && !visible) {
        handleExpand(true);
      }
    }
  }, [totalErrors]);

  useEffect(() => {
    if (_.isEqual($originIds.current, expandWidgetIds)) return;
    $originIds.current = expandWidgetIds;
    handleExpand(visible);
  }, [expandWidgetIds]);

  const handleExpand = tempVisible => {
    if (hidetitle === '1' && enumDefault2 == 0) return;
    // 不折叠不能点击
    if (enumDefault2 === 0) return;
    const currentVisible = _.isUndefined(tempVisible) ? !visible : tempVisible;
    if (expandWidgetIds.length > 0) {
      setVisible(currentVisible);
      const tempIds = currentVisible ? expandWidgetIds : expandWidgetIds.reverse();

      for (var i = 0; i < expandWidgetIds.length; i++) {
        (function (i) {
          const timer = setTimeout(() => {
            const listItem =
              fromType === 'display'
                ? ($($ref.current).parents().find(`.customFormItem#formItem-${tempIds[i]}`) || [])[0]
                : document.getElementById(`widget-${tempIds[i]}`);
            if (listItem) {
              if (currentVisible) {
                $(listItem).slideDown(80, 'swing', () => (listItem.style.overflow = 'unset'));
              } else {
                $(listItem).slideUp(80, 'swing', () => (listItem.style.overflow = 'unset'));
              }
              clearTimeout(timer);
              if (listItem.nextElementSibling && listItem.nextElementSibling.className === 'customFormLine') {
                listItem.nextElementSibling.style.display = currentVisible ? 'flex' : 'none';
              }
            }
          }, 100);
        })(i);
      }

      if (_.isFunction(setNavVisible)) {
        setNavVisible();
      }
    }
  };

  const renderIcon = () => {
    // 隐藏标题+不折叠
    if (hidetitle === '1' && enumDefault2 == 0) return null;

    if (sectionstyle === '1') {
      return <div className="rangeIcon"></div>;
    }

    if (sectionstyle === '2' && enumDefault2 !== 0) {
      return (
        <span className="headerArrowIcon">
          <Icon icon="sidebar_video_tutorial" />
        </span>
      );
    }

    if (icon) {
      const { iconUrl } = safeParse(icon || '{}');
      return (
        <SvgIcon
          url={iconUrl}
          fill={theme}
          size={isMobile ? 18 : 20}
          className={cx('Width20', { mRight5: !isMobile, mRight3: isMobile })}
          style={{ flexShrink: 0 }}
        />
      );
    }
    return null;
  };

  return (
    <SectionItemWrap
      theme={theme}
      color={color}
      visible={visible}
      ref={$ref}
      sectionstyle={sectionstyle}
      enumDefault2={enumDefault2}
      hidetitle={hidetitle === '1'}
      className={isMobile ? 'mobileSectionItemWrap' : ''}
      onClick={() => {
        //先激活在折叠
        if (fromType !== 'display' && _.get(activeWidget, 'controlId') !== controlId) return;
        handleExpand();
      }}
    >
      <div className={cx('titleBox', { alignItemsCenter: isMobile })}>
        {renderIcon()}
        <div className="titleText">
          {hidetitle !== '1' && controlName}
          {fromType !== 'display' && (
            <WidgetStatus
              data={data}
              showTitle={hidetitle !== '1'}
              style={{ display: 'inline-block', verticalAlign: 'middle', marginTop: '-2px' }}
            />
          )}
        </div>
      </div>

      {enumDefault2 !== 0 && sectionstyle !== '2' && expandWidgetIds.length > 0 && (
        <div className="headerArrow">
          <div className="iconBox">
            <Icon icon="arrow-down-border" />
          </div>
        </div>
      )}
    </SectionItemWrap>
  );
}
