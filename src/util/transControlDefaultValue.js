import worksheetAjax from 'src/api/worksheet';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import RegExpValidator from 'src/util/expression';

const addPrefixForRowIdOfRows = (rows = [], prefix = '') => {
  const rowIds = rows.map(row => row.rowid);
  return rows.map(row => {
    const newRow = { ...row };
    rowIds.forEach(rowId => {
      Object.keys(newRow).forEach(key => {
        if (_.includes(newRow[key], rowId)) {
          newRow[key] = newRow[key].replace(rowId, prefix + rowId);
        }
      });
    });
    return newRow;
  });
};

const SYSTEM_FIELD_IDS = [
  'rowid',
  'ownerid',
  'caid',
  'ctime',
  'utime',
  'uaid',
  'wfname',
  'wfcuaids',
  'wfcaid',
  'wfctime',
  'wfrtime',
  'wfftime',
  'wfstatus',
];

export function formatAttachmentValue(value, isRecreate = false, isRelation = false) {
  const attachmentArr = JSON.parse(value || '[]');
  let attachmentValue = attachmentArr;

  if (attachmentArr.length) {
    attachmentValue = attachmentArr
      .filter(item => !item.refId)
      .map((item, index) => {
        let fileUrl = item.fileUrl || item.fileRealPath;
        const isLinkFile = item.ext === '.url';
        if (!fileUrl && item.filepath && item.filename) {
          fileUrl = `${item.filepath}${item.filename}`;
        }

        const url = isLinkFile ? {} : new URL(fileUrl);
        const urlPathNameArr = (url.pathname || '').split('/');
        const fileName = isLinkFile ? item.filename : (urlPathNameArr[urlPathNameArr.length - 1] || '').split('.')[0];
        let filePath = isLinkFile ? fileUrl : (url.pathname || '').slice(1).replace(fileName + item.ext, '');
        const IsLocal = md.global.Config.IsLocal;
        const host = RegExpValidator.fileIsPicture(item.ext)
          ? md.global.FileStoreConfig.pictureHost
          : md.global.FileStoreConfig.documentHost;
        let searchParams = '';
        let extAttr = {};

        if (IsLocal && isRecreate && (item.viewUrl || item.previewUrl)) {
          const filelink = new URL(host);
          filePath = filePath.replace(filelink.pathname.slice(1), '');
          searchParams = (item.viewUrl || item.previewUrl).match(/\?.*/)[0];
          isRelation && (extAttr = { ext: item.ext, previewUrl: item.previewUrl });
        }

        return {
          ...extAttr,
          fileID: item.fileId || item.fileID,
          fileSize: item.filesize,
          url: isLinkFile ? undefined : fileUrl + searchParams,
          viewUrl: isLinkFile ? undefined : fileUrl + searchParams,
          serverName: IsLocal && isRecreate ? host : url.origin + '/',
          filePath,
          fileName,
          fileExt: item.ext,
          originalFileName: item.originalFilename,
          key: uuidv4(),
          oldOriginalFileName: item.originalFilename,
          index,
        };
      });
  }
  return JSON.stringify({
    attachments: attachmentValue,
    knowledgeAtts: [],
    attachmentData: [],
  });
}

export async function fillRowRelationRows(control, rowId, worksheetId, isRecreate = false) {
  let defSource = '';
  let filledControl = _.cloneDeep(control);
  await worksheetAjax
    .getRowRelationRows({
      controlId: control.controlId,
      rowId,
      worksheetId,
      pageIndex: 1,
      pageSize: 200,
      getWorksheet: true,
    })
    .then(res => {
      if (res.resultCode === 1) {
        const subControls = ((res.template || {}).controls || []).filter(
          c => !_.includes(SYSTEM_FIELD_IDS, c.controlId),
        );
        const staticValue = addPrefixForRowIdOfRows(res.data || [], 'temp-').map(item => {
          let itemValue = {
            rowid: item.rowid,
            pid: item.pid,
            childrenids: item.childrenids,
          };

          subControls.forEach(c => {
            if (isRecreate && c.type === 29 && c.advancedSetting.showtype === '3') {
              let value = safeParse(item[c.controlId], 'array').slice(0, 5);
              itemValue[c.controlId] = JSON.stringify(value);
              return;
            }

            if (isRecreate && c.type === 29 && c.enumDefault === 1 && c.dataSource === worksheetId) {
              itemValue[c.controlId] = undefined;
              return;
            }

            itemValue[c.controlId] =
              c.type === WIDGETS_TO_API_TYPE_ENUM.ATTACHMENT
                ? formatAttachmentValue(item[c.controlId], isRecreate, true)
                : item[c.controlId];
          });
          return itemValue;
        });
        defSource = [{ cid: '', rcid: '', isAsync: false, staticValue: JSON.stringify(staticValue) }];
      }
      filledControl.defsource = JSON.stringify(defSource);
      filledControl.advancedSetting = {
        ...control.advancedSetting,
        defsource: JSON.stringify(defSource),
      };
    });
  return filledControl;
}

const RE_CREATE_ERROR = {
  4: _l('记录不存在，请刷新视图'),
};

export async function handleRowData(props) {
  const { rowId, worksheetId, columns } = props;
  const data = await worksheetAjax.getRowDetail({
    checkView: true,
    getType: 1,
    rowId: rowId,
    worksheetId: worksheetId,
  });
  if (data.resultCode === 1) {
    let defaultData = JSON.parse(data.rowData || '{}');

    let subTablePromise = [];
    let defcontrols = _.cloneDeep(columns);
    _.forIn(defaultData, (value, key) => {
      let control = columns.find(l => l.controlId === key);
      if (!control) return;
      else if ([38, 32, 33].includes(control.type) || (control.fieldPermission || '111').split('')[2] === '0') {
        defaultData[key] = null;
      } else if (control.type === 14) {
        defaultData[key] = formatAttachmentValue(value, true);
      } else if (control.type === 34) {
        subTablePromise.push(fillRowRelationRows(control, rowId, worksheetId, true));
      } else if (control.type === 29) {
        defaultData[key] = !['2', '5', '6'].includes(control.advancedSetting.showtype)
          ? JSON.stringify(JSON.parse(value || '[]').slice(0, 5))
          : 0;
      } else if (control.type === 37 && control.dataSource) {
        const sourceId = control.dataSource.substring(1, control.dataSource.length - 1);
        const sourceControl = columns.find(l => l.controlId === sourceId);
        defaultData[key] =
          _.get(sourceControl, 'type') === 29 &&
          ['2', '5', '6'].includes(_.get(sourceControl, 'advancedSetting.showtype'))
            ? undefined
            : value;
      } else {
        defaultData[key] = value;
      }
    });

    const res = await Promise.all(subTablePromise);
    res.forEach(item => {
      const index = _.findIndex(defcontrols, o => {
        return o.controlId == item.controlId;
      });
      (defaultData[item.controlId] = undefined), index > -1 && (defcontrols[index] = item);
    });

    return { defaultData, defcontrols };
  } else {
    RE_CREATE_ERROR[data.resultCode] && alert(RE_CREATE_ERROR[data.resultCode], 2);
  }
}
