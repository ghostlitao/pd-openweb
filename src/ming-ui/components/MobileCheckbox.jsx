import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { Checkbox, Icon } from 'ming-ui';
import { Modal, List, Button } from 'antd-mobile';
import { ModalWrap } from 'src/pages/Mobile/baseStyled.jsx';
import './less/MobileCheckbox.less';
import _ from 'lodash';

export default class MobileCheckbox extends Component {
  static propTypes = {
    disabled: PropTypes.bool,
    allowAdd: PropTypes.bool,
    callback: PropTypes.func,
    data: PropTypes.array,
    checked: PropTypes.array,
    renderText: PropTypes.any,
  };

  static defaultProps = {
    disabled: false,
    allowAdd: false,
    callback: () => {},
    data: [],
    checked: [],
  };

  state = {
    visible: false,
    selectChecked: [],
    keywords: '',
  };

  onChange(key) {
    const { selectChecked } = this.state;

    if (_.includes(selectChecked, key)) {
      _.remove(selectChecked, o => o === key);
    } else {
      selectChecked.push(key);
    }

    this.setState({ selectChecked });
  }

  render() {
    const { disabled, allowAdd, children, data, checked, callback, renderText, otherValue, controlName } = this.props;
    const { visible, selectChecked, keywords } = this.state;
    let source = [].concat(data);

    selectChecked.forEach(item => {
      if ((item || '').indexOf('add_') > -1) {
        source.push({ key: item, color: '#2196F3', value: item.split('add_')[1] });
      }
    });
    const otherValueData = selectChecked.map(it => {
      if (_.includes(it, 'other')) {
        return `other:${otherValue}`;
      }
      return it;
    });

    return (
      <Fragment>
        <span onClick={() => !disabled && this.setState({ visible: true, selectChecked: [].concat(checked) })}>
          {children ||
            source.map(item => {
              return (
                <Checkbox
                  className="flexRow alignItemsCenter"
                  key={item.key}
                  text={item.value}
                  value={item.key}
                  checked={_.includes(checked, item.key)}
                />
              );
            })}
        </span>

        <ModalWrap
          popup
          visible={visible}
          animationType="slide-up"
          maskClosable={false}
          className="mobileCheckboxDialog"
        >
          <div className="flexColumn h100">
            <div className="flexRow valignWrapper mobileCheckboxBtnsWrapper pLeft15 pRight15">
              <div
                className="Hand ThemeColor bold Font15 mRight10"
                onClick={() => this.setState({ selectChecked: [], visible: false })}
              >
                {_l('关闭')}
              </div>
              <div className="Font15 Gray bold flex ellipsis TxtCenter">{controlName}</div>
              <div
                className="Hand ThemeColor bold Font15 mLeft10"
                onClick={() => {
                  this.setState({ visible: false });
                  callback(selectChecked);
                }}
              >
                {_l('确定')}
              </div>
            </div>
            <div className="mobileCheckboxSearchWrapper">
              <Icon icon="h5_search" />
              <input
                className="flex"
                type="search"
                placeholder={allowAdd ? _l('搜索或添加选项') : _l('搜索')}
                value={keywords}
                onChange={evt => this.setState({ keywords: evt.target.value })}
              />
              {keywords && (
                <Icon
                  icon="workflow_cancel"
                  onClick={() => {
                    this.setState({ keywords: '' });
                  }}
                />
              )}
            </div>
            <List className="flex" style={{ overflow: 'auto' }}>
              {!keywords.length && !!selectChecked.length && (
                <List.Item className="mLeft31" onClick={() => this.setState({ selectChecked: [] })}>
                  <span className="Font15 ThemeColor3">{_l('清除选择')}</span>
                </List.Item>
              )}

              {source
                .filter(item => item.value.indexOf(keywords) > -1)
                .map(item => (
                  <List.Item key={item.key} onClick={() => this.onChange(item.key)}>
                    <Checkbox
                      className="flexRow alignItemsCenter"
                      text={renderText ? renderText(item) : item.value}
                      value={item.key}
                      checked={_.includes(selectChecked, item.key)}
                    />
                  </List.Item>
                ))}

              {!!keywords.length && allowAdd && !source.find(item => item.value === keywords) && (
                <List.Item
                  onClick={() => {
                    this.setState({ keywords: '' });
                    this.onChange(`add_${keywords}`);
                  }}
                >
                  <span className="ellipsis ThemeColor3 Font15">{_l('添加新的选项：') + keywords}</span>
                </List.Item>
              )}
            </List>
          </div>
        </ModalWrap>
      </Fragment>
    );
  }
}
