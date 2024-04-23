import React, { Fragment } from 'react';
import { Tooltip, Icon } from 'ming-ui';
import cx from 'classnames';
import { controlState, renderCount } from '../tools/utils';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from '../tools/config';
import { browserIsMobile } from 'src/util';
import _ from 'lodash';
import WidgetsDesc from './WidgetsDesc';
import styled from 'styled-components';
import { TITLE_SIZE_OPTIONS } from 'src/pages/widgetConfig/config/setting';
import { getTitleStyle } from 'src/pages/widgetConfig/util/setting';

const ControlLabel = styled.div`
  ${({ displayRow, disabled, isMobile, titlewidth_app = '100', titlewidth_pc = '100' }) => {
    if (displayRow) {
      if (isMobile && disabled) {
        return `width: ${titlewidth_app}px !important;`;
      }
      return !isMobile ? `width:${titlewidth_pc}px !important;` : '';
    }
  }}
  ${({ hasContent, displayRow, titlewidth_pc }) => {
    if (displayRow && hasContent) {
      return titlewidth_pc === '0' ? 'width: auto !important;padding-right: 10px;' : 'padding-right: 10px;';
    }
  }}
  ${({ displayRow }) => (displayRow ? 'padding-top: 6px !important;padding-bottom: 6px !important;' : '')}
  line-height: ${({ valuesize }) => {
    const valueHeight = valuesize !== '0' ? (parseInt(valuesize) - 1) * 2 + 40 : 36;
    return `${valueHeight - 12}px !important`;
  }}
  margin-top: ${({ item }) => {
    return item.type === 34 ? '20px' : '';
  }};
  ${({ item, isMobile }) =>
    item.type === 34 ? (isMobile ? 'margin-bottom: 6px;' : 'maxWidth: calc(100% - 140px);') : ''}
  .controlLabelName {
    ${({ displayRow, isMobile, disabled, align_app = '1', align_pc = '1' }) => {
      if (displayRow) {
        if (isMobile && disabled) {
          return align_app === '1' ? 'text-align: left;' : 'text-align: right;flex: 1;';
        }
        return !isMobile && align_pc === '1' ? 'text-align: left;' : 'text-align: right;flex: 1;';
      }
    }}
    ${({ showTitle }) => (showTitle ? '' : 'display: none;')}
    font-size: ${props => props.titleSize};
    color: ${props => props.titleColor};
    ${props => props.titleStyle || ''};
  }
  .requiredBtnBox .customFormItemLoading {
    line-height: ${({ valuesize }) => {
      const valueHeight = valuesize !== '0' ? (parseInt(valuesize) - 1) * 2 + 40 : 36;
      return `${valueHeight - 12}px !important`;
    }};
  }
`;

