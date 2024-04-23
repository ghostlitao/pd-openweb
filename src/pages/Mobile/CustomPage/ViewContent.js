import React, { useEffect, useState, Fragment } from 'react';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { connect } from 'react-redux';
import { View } from 'src/pages/customPage/components/editWidget/view/Preview';
import { formatFiltersGroup } from 'src/pages/customPage/components/editWidget/filter/util';
import _ from 'lodash';

const emptyArray = [];

function ViewContent(props) {
  const { setting, filterComponents, loadFilterComponentCount } = props;
  const objectId = _.get(setting, 'config.objectId');
  const filtersGroup = formatFiltersGroup(objectId, props.filtersGroup);

  if (!_.get(window, 'shareState.shareId') && filterComponents.length && loadFilterComponentCount < filterComponents.length) {
    return (
      <Flex justify="center" align="center" className="h100 w100">
        <ActivityIndicator size="large" />
      </Flex>
    );
  }

  const isClickSearch = !!filterComponents.map(data => {
    const { filters, advancedSetting } = data;
    const result = _.find(filters, { objectId });
    return result && advancedSetting.clicksearch === '1';
  }).filter(n => n).length;

  if (isClickSearch && !filtersGroup.length) {
    return (
      <Flex justify="center" align="center" className="h100 w100">
        <span className="Font15 bold Gray_9e">{_l('执行查询后显示结果')}</span>
      </Flex>
    );
  }

  return (
    <View {...props} filtersGroup={filtersGroup.length ? filtersGroup : emptyArray} />
  );
}

export default connect(
  state => ({
    filtersGroup: state.mobile.filtersGroup,
    filterComponents: state.mobile.filterComponents,
    loadFilterComponentCount: state.mobile.loadFilterComponentCount,
  })
)(ViewContent);
