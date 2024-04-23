import React, { Fragment } from 'react';
import { ACTION_ID, APP_TYPE } from '../../enum';
import { SingleControlValue } from '../components';
import _ from 'lodash';

export default props => {
  const { data, updateSource } = props;

  return (
    <Fragment>
      <div className="Font14 Gray_75 workflowDetailDesc mBottom20">
        {data.appType === APP_TYPE.SNAPSHOT
          ? _l(
              '通过链接地址获取页面快照图片，推荐使用应用中自定义页面、视图、统计图的嵌入链接进行获取。其他链接地址不保证能正确获取，请测试后使用。',
            )
          : data.actionId === ACTION_ID.ADD
          ? _l('创建一个系统内日程。可同时生成一个ICS文件在其他节点中使用')
          : _l('仅生成一个日程ICS文件，在发送邮件等节点中作为附件使用。通过此文件可添加日程到个人日历')}
      </div>

      {data.fields.map((item, i) => {
        const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId) || {};

        return (
          <div key={item.fieldId} className="relative">
            <div className="flexRow alignItemsCenter mTop15">
              <div className="ellipsis Font13 flex mRight20">
                {singleObj.controlName}
                {singleObj.required && <span className="mLeft5 red">*</span>}
              </div>
            </div>
            <SingleControlValue
              companyId={props.companyId}
              relationId={props.relationId}
              processId={props.processId}
              selectNodeId={props.selectNodeId}
              sourceNodeId={data.selectNodeId}
              controls={data.controls}
              formulaMap={data.formulaMap}
              fields={data.fields}
              updateSource={updateSource}
              item={item}
              i={i}
            />
          </div>
        );
      })}
    </Fragment>
  );
};
