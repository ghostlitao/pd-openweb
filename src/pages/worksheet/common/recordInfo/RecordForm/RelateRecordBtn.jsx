import React, { Fragment, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import cx from 'classnames';
import { Menu, MenuItem } from 'ming-ui';
import { isEmpty } from 'lodash';

const Con = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const MenuCon = styled.div`
  position: absolute;
`;

export const Button = styled.div`
  overflow: hidden;
  display: inline-flex;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  color: #333;
  border: 1px solid #dddddd;
  font-size: 13px;
  .content {
    padding: 0 16px;
    display: inline-flex;
    align-items: center;
    font-weight: bold;
    > .icon {
      color: #9e9e9e;
      font-weight: normal;
    }
  }
  &:not(.disabled) {
    .content:hover {
      background-color: #f5f5f5;
    }
  }
  &.disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: transparent;
  }
`;

const DropIcon = styled.span`
  position: relative;
  display: inline-block;
  width: 36px;
  text-align: center;
  cursor: pointer;
  color: #333;
  height: 34px;
  &:hover {
    background-color: #f5f5f5;
  }
  &:before {
    position: absolute;
    content: '';
    width: 1px;
    height: 16px;
    top: 10px;
    left: -0.5px;
    background-color: #ddd;
  }
`;

const Splitter = styled.span`
  width: 0;
  height: 18px;
  border-right: 1px solid #ddd;
  margin: 0 14px 0 14px;
`;

export default function RelateRecordBtn(props) {
  const {
    entityName,
    btnVisible,
    selectedRowIds,
    addVisible,
    selectVisible,
    isBatchEditing,
    onNew,
    onSelect,
    onBatchOperate,
  } = props;
  const { enterBatchEdit, deleteRecords, removeRelation, exportRecords } = btnVisible;
  const [menuVisible, setMenuVisible] = useState();
  const conRef = useRef();
  const btnText = addVisible ? _l('新建%0', entityName) : _l('选择%0', entityName);
  const iconName = addVisible ? 'icon-plus' : 'icon-link_record';
  const btnClick = addVisible ? onNew : onSelect;
  const noSelected = isEmpty(selectedRowIds);
  return (
    <Con ref={conRef}>
      {!isBatchEditing && (
        <Fragment>
          {(addVisible || selectVisible) && (
            <Trigger
              zIndex={999}
              popupVisible={menuVisible && addVisible && selectVisible}
              actions={['click']}
              getPopupContainer={() => conRef.current}
              onPopupVisibleChange={setMenuVisible}
              popup={
                <MenuCon>
                  <Menu
                    style={{ top: 0 }}
                    onClickAwayExceptions={['.relateRecordBtnDropIcon']}
                    onClickAway={() => setMenuVisible(false)}
                  >
                    <MenuItem onClick={onNew}>{_l('新建%0', entityName)}</MenuItem>
                    <MenuItem onClick={onSelect}>{_l('关联已有%0', entityName)}</MenuItem>
                  </Menu>
                </MenuCon>
              }
              popupClassName="filterTrigger"
              destroyPopupOnHide
              popupAlign={{
                offset: [0, 4],
                points: ['tl', 'bl'],
              }}
            >
              <Button onClick={btnClick}>
                <div className="content">
                  <i className={`icon ${iconName} mRight5 Font16`}></i>
                  {btnText}
                </div>
                {addVisible && selectVisible && (
                  <DropIcon
                    className="relateRecordBtnDropIcon"
                    onClick={e => {
                      e.stopPropagation();
                      setMenuVisible(true);
                    }}
                  >
                    <i className="icon icon-arrow-down"></i>
                  </DropIcon>
                )}
              </Button>
            </Trigger>
          )}
          {(addVisible || selectVisible) && enterBatchEdit && <Splitter />}
          {enterBatchEdit && (
            <Fragment>
              <Button onClick={() => onBatchOperate({ action: 'enterBatchEditing' })}>
                <div className="content">{_l('批量操作')}</div>
              </Button>
            </Fragment>
          )}
        </Fragment>
      )}
      {isBatchEditing && (
        <Fragment>
          {enterBatchEdit && (
            <Button
              className="mRight10 ThemeHoverColor3"
              onClick={() => onBatchOperate({ action: 'exitBatchEditing' })}
            >
              <div className="content">{_l('取消')}</div>
            </Button>
          )}
          {removeRelation && (
            <Button
              className={cx('mRight10', { disabled: noSelected })}
              onClick={() => {
                if (noSelected) {
                  return;
                }
                onBatchOperate({ action: 'removeRelation' });
              }}
            >
              <div className="content">{_l('取消关联')}</div>
            </Button>
          )}
          {deleteRecords && (
            <Button
              className={cx('mRight10', { disabled: noSelected })}
              onClick={() => {
                if (noSelected) {
                  return;
                }
                onBatchOperate({ action: 'deleteRecords' });
              }}
            >
              <div className="content">{_l('删除')}</div>
            </Button>
          )}
          {exportRecords && (
            <Button
              className={cx('mRight10', { disabled: noSelected })}
              onClick={() => {
                if (noSelected) {
                  return;
                }
                onBatchOperate({ action: 'exportRecords' });
              }}
            >
              <div className="content">{_l('导出')}</div>
            </Button>
          )}
        </Fragment>
      )}
    </Con>
  );
}

RelateRecordBtn.propTypes = {
  entityName: PropTypes.string,
  btnVisible: PropTypes.shape({}),
  selectedRowIds: PropTypes.arrayOf(PropTypes.string),
  addVisible: PropTypes.bool,
  isBatchEditing: PropTypes.bool,
  selectVisible: PropTypes.bool,
  onNew: PropTypes.func,
  onSelect: PropTypes.func,
  onBatchOperate: PropTypes.func,
};
