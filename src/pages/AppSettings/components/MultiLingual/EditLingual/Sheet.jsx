import React, { Fragment, useState, useEffect } from 'react';
import { LoadDiv } from 'ming-ui';
import { Input } from 'antd';
import EditInput from './EditInput';
import EditDescription from './EditDescription';
import sheetApi from 'src/api/worksheet';
import { LANG_DATA_TYPE } from '../config';
import { getTranslateInfo } from 'src/util';
import { filterHtmlTag } from '../util';

export default function Sheet(props) {
  const { app, selectNode, translateData, comparisonLangId, comparisonLangData, onEditAppLang } = props;
  const [loading, setLoading] = useState(true);
  const [sheetInfo, setSheetInfo] = useState({});
  const data = _.find(translateData, { correlationId: selectNode.key }) || {};
  const translateInfo = data.data || {};

  useEffect(() => {
    setLoading(true);
    sheetApi.getWorksheetInfo({
      worksheetId: selectNode.key,
    }).then(data => {
      setLoading(false);
      setSheetInfo(data);
    });
  }, [selectNode.key]);

  const handleSave = info => {
    onEditAppLang({
      id: data.id,
      parentId: selectNode.parentId,
      correlationId: selectNode.key,
      type: LANG_DATA_TYPE.wrokSheet,
      data: {
        ...translateInfo,
        ...info
      }
    });
  };

  if (loading) {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter h100">
        <LoadDiv />
      </div>
    );
  }

  const { desc, entityName, advancedSetting = {} } = sheetInfo;
  const comparisonLangInfo = getTranslateInfo(app.id, selectNode.key, comparisonLangData);
  const formTitle = comparisonLangId ? comparisonLangInfo.formTitle : advancedSetting.title;
  const formSub = comparisonLangId ? comparisonLangInfo.formSub : advancedSetting.sub;
  const formContinue = comparisonLangId ? comparisonLangInfo.formContinue : advancedSetting.continue;
  const recordName = comparisonLangId ? comparisonLangInfo.recordName : entityName;

  return (
    <div className="pAll20">
      <div className="Font14 bold mBottom20">{translateInfo.name || selectNode.originalTitle}</div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('工作表名称')}</div>
        <Input className="flex mRight20" value={comparisonLangId ? comparisonLangInfo.name : selectNode.originalTitle} disabled={true} />
        <EditInput
          className="flex"
          value={translateInfo.name}
          onChange={value => handleSave({ name: value })}
        />
      </div>
      <div className="flexRow nodeItem">
        <div className="Font13 mRight20 label">{_l('工作表说明')}</div>
        <Input.TextArea style={{ resize: 'none' }} className="flex mRight20" value={filterHtmlTag(comparisonLangId ? comparisonLangInfo.description : desc)} disabled={true} />
        <EditDescription
          value={translateInfo.description}
          originalValue={desc}
          onChange={value => handleSave({ description: value })}
        />
      </div>

      {!!(formTitle || formSub || formContinue) && (
        <div className="Font14 bold mTop20 mBottom20">{_l('提交表单')}</div>
      )}

      {formTitle && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('表单标题')}</div>
          <Input className="flex mRight20" value={formTitle} disabled={true} />
          <EditInput
            className="flex"
            disabled={!formTitle}
            value={translateInfo.formTitle}
            onChange={value => handleSave({ formTitle: value })}
          />
        </div>
      )}
      {formSub && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('提交按钮')}</div>
          <Input className="flex mRight20" value={formSub} disabled={true} />
          <EditInput
            className="flex"
            disabled={!formSub}
            value={translateInfo.formSub}
            onChange={value => handleSave({ formSub: value })}
          />
        </div>
      )}
      {formContinue && (
        <div className="flexRow alignItemsCenter nodeItem">
          <div className="Font13 mRight20 label">{_l('继续创建按钮')}</div>
          <Input className="flex mRight20" value={formContinue} disabled={true} />
          <EditInput
            className="flex"
            disabled={!formContinue}
            value={translateInfo.formContinue}
            onChange={value => handleSave({ formContinue: value })}
          />
        </div>
      )}

      <div className="Font14 bold mTop20 mBottom20">{_l('记录名称')}</div>
      <div className="flexRow alignItemsCenter nodeItem">
        <div className="Font13 mRight20 label">{_l('记录名称')}</div>
        <Input className="flex mRight20" value={recordName} disabled={true} />
        <EditInput
          className="flex"
          disabled={!recordName}
          value={translateInfo.recordName}
          onChange={value => handleSave({ recordName: value })}
        />
      </div>
    </div>
  );
}
