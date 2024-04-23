import React, { Fragment, useEffect, useState } from 'react';
import { isEmpty } from 'lodash';
import { useSetState } from 'react-use';
import { Dropdown, RadioGroup } from 'ming-ui';
import { Tooltip } from 'antd';
import Trigger from 'rc-trigger';
import SortColumns from 'src/pages/worksheet/components/SortColumns/SortColumns';
import styled from 'styled-components';
import cx from 'classnames';
import { handleAdvancedSettingChange, getControlsSorts, getAdvanceSetting } from '../../util/setting';
import Sort from 'src/pages/widgetConfig/widgetSetting/components/sublist/Sort';
import { getSortData } from 'src/pages/worksheet/util';
import { EditInfo, SettingItem } from '../../styled';
import { WHOLE_SIZE } from '../../config/Drag';
import worksheetAjax from 'src/api/worksheet';
import { toEditWidgetPage, getFilterRelateControls } from '../../util';
import { SYSTEM_CONTROL } from '../../config/widget';
import { FilterItemTexts } from '../components/FilterData';
import { RELATION_SEARCH_DISPLAY } from '../../config/setting';
import { SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { RelateSearchWorksheet, relateSearchWorksheet } from '../components/relationSearch/relateSearchWorksheet';
import WidgetRowHeight from '../components/WidgetRowHeight';
import InputValue from 'src/pages/widgetConfig/widgetSetting/components/WidgetVerify/InputValue.jsx';

const FILL_TYPES = [
  {
    text: _l('填满'),
    value: '0',
  },
  {
    text: _l('完整显示'),
    value: '1',
  },
];

const RelateSheetWrap = styled.div`
  .filterBtn {
    color: #9e9e9e;
    &:hover {
      color: #2196f3;
    }
  }
`;

const RelateSheetCover = styled.div`
  display: flex;
  .sortColumnWrap {
    flex: 1;
    .Dropdown--input {
      border-right: none;
      border-radius: 3px 0px 0px 3px;
    }
  }
  .relateCoverSetting {
    width: 36px;
    height: 36px;
    border-radius: 0px 3px 3px 0px;
    border: 1px solid #ccc;
    text-align: center;
    &:hover {
      background: #f5f5f5;
    }
    .coverIcon {
      color: #9e9e9e;
      line-height: 34px;
      &.active {
        color: #2196f3;
      }
    }
  }
`;

const CoverWrap = styled.div`
  width: 308px;
  max-height: 350px;
  overflow-x: hidden;
  background: #ffffff;
  box-shadow: 0px 4px 12px 1px rgba(0, 0, 0, 0.1608);
  padding: 16px;
  .coverTitle {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .coverType {
    display: Inline-block;
    border-radius: 3px 0px 0px 3px;
    border: 1px solid #ddd;
    padding: 6px 18px;
    color: #757575;
    &.active {
      color: #2196f3;
      border-color: #2196f3;
    }
    &:last-child {
      border-radius: 0px 3px 3px 0px;
    }
  }
`;

export default function RelationSearch(props) {
  let { data, onChange, allControls, globalSheetInfo, deleteWidget, status: { saveIndex } = {} } = props;
  const {
    controlId,
    enumDefault = 1,
    showControls,
    relationControls = [],
    dataSource,
    coverCid,
    sourceControlId,
  } = data;
  let { showtype = String(enumDefault), covertype = '0', maxcount } = getAdvanceSetting(data);
  const resultFilters = getAdvanceSetting(data, 'resultfilters');
  const sorts = _.isArray(getAdvanceSetting(data, 'sorts')) ? getAdvanceSetting(data, 'sorts') : [];

  const [sortVisible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [{ worksheetInfo = {}, views = [], controls = [] }, setData] = useSetState({
    worksheetInfo: {},
    views: [],
    controls: [],
  });

  useEffect(() => {
    if (!dataSource) return;
    setLoading(true);
    worksheetAjax
      .getWorksheetInfo({ worksheetId: dataSource, getTemplate: true, getViews: true })
      .then(res => {
        const { views, template } = res;
        setData({
          worksheetInfo: res,
          views,
          controls: _.get(template, 'controls') || [],
        });
      })
      .always(() => {
        setLoading(false);
      });
  }, [controlId, dataSource, saveIndex]);

  const isDeleteWorksheet = !loading && !_.isEmpty(worksheetInfo) && _.isEmpty(controls);

  const filterControls = getFilterRelateControls(relationControls);
  const titleControl = _.find(filterControls, item => item.attribute === 1);
  const isSheetDisplay = () => {
    return showtype === '2';
  };

  useEffect(() => {
    //  切换控件手动更新
    if (!loading && !isEmpty(controls) && worksheetInfo.worksheetId === dataSource) {
      // 缓存一份接口数据使用
      window.subListSheetConfig[controlId] = {
        loading,
        sheetInfo: worksheetInfo,
        views,
        controls,
      };
      onChange({
        relationControls: controls,
        sourceEntityName: worksheetInfo.name,
        showControls: getShowControls(controls),
      });
    }
  }, [loading]);

  const getShowControls = (reControls, needDefault) => {
    if (_.isEmpty(showControls) && needDefault) return reControls.slice(0, 4).map(item => item.controlId);
    // 删除掉showControls 中已经被删掉的控件
    const allControlId = reControls.map(item => item.controlId);
    return showControls
      .map(id => {
        if (!allControlId.includes(id)) return '';
        return id;
      })
      .filter(item => !isEmpty(item));
  };

  const getGhostControlId = () => {
    if (isSheetDisplay() || !titleControl) return [];
    return [titleControl.controlId];
  };

  const renderCover = () => {
    return (
      <CoverWrap>
        <div className="coverTitle">
          <span className="Bold">{_l('封面')}</span>
          {coverCid && (
            <span
              className="Gray_9e Hover_21 Hand"
              onClick={() => onChange({ ...handleAdvancedSettingChange(data, { covertype: '0' }), coverCid: '' })}
            >
              {_l('清除')}
            </span>
          )}
        </div>
        <div className="Gray_9e mTop10">{_l('选择作为封面图片的附件字段')}</div>
        <RadioGroup
          radioItemClassName="mTop10"
          disabled={!dataSource}
          checkedValue={coverCid}
          data={filterControls
            .filter(c => c.type === 14 || (c.type === 30 && c.sourceControl && c.sourceControl.type === 14))
            .map(c => ({
              text: c.controlName,
              value: c.controlId,
            }))}
          vertical={true}
          onChange={value => onChange({ coverCid: value })}
        />
        <div className="flexCenter mTop20">
          <span className="Gray_75 mRight20">{_l('填充方式')}</span>
          {FILL_TYPES.map(item => {
            return (
              <span
                className={cx('coverType Hand', { active: item.value === covertype })}
                onClick={() => onChange(handleAdvancedSettingChange(data, { covertype: item.value }))}
              >
                {item.text}
              </span>
            );
          })}
        </div>
      </CoverWrap>
    );
  };

  const relateSearchPara = {
    globalSheetInfo,
    data,
    deleteWidget,
    allControls,
    sheetName: worksheetInfo.name,
    appId: worksheetInfo.appId,
    isDeleteWorksheet,
    onOk: ({ sheetId, resultFilters, relationControls, sourceControlId, sheetName }) => {
      onChange({
        ...handleAdvancedSettingChange(data, {
          resultfilters: JSON.stringify(resultFilters),
          sorts: sheetId !== dataSource ? '[{"controlId":"ctime","isAsc":true}]' : JSON.stringify(sorts),
        }),
        dataSource: sheetId,
        controlName: sheetName,
        sourceControlId,
        relationControls,
        showControls: getShowControls(getFilterRelateControls(relationControls), true),
      });
    },
  };

  return (
    <RelateSheetWrap>
      {!dataSource ? (
        <RelateSearchWorksheet {...relateSearchPara} />
      ) : (
        <Fragment>
          <SettingItem>
            <div className="settingItemTitle">{_l('查询工作表')}</div>
            <EditInfo
              className={cx('pointer', { borderError: isDeleteWorksheet })}
              onClick={() => relateSearchWorksheet(relateSearchPara)}
            >
              {isDeleteWorksheet ? (
                <div className="Red">{_l('工作表已删除')}</div>
              ) : (
                <div className="overflow_ellipsis Gray">
                  <span
                    className="ThemeColor3 ThemeHoverColor2 Hand Bold"
                    onClick={e => {
                      e.stopPropagation();
                      toEditWidgetPage({ sourceId: dataSource, fromURL: 'newPage' });
                    }}
                  >
                    {worksheetInfo.name}
                  </span>
                  {sourceControlId && (
                    <span>
                      （{_l('关联当前')} <span class="Bold"> {globalSheetInfo.name} </span>）
                    </span>
                  )}
                </div>
              )}
              <div className="edit">
                <i className="icon-edit"></i>
              </div>
            </EditInfo>
          </SettingItem>
          <SettingItem>
            <div className="settingItemTitle">{_l('查询条件')}</div>
            {isDeleteWorksheet ? (
              <EditInfo className="disabled"></EditInfo>
            ) : (
              <Fragment>
                {!isEmpty(resultFilters) && (
                  <FilterItemTexts
                    {...props}
                    filters={resultFilters}
                    loading={loading}
                    controls={controls}
                    allControls={allControls.concat([
                      {
                        controlId: 'current-rowid',
                        controlName: _l('当前记录'),
                        dataSource: globalSheetInfo.worksheetId,
                        type: 29,
                      },
                      ...SYSTEM_CONTROL,
                    ])}
                    editFn={() =>
                      relateSearchWorksheet({
                        relateType: 'filter',
                        data,
                        globalSheetInfo,
                        allControls,
                        sheetName: worksheetInfo.name,
                        ..._.pick(worksheetInfo, ['projectId', 'appId']),
                        onOk: ({ resultFilters }) => {
                          onChange(handleAdvancedSettingChange(data, { resultfilters: JSON.stringify(resultFilters) }));
                        },
                      })
                    }
                  />
                )}
              </Fragment>
            )}
          </SettingItem>
        </Fragment>
      )}

      <SettingItem>
        <div className="settingItemTitle">{_l('显示方式')}</div>
        <Dropdown
          border
          value={showtype}
          data={RELATION_SEARCH_DISPLAY}
          onChange={value => {
            onChange({
              ...handleAdvancedSettingChange(data, {
                showtype: value,
                maxcount: value === '3' && (parseInt(maxcount) || parseInt(maxcount) === 0) > 50 ? '50' : maxcount,
                ...(value === '2' ? { titlesize: '', titlestyle: '', titlecolor: '', hidetitle: '0' } : {}),
              }),
              size: value === '2' ? WHOLE_SIZE : data.size,
            });
          }}
        />
      </SettingItem>
      {showtype !== '3' && (
        <SettingItem>
          <div className="settingItemTitle mBottom8">
            <span style={{ fontWeight: 'normal' }}>{_l('显示字段')}</span>
            {enumDefault === 1 && (
              <Tooltip
                className="hoverTip"
                title={
                  <span>
                    {_l('在卡片中，最多可显示9个所选字段。在选择已有记录进行关联时，可以查看所有选择的字段。')}
                  </span>
                }
                popupPlacement="bottom"
              >
                <i className="icon icon-help pointer Gray_bd Font15" />
              </Tooltip>
            )}
          </div>
          <RelateSheetCover>
            <SortColumns
              empty={<div />}
              min1msg={_l('至少显示一列')}
              noempty={false}
              ghostControlIds={getGhostControlId()}
              showControls={showControls}
              columns={filterControls}
              controlsSorts={getControlsSorts(data, filterControls)}
              onChange={({ newShowControls, newControlSorts }) => {
                onChange(
                  _.assign(
                    {},
                    handleAdvancedSettingChange(data, {
                      controlssorts: JSON.stringify(newControlSorts),
                    }),
                    {
                      showControls: newShowControls,
                    },
                  ),
                );
              }}
            />
            <Trigger
              popup={renderCover}
              action={['click']}
              popupAlign={{
                points: ['tr', 'br'],
                offset: [0, 2],
                overflow: { adjustX: true, adjustY: true },
              }}
              getPopupContainer={() => document.body}
            >
              <div className="relateCoverSetting tip-bottom" data-tip={_l('设置封面')}>
                <span className={cx('icon-picture coverIcon Font22 Hand', { active: !!coverCid })}></span>
              </div>
            </Trigger>
          </RelateSheetCover>
        </SettingItem>
      )}
      {isSheetDisplay() && <WidgetRowHeight {...props} />}
      {relationControls.length > 0 && (
        <SettingItem>
          <div className="settingItemTitle">{_l('排序')}</div>
          <EditInfo className="pointer" onClick={() => setVisible(true)}>
            <div className="overflow_ellipsis Gray">
              {sorts.length > 0
                ? sorts.reduce((p, item) => {
                    const sortsRelationControls = relationControls
                      .filter(column => !_.find(SYSTEM_CONTROLS, c => c.controlId === column.controlId))
                      .concat(SYSTEM_CONTROLS);
                    const control = sortsRelationControls.find(({ controlId }) => item.controlId === controlId) || {};
                    const flag = item.isAsc === true ? 2 : 1;
                    const { text } = getSortData(control.type, control).find(item => item.value === flag);
                    const value = control.controlId ? `${control.controlName}：${text}` : '';
                    return p ? `${p}；${value}` : value;
                  }, '')
                : _l('创建时间-最旧的在前')}
            </div>
            <div className="edit">
              <i className="icon-edit"></i>
            </div>
          </EditInfo>
          {sortVisible && <Sort {...props} controls={relationControls} onClose={() => setVisible(false)} />}
        </SettingItem>
      )}
      <SettingItem>
        <div className="settingItemTitle">{_l('查询数量')}</div>
        <div className="labelWrap flexCenter">
          <InputValue
            value={maxcount || undefined}
            className="w100 Font13"
            type={2}
            placeholder={showtype === '3' ? 50 : _l('全部')}
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { maxcount: `${value}` }));
            }}
            onBlur={value => {
              if (showtype === '3' && (parseInt(value) === 0 || parseInt(value) > 50)) {
                value = 50;
              } else if (showtype !== '3' && !parseInt(value)) {
                value = '';
              }
              onChange(handleAdvancedSettingChange(data, { maxcount: `${value}` }));
            }}
          />
        </div>
      </SettingItem>
    </RelateSheetWrap>
  );
}
