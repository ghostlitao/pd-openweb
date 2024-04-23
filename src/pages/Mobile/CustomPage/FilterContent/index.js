import React, { useEffect, useState, Fragment } from 'react';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { Drawer } from 'antd';
import { Icon } from 'ming-ui';
import styled from 'styled-components';
import cx from 'classnames';
import worksheetApi from 'src/api/worksheet';
import QuickFilter from 'mobile/RecordList/QuickFilter';
import Search from './Search';
import Filters from './Filters';
import { validate } from 'worksheet/common/Sheet/QuickFilter/Inputs';
import { connect } from 'react-redux';
import * as actions from '../redux/actions';
import { bindActionCreators } from 'redux';
import { formatFilters } from 'src/pages/customPage/components/editWidget/filter/util';
import { updatePageInfo, updateFiltersGroup } from 'src/pages/customPage/redux/action';
import { formatFilterValues } from 'worksheet/common/Sheet/QuickFilter';
import { conditionAdapter, formatQuickFilter } from 'mobile/RecordList/QuickFilter/Inputs';
import store from 'redux/configureStore';
import _ from 'lodash';

const Wrap = styled.div`
  &.disableFiltersGroup {
    pointer-events: none;
  }
`;

const FilterEntry = styled.div`
  background-color: #fff;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
  padding: 0 7px 0 10px;
  height: 100%;
  &.big {
    width: 100%;
  }
  &.highlight {
    color: #2196f3;
    .icon {
      color: #2196f3 !important;
    }
  }
`;

const DrawerWrap = styled(Drawer)`
  z-index: 100 !important;
  .ant-drawer-body {
    padding: 10px 0 0 0;
  }
`;

function FilterContent(props) {
  const { ids = {}, apk = {}, widget, className = '' } = props;
  const { value } = widget;
  const [loading, setLoading] = useState(true);
  const [filtersGroup, setFiltersGroup] = useState({});
  const [visible, setVisible] = useState(false);
  const [otherFiltersGroup, setOtherFiltersGroup] = useState([]);
  const isEdit = className.includes('disableFiltersGroup');

  const filters = formatFilters(filtersGroup.filters || []).filter(c => !c.className.includes('disable'));

  useEffect(() => {
    return () => {
      props.updateLoadFilterComponentCount(0);
    }
  }, []);

  useEffect(() => {
    if (value) {
      worksheetApi.getFiltersGroupByIds({
        appId: ids.appId,
        filtersGroupIds: [value],
      }).then(data => {
        setLoading(false);
        const filtersGroup = data[0];
        const result = {
          ...filtersGroup,
          filters: filtersGroup.filters.map(f => {
            return {
              ...f,
              values: formatFilterValues(f.dataType, f.values)
            }
          })
        };
        setFiltersGroup(widget.filter ? widget.filter : result);
        const { filterComponents, loadFilterComponentCount } = store.getState().mobile;
        props.updateFilterComponents(filterComponents.map(item => {
          if (item.value === value) {
            const { advancedSetting, filters } = filtersGroup;
            return {
              value,
              advancedSetting,
              filters: _.flatten(filters.map(item => item.objectControls)),
            }
          } else {
            return item;
          }
        }));
        if (isEdit) {
          const { loadFilterComponentCount } = store.getState().customPage;
          store.dispatch(updatePageInfo({ loadFilterComponentCount: loadFilterComponentCount + 1 }));
        } else {
          props.updateLoadFilterComponentCount(loadFilterComponentCount + 1);
        }
      });
    } else {
      const { loadFilterComponentCount } = store.getState().customPage;
      store.dispatch(updatePageInfo({ loadFilterComponentCount: loadFilterComponentCount + 1 }));
      setLoading(false);
    }
  }, [value]);

  useEffect(() => {
    if (isEdit) {
      store.dispatch(updateFiltersGroup({
        value,
        filters: otherFiltersGroup
      }));
    } else {
      props.updateFiltersGroup(value, otherFiltersGroup);
    }
  }, [otherFiltersGroup]);

  useEffect(() => {
    const { updateFiltersGroup } = props;
    const quickFilter = filters.map((filter, i) => ({
      ...filter,
      filterType: filter.filterType || 1,
      spliceType: filter.spliceType || 1,
    })).filter(validate).map(conditionAdapter);
    const filtersGroup = formatQuickFilter(quickFilter);
    setOtherFiltersGroup(filtersGroup);
  }, [filtersGroup]);

  if (loading) {
    return (
      <Flex justify="center" align="center" className="h100">
        <ActivityIndicator size="large" />
      </Flex>
    );
  }

  return (
    <Wrap className={cx('flexRow valignWrapper w100', className)} style={{ height: 40 }}>
      <FilterEntry
        className={cx('flexRow valignWrapper big', {
          highlight: otherFiltersGroup.length
        })}
        onClick={() => { setVisible(true) }}
      >
        <Icon className="Font20 Gray_9e" icon="filter" />
        <div className="flexRow valignWrapper w100">
          <span className="Font15 flex mLeft5">{_l('筛选')}</span>
          {!!otherFiltersGroup.length && <span className="mLeft5 mRight6">{_l('已筛%0项', otherFiltersGroup.length)}</span>}
          <Icon className="Font18 Gray_9e" icon="arrow-right-border" />
        </div>
      </FilterEntry>
      <DrawerWrap
        placement="right"
        visible={visible}
        closable={false}
        width="90%"
        onClose={() => {
          setVisible(false);
        }}
      >
        <Filters
          appId={ids.appId}
          // worksheetId={ids.worksheetId}
          projectId={apk.projectId}
          enableBtn={filtersGroup.enableBtn}
          filters={filters.filter(c => c.control && !(window.shareState.shareId && _.includes([26, 27, 48], c.control.type)))}
          updateQuickFilter={(values) => {
            setOtherFiltersGroup(values);
          }}
          onCloseDrawer={() => {
            setVisible(false);
          }}
        />
      </DrawerWrap>
    </Wrap>
  );
}

export default connect(
  state => ({
    filtersGroup: state.mobile.filtersGroup,
  }),
  dispatch => bindActionCreators(_.pick(actions, ['updateFiltersGroup', 'updateFilterComponents', 'updateLoadFilterComponentCount']), dispatch),
)(FilterContent);
