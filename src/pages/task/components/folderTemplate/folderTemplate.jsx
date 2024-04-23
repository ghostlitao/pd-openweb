﻿import './less/folderTemplate.less';
import React, { Component } from 'react';
import cx from 'classnames';
import ajaxRequest from 'src/api/taskCenter';
import CreateFolder from '../createFolder/createFolder';
import { errorMessage } from '../../utils/utils';
import _ from 'lodash';
import { LoadDiv, Dialog } from 'ming-ui';

export default class FolderTemplate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectType: '',
      templateType: [],
      templates: [],
      showCreateFolder: false,
    };
  }

  componentWillMount() {
    ajaxRequest.getTemplateTypes({ appid: this.props.appId }).then(source => {
      this.setState({
        selectType: source.data.templateType[0].templateTypeId,
        templateType: source.data.templateType,
        templates: source.data.templates,
      });
    });
  }

  componentWillUnmount() {
    $('#folderTemplate_mask, #folderTemplate_container').remove();
  }

  /**
   * 获取模板列表
   * @param  {string} templateTypeId
   */
  getTemplates(templateTypeId) {
    this.setState({
      templates: [],
      selectType: templateTypeId,
    });
    ajaxRequest
      .getTemplatesByTemplateTypeId({
        templateTypeId,
      })
      .then(source => {
        this.setState({ templates: source.data });
      });
  }

  /**
   * 模板列表点击
   * @param  {string} templateId
   * @param  {string} templateName
   * @param  {string} image
   * @param  {array} materials
   */
  folderTemplateListClick(templateId, templateName, image, materials = []) {
    this.createFolder(templateId, templateName, image, materials);
  }

  /**
   * 打开创建项目层
   * @param  {string} templateId
   * @param  {string} templateName
   * @param  {string} background
   * @param  {array} materials
   */
  createFolder(templateId, templateName, background, materials) {
    this.setState({
      templateId,
      templateName,
      showCreateFolder: true,
      background,
      materials,
    });
  }

  /**
   * 删除模板
   * @param  {string} templateId
   * @param  {object} evt
   */
  delTemplate(templateId, evt) {
    evt.stopPropagation();

    Dialog.confirm({
      title: _l('您确定要删除当前模板吗？'),
      children: <div>{_l('模板被删除后，将无法恢复')}</div>,
      okText: _l('删除'),
      onOk: () => {
        ajaxRequest
          .removeMyFolderTemplateOne({
            templateId,
          })
          .then(source => {
            if (source.status) {
              alert(_l('删除成功'));
              const templates = this.state.templates;
              _.remove(templates, template => template.templateId === templateId);
              this.setState({ templates });
            } else {
              errorMessage(source.error);
            }
          });
      },
    });
  }

  render() {
    const templateType = this.state.templateType;
    const templates = this.state.templates;

    return (
      <Dialog
        className="folderTemplate"
        visible
        width={templateType.length === 1 ? 615 : 760}
        title={_l('新建项目')}
        showFooter={false}
        onCancel={this.props.onClose}
      >
        {templateType.length === 0 ? <LoadDiv /> : <div className="flexRow">
          {templateType.length > 1 && (
            <ul className="folderTemplateSidebar">
              {templateType.map((type, i) => {
                return (
                  <li
                    className={cx({ ThemeColor3: type.templateTypeId === this.state.selectType })}
                    key={i}
                    onClick={() => this.getTemplates(type.templateTypeId)}
                  >
                    <i className={type.templateTypeIcon} />
                    {type.templateTypeName}
                  </li>
                );
              })}
            </ul>
          )}

          <ul className="flex folderTemplateList">
            {templates.length ? undefined : <LoadDiv />}
            {templates
              .filter(tpl => tpl.templateId || (!tpl.templateId && this.state.selectType === '0'))
              .map((tpl, i) => {
                return (
                  <li
                    className={cx(
                      'boderRadAll_3',
                      tpl.templateId === '' ? 'folderTemplateNull ThemeColor3 ThemeBorderColor3' : '',
                    )}
                    key={i}
                    style={{ backgroundImage: 'url(' + tpl.icon + ')' }}
                    onClick={() =>
                      this.folderTemplateListClick(tpl.templateId, tpl.templateName, tpl.background, tpl.materials)
                    }
                  >
                    <div className={cx('folderTemplateItem ellipsis', { folderTemplateItemPosition: tpl.templateId })}>
                      {tpl.templateId ? undefined : <i className="icon-addapplication" />}
                      {tpl.templateName}
                    </div>

                    {tpl.templateId ? <div className="folderTemplateBG" /> : undefined}

                    {tpl.templateId ? (
                      <div className="folderTemplateDesc">
                        <div>{tpl.title ? tpl.title : <span className="Font15">{tpl.templateName}</span>}</div>
                      </div>
                    ) : undefined}

                    {tpl.templateId ? (
                      <div className="folderTemplateOperator">
                        {tpl.isCustom ? (
                          <span
                            className="ThemeColor3 tip-top"
                            data-tip={_l('删除模板')}
                            onClick={evt => this.delTemplate(tpl.templateId, evt)}
                          >
                            <i className="icon-task-new-delete" />
                          </span>
                        ) : undefined}
                      </div>
                    ) : undefined}
                  </li>
                );
              })}
          </ul>
        </div>}

        {this.state.showCreateFolder ? (
          <CreateFolder
            mdAppId={this.props.appId}
            projectId={this.props.projectId}
            templateId={this.state.templateId}
            templateName={this.state.templateName}
            createFolderCallback={this.props.callback}
            background={this.state.background}
            materials={this.state.materials}
            onClose={() => {
              this.setState({ showCreateFolder: false });
            }}
          />
        ) : undefined}
      </Dialog>
    );
  }
}
