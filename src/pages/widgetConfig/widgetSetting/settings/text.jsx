import React, { Fragment } from 'react';
import RadioGroup from 'ming-ui/components/RadioGroup';
import { SettingItem } from '../../styled';
import { getAdvanceSetting, handleAdvancedSettingChange } from 'src/pages/widgetConfig/util/setting';

const DISPLAY_OPTIONS = [
  {
    text: _l('单行'),
    value: 2,
  },
  {
    text: _l('多行'),
    value: 1,
  },
];

export default function Text(props) {
  const { data, onChange } = props;
  const { datamask } = getAdvanceSetting(data);
  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">{_l('类型')}</div>
        <RadioGroup
          size="middle"
          checkedValue={data.enumDefault === 0 ? 2 : data.enumDefault}
          data={DISPLAY_OPTIONS}
          onChange={value => {
            if (value !== 2 && datamask === '1') {
              onChange({ ...handleAdvancedSettingChange(data, { datamask: '0' }), enumDefault: value });
              return;
            }
            onChange({ enumDefault: value });
          }}
        />
      </SettingItem>
    </Fragment>
  );
}
