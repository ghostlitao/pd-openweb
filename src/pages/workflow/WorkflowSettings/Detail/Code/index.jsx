import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Icon, Dialog, Dropdown, Checkbox, TagTextarea } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, ParameterList, KeyPairs, TestParameter, ChatGPT } from '../components';
import { ACTION_ID } from '../../enum';
import { Base64 } from 'js-base64';
import _ from 'lodash';
import cx from 'classnames';
import CodeSnippet, { CodeSnippetEdit } from '../../../components/CodeSnippet';
import styled from 'styled-components';

const CodeSnippetButton = styled.div`
  padding: 0 8px;
  height: 36px;
  background: #fff;
  border-radius: 5px;
  color: #757575;
  cursor: pointer;
  &:hover {
    background: #f5f5f5;
  }
  i {
    color: #00bcd7;
    margin-right: 3px;
  }
`;

export default class Code extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      sendRequest: false,
      msg: '',
      isFullCode: false,
      showSaveCodeDialog: false,
      showCodeSnippetDialog: false,
      showTestDialog: false,
      showChatGPTDialog: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeDetail(nextProps);
    }

    if (
      nextProps.selectNodeName &&
      nextProps.selectNodeName !== this.props.selectNodeName &&
      nextProps.selectNodeId === this.props.selectNodeId &&
      !_.isEmpty(this.state.data)
    ) {
      this.updateSource({ name: nextProps.selectNodeName });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.data.code !== this.state.data.code ||
      (!prevState.isFullCode && this.state.isFullCode) ||
      (prevState.isFullCode && !this.state.isFullCode)
    ) {
      this.updateCodeMirrorContent(this.state.data.code);
    }
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType, isIntegration } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }, { isIntegration })
      .then(result => {
        if (!result.inputDatas.length) {
          result.inputDatas.push({
            name: '',
            value: '',
          });
        }
        this.setState({ data: result });
      });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { name, actionId, inputDatas, code, testMap, version, maxRetries } = data;

    if (!code) {
      alert(_l('代码块必填'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode(
        {
          processId: this.props.processId,
          nodeId: this.props.selectNodeId,
          flowNodeType: this.props.selectNodeType,
          actionId,
          name: name.trim(),
          inputDatas: inputDatas.filter(item => item.name),
          code: Base64.encode(code),
          testMap,
          version,
          maxRetries,
        },
        { isIntegration: this.props.isIntegration },
      )
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 更新代码编辑器内容
   */
  updateCodeMirrorContent(code) {
    const { isFullCode } = this.state;

    if (isFullCode && this.fullCodeTagtextarea) {
      const cursor = this.fullCodeTagtextarea.cmObj.getCursor();

      this.fullCodeTagtextarea.setValue(code);
      this.fullCodeTagtextarea.cmObj.setCursor(cursor);
    } else if (this.tagtextarea) {
      const cursor = this.tagtextarea.cmObj.getCursor();

      this.tagtextarea.setValue(code);
      this.tagtextarea.cmObj.setCursor(cursor);
    }
  }

  /**
   * Output对象参数列表
   */
  renderParameterList() {
    const { companyId } = this.props;
    const { data, sendRequest, showSaveCodeDialog } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('Output对象参数列表')}</div>

        <ParameterList controls={data.controls} />

        <div className="mTop20 Gray_9e">{_l('请运行代码块以获得output对象; input对象将采用测试数据')}</div>
        <div className="flexRow mTop15">
          <div
            className={cx('webhookBtn InlineBlock', { disabled: sendRequest })}
            onClick={() => {
              if (!data.code) {
                alert(_l('代码块必填'), 2);
                return;
              }

              if (data.inputDatas.filter(o => !!o.name).length) {
                this.setState({ showTestDialog: true });
              } else {
                this.send();
              }
            }}
          >
            {_l('测试')}
          </div>
          <div
            className="webhookBtn InlineBlock mLeft15"
            onClick={() => {
              if (!data.code.trim()) {
                alert(_l('代码片段不允许为空'), 2);
                return;
              }

              this.setState({ showSaveCodeDialog: true });
            }}
          >
            {_l('保存到代码片段库')}
          </div>
        </div>

        {showSaveCodeDialog && (
          <CodeSnippetEdit
            projectId={companyId}
            codeName={_.includes(['JavaScript', 'Python'], data.name) ? '' : data.name}
            code={Base64.encode(data.code)}
            inputDatas={data.inputDatas}
            type={data.actionId}
            onSave={() => {
              alert(_l('保存成功'));
              this.setState({ showSaveCodeDialog: false });
            }}
            onClose={() => this.setState({ showSaveCodeDialog: false })}
          />
        )}
      </Fragment>
    );
  }

  /**
   * 发送
   */
  send = (testMap = {}) => {
    const { processId, selectNodeId, isIntegration } = this.props;
    const { data, sendRequest } = this.state;
    const { actionId, code, inputDatas, version } = data;

    if (sendRequest) {
      return;
    }

    flowNode
      .codeTest(
        {
          processId,
          nodeId: selectNodeId,
          actionId,
          code: Base64.encode(code),
          inputDatas: inputDatas
            .filter(item => item.name)
            .map(item => {
              return {
                ...item,
                value: testMap[item.name] || '',
              };
            }),
          version,
        },
        { isIntegration },
      )
      .then(result => {
        if (result.status === 1) {
          this.updateSource({ controls: result.data.controls });
          this.setState({ msg: '' });
        } else {
          this.setState({ msg: result.msg });
        }

        this.setState({ sendRequest: false });
      })
      .fail(() => {
        this.setState({ sendRequest: false });
      });

    this.setState({ sendRequest: true });
  };

  /**
   * 保存模板
   */
  saveTemplate = () => {};

  /**
   * 渲染代码块
   */
  renderCode() {
    const { data, isFullCode } = this.state;

    return (
      <TagTextarea
        className="workflowCodeMirrorBox"
        height={isFullCode ? '100%' : 0}
        defaultValue={data.code}
        codeMirrorMode={data.actionId === ACTION_ID.JAVASCRIPT ? 'javascript' : 'python'}
        getRef={tag => {
          this[isFullCode ? 'fullCodeTagtextarea' : 'tagtextarea'] = tag;
        }}
        lineNumbers
        maxHeight={10000000}
        onChange={(err, value, obj) => {
          this.updateSource({ code: value });
        }}
      />
    );
  }

  /**
   * 选择代码回调
   */
  selectCodeCallback = ({ clearParams, inputData, code }) => {
    const { data } = this.state;
    const newInputData = [];

    Object.keys(inputData).forEach(name => {
      newInputData.push({ name, value: '' });
    });

    if (clearParams) {
      this.updateSource({ inputDatas: newInputData, code });
    } else {
      this.updateSource({
        inputDatas: _.uniqBy(
          data.inputDatas.concat(newInputData).filter(o => o.name),
          o => o.name,
        ),
        code: `${data.code}\n\n${code}`,
      });
    }

    this.setState({ showCodeSnippetDialog: false, showChatGPTDialog: false });
  };

  render() {
    const { data, msg, isFullCode, showCodeSnippetDialog, showTestDialog, showChatGPTDialog } = this.state;
    const testMapList = (data.inputDatas || []).filter(item => item.name && item.value && !/\$.*?\$/.test(item.value));

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-url"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">
              <div className="Font14 Gray_75 workflowDetailDesc flexRow alignItemsCenter">
                <div className="flex">
                  {data.actionId === ACTION_ID.JAVASCRIPT ? _l('使用JavaScript语言') : _l('使用Python语言')}
                </div>
                {!!(data.versions || []).length && (
                  <Fragment>
                    <div>
                      {data.actionId === ACTION_ID.JAVASCRIPT ? 'Node.js' : 'Python'} {_l('版本')}
                    </div>
                    <Dropdown
                      className="Gray"
                      menuStyle={{ width: '100%', minWidth: 90 }}
                      data={data.versions.map(version => {
                        return { text: 'v' + version, value: version };
                      })}
                      value={data.version || data.versions[0]}
                      onChange={version => {
                        this.updateSource({ version });
                      }}
                    />
                  </Fragment>
                )}
              </div>

              <div className="Font13 bold mTop20">{_l('定义input对象')}</div>
              <KeyPairs
                key={this.props.selectNodeId}
                projectId={this.props.companyId}
                processId={this.props.processId}
                relationId={this.props.relationId}
                selectNodeId={this.props.selectNodeId}
                isIntegration={this.props.isIntegration}
                source={data.inputDatas}
                sourceKey="inputDatas"
                flowNodeList={data.flowNodeList}
                formulaMap={data.formulaMap}
                updateSource={this.updateSource}
              />

              <div className="Font13 bold mTop20">{_l('代码块')}</div>
              <div className="mTop5 flexRow alignItemsCenter">
                <div className="flex Gray_9e">
                  {data.actionId === ACTION_ID.JAVASCRIPT
                    ? _l('Output 示例：output = {output: "hello world" };')
                    : _l("Output 示例：output = {'hello': 'world!'}")}
                </div>
                <CodeSnippetButton
                  className="flexRow alignItemsCenter"
                  onClick={() => this.setState({ showCodeSnippetDialog: true })}
                >
                  <i className="icon-custom-description Font16" />
                  {_l('代码片段库')}
                </CodeSnippetButton>
                {!md.global.Config.IsLocal && (
                  <CodeSnippetButton
                    className="flexRow alignItemsCenter mLeft15"
                    onClick={() => this.setState({ showChatGPTDialog: true })}
                  >
                    <i className="icon-ai1 Font16" style={{ color: '#FF9A00' }} />
                    {_l('生成代码')}
                  </CodeSnippetButton>
                )}
              </div>

              <div className="mTop5 relative">
                {this.renderCode()}
                <span
                  data-tip={_l('放大')}
                  className="codeEditorFull tip-top"
                  onClick={() => this.setState({ isFullCode: true })}
                >
                  <Icon icon="open_in_full" />
                </span>
              </div>

              {msg && (
                <Fragment>
                  <div className="mTop10" style={{ color: '#f44336' }}>
                    {_l('代码错误')}
                  </div>
                  <div className="mTop10" style={{ color: '#f44336' }}>
                    {msg}
                  </div>
                </Fragment>
              )}

              {this.renderParameterList()}

              <div className="Font13 bold mTop20">{_l('自动重试')}</div>
              <Checkbox
                className="mTop10 flexRow"
                text={_l('代码块整体运行失败时自动重试')}
                checked={data.maxRetries > 0}
                onClick={checked => this.updateSource({ maxRetries: !checked ? 1 : 0 })}
              />
            </div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={!!data.code} onSave={this.onSave} />

        {isFullCode && (
          <Dialog
            className="workfowFullCode"
            closable={false}
            type="fixed"
            title={
              <span
                data-tip={_l('缩小')}
                className="codeEditorSmall tip-top"
                onClick={() => this.setState({ isFullCode: false })}
              >
                <Icon icon="close_fullscreen" />
              </span>
            }
            visible
            width={800}
            footer={null}
          >
            {this.renderCode()}
          </Dialog>
        )}

        {showCodeSnippetDialog && (
          <CodeSnippet
            projectId={this.props.companyId}
            type={data.actionId === ACTION_ID.JAVASCRIPT ? 1 : 2}
            onSave={this.selectCodeCallback}
            onClose={() => this.setState({ showCodeSnippetDialog: false })}
          />
        )}

        {showTestDialog && (
          <TestParameter
            title={_l('编辑测试数据')}
            onOk={testMap => {
              this.updateSource({ testMap: Object.assign({}, data.testMap, testMap) });
              this.send(testMap);
              this.setState({ showTestDialog: false });
            }}
            onClose={() => this.setState({ showTestDialog: false })}
            testArray={data.inputDatas.filter(item => item.name).map(item => item.name)}
            formulaMap={_.keyBy(
              data.inputDatas.filter(item => item.name),
              'name',
            )}
            testMap={Object.assign(
              {},
              data.testMap,
              _.zipObject(
                testMapList.map(o => o.name),
                testMapList.map(o => o.value),
              ),
            )}
          />
        )}

        {showChatGPTDialog && (
          <ChatGPT
            processId={this.props.processId}
            nodeId={this.props.selectNodeId}
            codeType={data.actionId === ACTION_ID.JAVASCRIPT ? 1 : 2}
            onSave={this.selectCodeCallback}
            onClose={() => this.setState({ showChatGPTDialog: false })}
          />
        )}
      </Fragment>
    );
  }
}
