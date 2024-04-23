import React, { Component, Fragment } from 'react';
import {
  getLegendType,
  formatControlInfo,
  formatrChartValue,
  formatrChartAxisValue,
  reportTypes,
  formatYaxisList,
  getMaxValue,
  getMinValue,
  getChartColors,
  getAuxiliaryLineConfig
} from './common';
import { Dropdown, Menu } from 'antd';
import { formatSummaryName, isFormatNumber, isTimeControl } from 'statistics/common';
import _ from 'lodash';
import { toFixed } from 'src/util';

const lastDateText = _l('上一期');

const mergeDataTime = (data, contrastData) => {
  const maxLengthData = data.length > contrastData.length ? data : contrastData;
  const newData = data.map((item, index) => {
    item.originalName = item.originalId;
    item.originalId = maxLengthData[index].originalId;
    return item;
  });
  const newcontrastData = contrastData.map((item, index) => {
    item.originalName = item.originalId;
    item.originalId = maxLengthData[index].originalId;
    item.isContrast = true;
    return item;
  });
  return newData.concat(newcontrastData);
};

const mergeData = (data, contrastData) => {
  const longData = data.length >= contrastData.length ? data : contrastData;
  const shortData = data.length < contrastData.length ? data : contrastData;
  const newData = longData.map(item => {
    const { originalId } = item;
    const shortItem = _.find(shortData, { originalId });
    return data.length >= contrastData.length ? [item, shortItem] : [shortItem, item];
  });
  const result = _.flatten(newData).filter(_ => _);
  const notFindData = shortData.filter(item => {
    return !_.find(result, { originalId: item.originalId });
  });
  return notFindData.concat(result);
}

const formatPerPileChartData = result => {
  const groupResult = _.groupBy(result, 'name');
  const perPileResult = [];

  for (let key in groupResult) {
    const current = groupResult[key];
    const count = current.reduce((count, item) => {
      return count + item.value;
    }, 0);
    current.map(item => {
      item.value = ((item.value || 0) / count) * 1;
      return item;
    });
    perPileResult.push(...current);
  }
  return perPileResult;
};

export const formatChartData = (data, yaxisList, { isPile, isAccumulate }, splitControlId) => {
  if (_.isEmpty(data)) return [];
  const result = [];
  const cloneData = _.cloneDeep(data);
  const { value } = cloneData[0];
  if (isAccumulate) {
    cloneData.map(item => {
      item.value.map((n, index) => {
        const lastn = item.value[index - 1];
        n.v = n.v + (lastn ? lastn.v : 0);
        return n;
      });
      return item;
    });
  }
  value.forEach(item => {
    const name = item.originalX;
    cloneData.forEach((element, index) => {
      const lastElement = cloneData[index - 1];
      const lastValue = lastElement && isPile ? lastElement.value.filter(n => n.originalX === item.originalX)[0].v : 0;
      const current = element.value.filter(n => {
        if (isPile && n.originalX === name) {
          n.v = n.v + lastValue;
        }
        return n.originalX === name;
      });
      if (current.length) {
        const { rename, emptyShowType } = element.c_id ? (_.find(yaxisList, { controlId: element.c_id }) || {}) : yaxisList[0];
        const hideEmptyValue = !emptyShowType && current[0].v === null;
        if (!hideEmptyValue && element.originalKey) {
          result.push({
            controlId: element.c_id,
            groupName: `${splitControlId ? element.key : (rename || element.key)}-md-${reportTypes.LineChart}-chart-${element.c_id || index}`,
            groupKey: element.originalKey,
            value: current[0].v,
            name: item.x,
            originalId: item.originalX || item.x
          });
        }
      }
    });
  });
  return result;
};

const getLineValue = value => {
  if (value) {
    return [{
      type: 'line',
      start: ['min', value],
      end: ['max', value],
      style: {
        stroke: '#333',
      },
    }]
  } else {
    return []
  }
}