export default ({
  from,
  recordId,
  item,
  errorItems,
  uniqueErrorItems,
  loadingItems,
  widgetStyle = {},
  disabled,
  updateErrorState = () => {},
}) => {
  const {
    hinttype = '0',
    valuesize = '0',
    titlesize = item.type === 34 ? '1' : '0',
    titlestyle = '0000',
    titlecolor = item.type === 34 ? '#333' : '#757575',
    allowlink,
    hidetitle,
  } = item.advancedSetting || {};

  const titleSize = TITLE_SIZE_OPTIONS[titlesize];
  const titleStyle = getTitleStyle(titlestyle);
  const showTitle = _.includes([22, 10010], item.type) ? hidetitle !== '1' && item.controlName : hidetitle !== '1';
  const hintShowAsIcon =
    hinttype === '0'
      ? (recordId && from !== FROM.DRAFT) || item.isSubList || from === FROM.RECORDINFO
      : hinttype === '1';
  const hintShowAsText = hinttype === '0' ? !recordId : hinttype === '2';
  const showDesc = hintShowAsIcon && item.desc && !_.includes([22, 10010], item.type);
  const showOtherIcon = item.type === 45 && allowlink === '1' && item.enumDefault === 1;

  const currentErrorItem = _.find(errorItems.concat(uniqueErrorItems), obj => obj.controlId === item.controlId) || {};
  const errorText = currentErrorItem.errorText || '';
  const isEditable = controlState(item, from).editable;
  let errorMessage = '';
  const isMobile = browserIsMobile();

  if (currentErrorItem.showError && isEditable) {
    if (currentErrorItem.errorType === FORM_ERROR_TYPE.UNIQUE) {
      errorMessage = currentErrorItem.errorMessage || FORM_ERROR_TYPE_TEXT.UNIQUE(item);
    } else {
      errorMessage = errorText || currentErrorItem.errorMessage;
    }
  }

  if (isMobile && !showTitle) {
    return (
      <div className={cx({ 'customFormItemLabel mTop20': item.type === 34 })}>
        {!item.showTitle && item.required && !item.disabled && isEditable && (
          <span
            style={{
              margin: item.desc && !_.includes([FROM.H5_ADD], from) ? '0px 0px 0px -8px' : '0px 0px 0px -13px',
              top: item.desc && !_.includes([FROM.H5_ADD], from) ? '9px' : '15px',
              color: '#f44336',
              position: 'absolute',
            }}
          >
            *
          </span>
        )}

        {item.desc && !_.includes([FROM.H5_ADD], from) && (
          <Tooltip
            text={
              <span
                className="Block"
                style={{
                  maxWidth: 230,
                  maxHeight: 200,
                  overflowY: 'auto',
                  color: '#fff',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {item.desc}
              </span>
            }
            action={['click']}
            popupPlacement={'topLeft'}
            offset={[-12, 0]}
          >
            <i className="icon-workflow_error pointer Font16 Gray_9e mBottom10" />
          </Tooltip>
        )}

        {!item.showTitle && errorMessage && (
          <div className="customFormErrorMessage">
            <span>
              {errorMessage}
              <i className="icon-close mLeft6 Bold delIcon" onClick={() => updateErrorState(false, item.controlId)} />
            </span>
            <i className="customFormErrorArrow" />
          </div>
        )}
      </div>
    );
  }

  return (
    <Fragment>
      {errorMessage && (
        <div className={cx('customFormErrorMessage', { isChildTable: item.type === 34 })}>
          <span>
            {errorMessage}
            <i className="icon-close mLeft6 Bold delIcon" onClick={() => updateErrorState(false, item.controlId)} />
          </span>
          <i className="customFormErrorArrow" />
        </div>
      )}
      <ControlLabel
        className="customFormItemLabel"
        disabled={disabled}
        item={item}
        showTitle={showTitle}
        {...widgetStyle}
        isMobile={isMobile}
        titleSize={titleSize}
        titleStyle={titleStyle}
        titleColor={titlecolor}
        valuesize={valuesize}
        hasContent={showDesc || showOtherIcon || showTitle}
      >
        {loadingItems[item.controlId] ? (
          <div className="requiredBtnBox">
            <i className="icon-loading_button customFormItemLoading Gray_9e" />
          </div>
        ) : (
          item.required &&
          !item.disabled &&
          isEditable && (
            <div className="requiredBtnBox">
              <div className="requiredBtn">*</div>
            </div>
          )
        )}

        <div title={item.controlName} className="controlLabelName">
          {item.controlName}
          {_.get(item, 'advancedSetting.showcount') !== '1' && renderCount(item)}
        </div>

        {hintShowAsIcon && <WidgetsDesc item={item} from={from} />}

        {item.type === 45 && allowlink === '1' && item.enumDefault === 1 && (
          <Tooltip text={<span>{_l('新页面打开')}</span>}>
            <Icon
              className="Hand Font16 mLeft3 Gray_9e mTop3"
              icon="launch"
              onClick={() => {
                if (/^https?:\/\/.+$/.test(item.value)) {
                  window.open(item.value);
                }
              }}
            />
          </Tooltip>
        )}
      </ControlLabel>

      {item.type === 34 && !item.isSubList && hintShowAsText && <WidgetsDesc item={item} from={from} />}
    </Fragment>
  );
};
