import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Checkbox, Dropdown } from 'ming-ui';
import { formatViewToDropdown } from '../../../util';
import { SheetViewWrap } from '../../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

// 高级设置
export default function RelateSearchOperate(props) {
  const { data, onChange } = props;
  const { enumDefault2 = 1, controlId, viewId } = data;
  let { allowlink, openview = '' } = getAdvanceSetting(data);
  const { loading, views = [] } = window.subListSheetConfig[controlId] || {};
  const selectedViewIsDeleted = !loading && viewId && !_.find(views, sheet => sheet.viewId === viewId);
  const selectedOpenViewIsDelete = !loading && openview && !_.find(views, sheet => sheet.viewId === openview);
  const disableOpenViewDrop = !openview && viewId && !selectedViewIsDeleted;

  return (
    <Fragment>
      <div className="labelWrap">
        <Checkbox
          className="allowSelectRecords "
          size="small"
          text={_l('允许新增记录')}
          checked={enumDefault2 !== 1}
          onClick={checked => {
            onChange({ enumDefault2: checked ? 1 : 0 });
          }}
        />
      </div>
      <div className="labelWrap">
        <Checkbox
          size="small"
          text={_l('允许打开记录')}
          checked={+allowlink}
          onClick={checked =>
            onChange(handleAdvancedSettingChange(data, { allowlink: +!checked, openview: checked ? '' : openview }))
          }
        />
      </div>
      {+allowlink ? (
        <SheetViewWrap>
          <div className="viewCon">{_l('视图')}</div>
          <Dropdown
            border
            className="flex"
            cancelAble={!disableOpenViewDrop}
            loading={loading}
            placeholder={
              selectedOpenViewIsDelete || selectedViewIsDeleted ? (
                <span className="Red">{_l('已删除')}</span>
              ) : viewId && !selectedViewIsDeleted ? (
                _l('按关联视图配置')
              ) : (
                _l('未设置')
              )
            }
            disabled={disableOpenViewDrop}
            data={formatViewToDropdown(views)}
            value={openview && !selectedOpenViewIsDelete ? openview : undefined}
            onChange={value => {
              onChange(handleAdvancedSettingChange(data, { openview: value }));
            }}
          />
        </SheetViewWrap>
      ) : null}
    </Fragment>
  );
}