export default class extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newYaxisList: [],
      dropdownVisible: false,
      offset: {},
      contrastType: false,
      match: null
    }
    this.LineChart = null;
  }
  componentDidMount() {
    import('@antv/g2plot').then(data => {
      this.g2plotComponent = data;
      this.renderLineChart(this.props);
    });
  }
  componentWillUnmount() {
    this.LineChart && this.LineChart.destroy();
  }
  componentWillReceiveProps(nextProps) {
    const { displaySetup, style } = nextProps.reportData;
    const { displaySetup: oldDisplaySetup, style: oldStyle } = this.props.reportData;
    const chartColor = _.get(nextProps, 'customPageConfig.chartColor');
    const oldChartColor = _.get(this.props, 'customPageConfig.chartColor');
    // 显示设置
    if (
      displaySetup.fontStyle !== oldDisplaySetup.fontStyle ||
      displaySetup.showLegend !== oldDisplaySetup.showLegend ||
      displaySetup.legendType !== oldDisplaySetup.legendType ||
      displaySetup.lifecycleValue !== oldDisplaySetup.lifecycleValue ||
      displaySetup.showNumber !== oldDisplaySetup.showNumber ||
      displaySetup.hideOverlapText !== oldDisplaySetup.hideOverlapText ||
      displaySetup.magnitudeUpdateFlag !== oldDisplaySetup.magnitudeUpdateFlag ||
      displaySetup.xdisplay.showDial !== oldDisplaySetup.xdisplay.showDial ||
      displaySetup.xdisplay.showTitle !== oldDisplaySetup.xdisplay.showTitle ||
      displaySetup.xdisplay.title !== oldDisplaySetup.xdisplay.title ||
      displaySetup.ydisplay.showDial !== oldDisplaySetup.ydisplay.showDial ||
      displaySetup.ydisplay.showTitle !== oldDisplaySetup.ydisplay.showTitle ||
      displaySetup.ydisplay.title !== oldDisplaySetup.ydisplay.title ||
      displaySetup.ydisplay.minValue !== oldDisplaySetup.ydisplay.minValue ||
      displaySetup.ydisplay.maxValue !== oldDisplaySetup.ydisplay.maxValue ||
      displaySetup.ydisplay.lineStyle !== oldDisplaySetup.ydisplay.lineStyle ||
      !_.isEqual(displaySetup.auxiliaryLines, oldDisplaySetup.auxiliaryLines) ||
      style.showXAxisSlider !== oldStyle.showXAxisSlider ||
      style.tooltipValueType !== oldStyle.tooltipValueType ||
      !_.isEqual(style.chartShowLabelIds, oldStyle.chartShowLabelIds) ||
      !_.isEqual(chartColor, oldChartColor) ||
      nextProps.themeColor !== this.props.themeColor
    ) {
      const { LineChartConfig } = this.getComponentConfig(nextProps);
      this.LineChart.update(LineChartConfig);
      this.LineChart.render();
    }
    // 切换图表类型 & 堆叠 & 累计 & 百分比
    if (
      displaySetup.showChartType !== oldDisplaySetup.showChartType ||
      displaySetup.isPile !== oldDisplaySetup.isPile ||
      displaySetup.isAccumulate !== oldDisplaySetup.isAccumulate ||
      displaySetup.isPerPile !== oldDisplaySetup.isPerPile
    ) {
      this.LineChart.destroy();
      this.renderLineChart(nextProps);
    }
  }
  renderLineChart(props) {
    const { reportData, isViewOriginalData } = props;
    const { displaySetup } = reportData;
    const { LineChartComponent, LineChartConfig } = this.getComponentConfig(props);
    this.LineChart = new LineChartComponent(this.chartEl, LineChartConfig);
    if (displaySetup.showRowList && isViewOriginalData) {
      this.LineChart.on('element:click', this.handleClick);
    }
    this.LineChart.render();
  }
  handleClick = ({ data, gEvent }) => {
    const { xaxes, split, displaySetup } = this.props.reportData;
    const { contrastType } = displaySetup;
    const currentData = data.data;
    const param = {};
    if (xaxes.cid) {
      const isNumber = isFormatNumber(xaxes.controlType);
      const value = currentData.originalId;
      param[xaxes.cid] = contrastType ? currentData.name : (isNumber && value ? Number(value) : value);
    }
    if (split.controlId) {
      const isNumber = isFormatNumber(split.controlType);
      const value = currentData.groupKey;
      param[split.cid] = isNumber && value ? Number(value) : value;
    }
    this.setState({
      dropdownVisible: true,
      offset: {
        x: gEvent.x + 20,
        y: gEvent.y
      },
      contrastType: currentData.isContrast ? contrastType : undefined,
      match: param
    });
  }
  handleRequestOriginalData = () => {
    const { isThumbnail } = this.props;
    const { match, contrastType } = this.state;
    this.setState({ dropdownVisible: false });
    const data = {
      isPersonal: false,
      contrastType,
      match
    }
    if (isThumbnail) {
      this.props.onOpenChartDialog(data);
    } else {
      this.props.requestOriginalData(data);
    }
  }
  getComponentConfig(props) {
    const { themeColor, projectId, customPageConfig = {}, reportData } = props;
    const { chartColor, chartColorIndex = 1 } = customPageConfig;
    const { map, contrastMap, displaySetup, xaxes, yaxisList, split } = reportData;
    const { isPile, isPerPile, isAccumulate, xdisplay, ydisplay, legendType, auxiliaryLines } = displaySetup;
    const styleConfig = reportData.style || {};
    const style = chartColor && chartColorIndex >= (styleConfig.chartColorIndex || 0) ? { ...styleConfig, ...chartColor } : styleConfig;
    const { position } = getLegendType(legendType);
    const { length } = _.isEmpty(map) ? contrastMap[0].value : map[0].value;
    const { chartShowLabelIds = ['all'] } = style;
    const isPercentStackedArea = displaySetup.showChartType == 2 && isPerPile;
    const LineValue = isPercentStackedArea ? 0 : (displaySetup.lifecycleValue / length) * (displaySetup.isAccumulate ? length : 1);
    const sortData = formatChartData(map, yaxisList, displaySetup, split.controlId);
    const newYaxisList = formatYaxisList(sortData, yaxisList);
    const maxValue = getMaxValue(sortData, contrastMap.length ? formatChartData(contrastMap, yaxisList, displaySetup, split.controlId) : null);
    const minValue = getMinValue(sortData, contrastMap.length ? formatChartData(contrastMap, yaxisList, displaySetup, split.controlId) : null);
    const { Line, Area } = this.g2plotComponent;
    const ChartComponent = displaySetup.showChartType === 2 ? Area : Line;
    const colors = getChartColors(style, themeColor, projectId);
    const auxiliaryLineConfig = getAuxiliaryLineConfig(auxiliaryLines, sortData, { yaxisList: isPile || isPerPile || isAccumulate ? [] : yaxisList, colors });
    const yAxisLabel = {
      formatter: (value, obj) => {
        return value ? formatrChartAxisValue(Number(value), isPercentStackedArea, newYaxisList) : null;
      }
    };
    this.setState({ newYaxisList });
    const baseConfig = {
      appendPadding: [15, 15, 5, 0],
      seriesField: 'groupName',
      xField: 'originalId',
      yField: 'value',
      meta: {
        originalId: {
          type: 'cat',
          range: [0, 1],
          formatter: value => {
            const item = _.find(sortData, { originalId: value });
            return item ? item.name || _l('空') : value;
          }
        },
        groupName: {
          formatter: value => formatControlInfo(value).name,
        },
        value: {
          nice: false,
        },
      },
      connectNulls: xaxes.emptyType !== 3,
      smooth: displaySetup.showChartType,
      animation: true,
      slider: style.showXAxisSlider ? {
        start: 0,
        end: 0.5,
        formatter: () => null
      } : undefined,
      legend: displaySetup.showLegend && (yaxisList.length > 1 || split.controlId || contrastMap.length)
        ? {
            position,
            flipPage: true,
            itemHeight: 20,
            radio: { style: { r: 6 } },
          }
        : false,
      yAxis: {
        minLimit: _.isNumber(ydisplay.minValue) ? ydisplay.minValue : null,
        maxLimit: ydisplay.maxValue || (LineValue > maxValue ? parseInt(LineValue) + parseInt(LineValue / 5) : null),
        title:
          ydisplay.showTitle && ydisplay.title
            ? {
                text: ydisplay.title,
              }
            : null,
        label: ydisplay.showDial ? yAxisLabel : null,
        grid: {
          line: ydisplay.showDial
            ? {
                style: {
                  lineDash: ydisplay.lineStyle === 1 ? [] : [4, 5],
                },
              }
            : null,
        },
      },
      xAxis: {
        title:
          xdisplay.showTitle && xdisplay.title
            ? {
                text: xdisplay.title,
              }
            : null,
        label: xdisplay.showDial
          ? {
              autoRotate: displaySetup.fontStyle ? true : false,
              autoHide: true,
              formatter: (name, item) => {
                return xaxes.particleSizeType === 6 ? _l('%0时', name) : name;
              },
            }
          : null,
        line: ydisplay.lineStyle === 1 ? {} : null,
      },
      tooltip: {
        shared: true,
        showCrosshairs: true,
        formatter: ({ value, groupName }) => {
          const { name, id } = formatControlInfo(groupName);
          const labelValue = formatrChartValue(value, isPerPile, newYaxisList, value ? undefined : id);
          if (isPercentStackedArea) {
            return {
              name,
              value: style.tooltipValueType ? labelValue : `${toFixed(value * 100, Number.isInteger(value) ? 0 : 2)}%`
            }
          } else {
            const { dot } = _.find(yaxisList, { controlId: id }) || {};
            return {
              name,
              value: _.isNumber(value) ? style.tooltipValueType ? labelValue : value.toLocaleString('zh', { minimumFractionDigits: dot }) : '--'
            }
          }
        }
      },
      point: displaySetup.showNumber
        ? {
            shape: 'point',
            size: 3,
          }
        : false,
      label: displaySetup.showNumber
        ? {
            layout: [
              displaySetup.hideOverlapText ? { type: 'hide-overlap' } : null,
              (ydisplay.maxValue && ydisplay.maxValue < maxValue) || (ydisplay.minValue && ydisplay.minValue > minValue) ? { type: 'limit-in-plot' } : null,
            ],
            content: ({ value, groupName, controlId }) => {
              const render = () => {
                const id = split.controlId ? newYaxisList[0].controlId : controlId;
                return formatrChartValue(value, isPercentStackedArea, newYaxisList, value ? undefined : id);
              }
              if (chartShowLabelIds.length && chartShowLabelIds.includes('all')) {
                return render();
              }
              if (chartShowLabelIds.length && !chartShowLabelIds.includes(controlId)) {
                return;
              }
              return render();
            },
          }
        : false,
      annotations: [
        ...getLineValue(LineValue),
        ...auxiliaryLineConfig
      ]
    };
    if ([0, 1].includes(displaySetup.showChartType)) {
      baseConfig.lineStyle = {
        lineWidth: 3,
      };
    }
    if (displaySetup.showChartType == 2) {
      baseConfig.isStack = displaySetup.isPerPile;
      baseConfig.isPercent = displaySetup.isPerPile;
      baseConfig.line = {
        size: 2,
      };
    }

    if (_.isEmpty(contrastMap)) {
      return {
        LineChartComponent: ChartComponent,
        LineChartConfig: Object.assign({}, baseConfig, {
          data: sortData,
          color: colors,
        }),
      };
    } else {
      const contrastData = formatChartData(
        contrastMap.map(item => {
          item.key = lastDateText;
          return item;
        }),
        yaxisList,
        displaySetup,
        split.controlId
      );
      const isTime = isTimeControl(xaxes.controlType);
      const newData = isTime ? mergeDataTime(sortData, contrastData) : mergeData(sortData, contrastData);
      const data = sortData.length >= contrastData.length ? sortData : contrastData;
      baseConfig.meta.originalId.formatter = value => {
        const item = _.find(data, { originalId: value });
        return item ? item.name || _l('空') : value;
      }
      return {
        LineChartComponent: ChartComponent,
        LineChartConfig: Object.assign({}, baseConfig, {
          data: newData,
          color: ['#64B5F6', '#CCC'],
          tooltip: {
            showTitle: false,
            shared: true,
            showCrosshairs: true,
            formatter: ({ value, groupName, originalId: xName }) => {
              const { name, id } = formatControlInfo(groupName);
              const { dot } = _.find(yaxisList, { controlId: id }) || {};
              const newValue = _.isNumber(value) ? value.toLocaleString('zh', { minimumFractionDigits: dot }) : '--';
              if (name === lastDateText) {
                const item = _.find(contrastData, { originalId: xName }) || {};
                const xAxisName = isTime ? item.originalName : item.name;
                return {
                  name: xAxisName ? `${name} ${xAxisName} ` : name,
                  value: newValue,
                }
              } else {
                const item = _.find(sortData, { originalId: xName }) || {};
                const xAxisName = isTime ? item.originalName : item.name;
                return {
                  name: xAxisName ? `${name} ${xAxisName} ` : name,
                  value: newValue,
                }
              }
            },
          },
        }),
      };
    }
  }
  renderOverlay() {
    return (
      <Menu className="chartMenu" style={{ width: 160 }}>
        <Menu.Item onClick={this.handleRequestOriginalData} key="viewOriginalData">
          <div className="flexRow valignWrapper">
            <span>{_l('查看原始数据')}</span>
          </div>
        </Menu.Item>
      </Menu>
    );
  }
  renderCount() {
    const { newYaxisList } = this.state;
    const { summary, yaxisList } = this.props.reportData;
    const get = value => {
      const count = formatrChartValue(value, false, newYaxisList);
      const originalCount = value.toLocaleString() == count ? 0 : value.toLocaleString();
      return {
        count,
        originalCount
      }
    }
    const renderItem = data => {
      const { count, originalCount } = get(data.sum);
      return (
        <Fragment>
          <span>{formatSummaryName(data)}: </span>
          <span data-tip={originalCount ? originalCount : null} className="count Font22">{count || 0}</span>
        </Fragment>
      );
    }

    if ('all' in summary) {
      const { all, controlList = [] } = summary;
      return (
        <div className="flexRow" style={{ flexWrap: 'wrap' }}>
          {all && (
            <div className="flexRow mRight10" style={{ alignItems: 'baseline' }}>
              {renderItem(summary)}
            </div>
          )}
          {controlList.map(data => (
            <div className="flexRow mRight10" style={{ alignItems: 'baseline' }}>
              {renderItem({
                ...data,
                name: data.name || _.get(_.find(yaxisList, { controlId: data.controlId }), 'controlName')
              })}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className="pBottom10">
          {renderItem(summary)}
        </div>
      );
    }
  }
  render() {
    const { count, originalCount, dropdownVisible, offset } = this.state;
    const { summary, displaySetup = {} } = this.props.reportData;
    return (
      <div className="flex flexColumn chartWrapper">
        <Dropdown
          visible={dropdownVisible}
          onVisibleChange={(dropdownVisible) => {
            this.setState({ dropdownVisible });
          }}
          trigger={['click']}
          placement="bottomLeft"
          overlay={this.renderOverlay()}
        >
          <div className="Absolute" style={{ left: offset.x, top: offset.y }}></div>
        </Dropdown>
        {displaySetup.showTotal && this.renderCount()}
        <div className="h100" ref={el => (this.chartEl = el)}></div>
      </div>
    );
  }
}
