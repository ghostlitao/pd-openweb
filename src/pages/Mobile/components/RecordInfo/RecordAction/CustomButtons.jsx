import React, { Component, Fragment } from 'react';
import { Icon } from 'ming-ui';
import { hexToRgba } from 'src/util';
import styled from 'styled-components';
import cx from 'classnames';

const BtnCon = styled.div`
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: left;
  border-radius: 18px;
  padding: 0 10px;
  box-sizing: border-box;
  border: ${({ btn }) => (!btn.disabled && (!btn.color || btn.color === 'transparent') ? '1px solid #ddd' : 'none')};
  color: ${({ btn }) => (btn.color && btn.color !== 'transparent' ? btn.color : '#333')};
  background: ${({ btn }) => (btn.color && btn.color !== 'transparent' ? hexToRgba(btn.color, 0.05) : '#fff')};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  .opcIcon {
    color: rgba(0, 0, 0, 0.3) !important;
  }
`;

export default class CustomButtons extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { classNames, customBtns = [], isSlice, handleClick = () => {}, btnDisable = {}, isBatch } = this.props;
    const buttons = isSlice ? customBtns.slice(0, 2) : customBtns;

    return buttons
      .filter(it => (isBatch ? !it.disabled : true))
      .map(btn => {
        return (
          <BtnCon
            className={cx(`${classNames}`, { disabled: btnDisable[btn.btnId] || btn.disabled })}
            btn={btn}
            onClick={() => {
              if (btnDisable[btn.btnId] || btn.disabled) return;
              handleClick(btn);
            }}
          >
            <Icon
              icon={btn.icon || 'custom_actions'}
              className={cx('mRight6 Font15', {
                opcIcon: (!btn.icon && (!btn.color || btn.color === 'transparent')) || btn.disabled,
              })}
            />
            <span className={cx('breakAll overflow_ellipsis Font13', { Gray_bd: btn.disabled })}>{btn.name}</span>
          </BtnCon>
        );
      });
  }
}
