import React, { Component } from 'react';
import PropTypes from 'prop-types';
import sheetAjax from 'src/api/worksheet';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import ScanQRCode from './ScanQRCode';
import _ from 'lodash';

export default class Widgets extends Component {
  static propTypes = {
    projectId: PropTypes.string,
    onChange: PropTypes.func,
    children: PropTypes.element,
  };
  getRowById = ({ appId, worksheetId, viewId, rowId }) => {
    const { filterControls = [], parentWorksheetId, control = {} } = this.props;

    const getFilterRowsPromise = window.isPublicWorksheet
      ? publicWorksheetAjax.getRelationRows
      : sheetAjax.getFilterRows;
    getFilterRowsPromise({
      appId,
      worksheetId,
      filterControls: [
        ...filterControls,
        {
          controlId: 'rowid',
          dataType: 2,
          spliceType: 1,
          filterType: 2,
          dynamicSource: [],
          values: [rowId],
        },
      ],
      relationWorksheetId: parentWorksheetId,
      getType: 7,
      status: 1,
      searchType: 1,
      controlId: window.isPublicWorksheet ? control.controlId : undefined,
    }).then(result => {
      const row = _.find(result.data, { rowid: rowId });
      if (row) {
        this.props.onChange(row);
      } else {
        alert(_l('无法关联，此记录不在可关联的范围内'), 3);
      }
    });
  };
  handleRelateRow = content => {
    const currentWorksheetId = this.props.worksheetId;
    if (content.includes('worksheetshare') || content.includes('public/record')) {
      const shareId = (content.match(/\/worksheetshare\/(.*)/) || content.match(/\/public\/record\/(.*)/))[1];
      sheetAjax
        .getShareInfoByShareId({
          shareId,
        })
        .then(result => {
          result = result.data || {};
          if (currentWorksheetId === result.worksheetId) {
            this.getRowById(result);
          } else {
            alert(_l('无法关联，此记录不在可关联的范围内'), 3);
          }
        });
      return;
    } else {
      const result = content.match(/app\/(.*)\/(.*)\/(.*)\/row\/(.*)/);
      if (result) {
        const [url, appId, worksheetId, viewId, rowId] = result;
        const { scanlink } = _.get(this.props, 'control.advancedSetting') || {};
        if (appId && worksheetId && viewId && rowId) {
          if (scanlink !== '1') {
            return;
          }
          if (currentWorksheetId === worksheetId) {
            this.getRowById({
              appId,
              worksheetId,
              viewId,
              rowId,
            });
          } else {
            alert(_l('无法关联，此记录不在可关联的范围内'), 3);
          }
        } else {
          this.props.onOpenRecordCardListDialog(content);
        }
      } else {
        this.props.onOpenRecordCardListDialog(content);
      }
    }
  };
  render() {
    const { className, projectId, children } = this.props;
    return (
      <ScanQRCode className={className} projectId={projectId} onScanQRCodeResult={this.handleRelateRow}>
        {children}
      </ScanQRCode>
    );
  }
}
