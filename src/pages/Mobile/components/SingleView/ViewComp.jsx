import React, { useEffect, useState } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { useDeepCompareEffect } from 'react-use';
import DocumentTitle from 'react-document-title';
import { loadWorksheet, unshiftSheetRow, updateFiltersGroup } from 'mobile/RecordList/redux/actions';
import { addNewRecord, updateFilters } from 'src/pages/worksheet/redux/actions';
import styled from 'styled-components';
import { Icon, Button } from 'ming-ui';
import errorBoundary from 'ming-ui/decorators/errorBoundary';
import View from 'mobile/RecordList/View';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { openAddRecord } from 'mobile/Record/addRecord';
import { mdAppResponse } from 'src/util';
import homeAppAjax from 'src/api/homeApp';
import _ from 'lodash';

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ViewCon = styled.div`
  flex: 1;
  min-height: 0;
  border: 1px solid #e0e0e0 !important;
`;

const Header = styled.div`
  height: 44px;
  padding: 0px 24px;
  background-color: rgb(255, 255, 255);
`;

const AddBtn = styled.div`
  position: fixed;
  bottom: 20px;
  width: 100%;
  text-align: center;
  z-index: 1;
  button {
    height: 44px;
    display: flex !important;
    align-items: center;
    border-radius: 24px !important;
    padding: 0px 15px !important;
    margin: 0 auto;
    box-shadow: 0 1px 4px #00000029;
  }
`;

function ViewComp(props) {
  const { showHeader, headerLeft, headerRight } = props;
  const { base, workSheetLoading, worksheetInfo, sheetSwitchPermit, filtersGroup = [], showPageTitle } = props;
  const { loadWorksheet, updateFilters, updateFiltersGroup } = props;
  const { views = [], allowAdd } = worksheetInfo;
  const { viewId, appId, worksheetId } = base;
  const view = _.find(views, { viewId }) || (!viewId && views[0]) || {};
  const [appColor, setAppColor] = useState('');

  useEffect(() => {
    if (appId && worksheetId) {
      loadWorksheet(true);
    }
  }, [appId, worksheetId]);

  useEffect(() => {
    getAppInfo();
  }, [appId]);

  useDeepCompareEffect(() => {
    if (!workSheetLoading && viewId) {
      if (_.get(view, 'navGroup.length')) {
        updateFilters({ filtersGroup }, view);
        updateFiltersGroup(filtersGroup);
        return;
      }
      if ([0, 6].includes(view.viewType)) {
        updateFiltersGroup(filtersGroup);
      } else {
        updateFilters({ filtersGroup }, view);
      }
    }
  }, [filtersGroup, workSheetLoading, viewId]);

  const getAppInfo = () => {
    if (!appId || _.get(window, 'shareState.shareId')) return;
    homeAppAjax.getApp({ appId }).then(data => {
      setAppColor(data.iconColor);
    });
  };

  const addRecord = () => {
    const { appId, worksheetId } = worksheetInfo;
    const isMingdao = navigator.userAgent.toLowerCase().indexOf('mingdao application') >= 0;
    const addRecord = data => {
      if (view.viewType) {
        props.addNewRecord(data, view);
      } else {
        props.unshiftSheetRow(data);
      }
    };
    if (isMingdao) {
      mdAppResponse({
        type: 'native',
        settings: {
          appId,
          worksheetId,
          viewId: view.viewId,
          action: 'addRow',
        },
      }).then(data => {
        const { value } = data;
        if (value) {
          const res = JSON.parse(value);
          res.forEach(data => {
            addRecord(data);
          });
        }
      });
    } else {
      openAddRecord({
        className: 'full',
        worksheetInfo,
        appId,
        worksheetId,
        viewId: view.viewId,
        addType: 2,
        entityName: worksheetInfo.entityName,
        onAdd: addRecord,
        showDraftsEntry: true,
        sheetSwitchPermit,
      });
    }
  };

  return (
    !workSheetLoading && (
      <Con className="SingleViewWrap">
        {showPageTitle && worksheetInfo.name && (
          <DocumentTitle title={`${worksheetInfo.name}${view.name ? ` - ${view.name}` : ''}`} />
        )}
        {showHeader && (
          <Header className="SingleViewHeader mobile flexRow valignWrapper">
            {headerLeft}
            <div className="flex" />
            {headerRight}
          </Header>
        )}
        <ViewCon className="flexRow SingleViewBody">
          <View view={view} />
        </ViewCon>
        {isOpenPermit(permitList.createButtonSwitch, sheetSwitchPermit) &&
          allowAdd &&
          ((view.viewType === 6 && view.childType !== 1) || view.viewType !== 6) && (
            <AddBtn>
              <Button className="valignWrapper flexRow addRecord" style={{ backgroundColor: appColor }} onClick={addRecord}>
                <Icon icon="add" className="Font22 mRight5" />
                {worksheetInfo.entityName}
              </Button>
            </AddBtn>
          )}
      </Con>
    )
  );
}

export default connect(
  state => ({
    ..._.pick(state.mobile, 'base', 'workSheetLoading', 'worksheetInfo', 'sheetSwitchPermit', 'appColor'),
  }),
  dispatch =>
    bindActionCreators(
      {
        loadWorksheet,
        unshiftSheetRow,
        updateFiltersGroup,
        addNewRecord,
        updateFilters,
      },
      dispatch,
    ),
)(errorBoundary(ViewComp));
