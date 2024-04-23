import _ from 'lodash';
import { getRgbaByColor } from 'src/pages/widgetConfig/util';
import { generate } from '@ant-design/colors';

export const getGreetingText = () => {
  const hours = new Date().getHours();
  switch (true) {
    case hours < 6:
      return _l('凌晨好');
    case hours < 12:
      return _l('上午好');
    case hours < 18:
      return _l('下午好');
    default:
      return _l('晚上好');
  }
};

export const getAppOrItemColor = (appItem, isItem) => {
  const iconColor = appItem.iconColor || '#2196f3';
  const navColor = appItem.navColor || iconColor;
  const black = '#1b2025' === navColor;
  const light = [appItem.lightColor, '#ffffff', '#f5f6f7'].includes(navColor);

  const appBgColor = light ? appItem.lightColor : navColor || iconColor;
  const appIconColor = black || light ? iconColor : '#fff';
  const itemIconColor = black || light ? iconColor : appBgColor;
  return {
    bg: isItem ? getRgbaByColor(itemIconColor, '0.08') : appBgColor,
    iconColor: isItem ? itemIconColor : appIconColor,
  };
};

export const themeColors = [
  '#2196F3',
  '#2F54EB',
  '#732ED1',
  '#1EBCD5',
  '#4CAF50',
  '#FF0000',
  '#EB2F96',
  '#FD982E',
  '#FADB14',
];

export const getDashboardColor = color => {
  //默认主题
  if (!color || !_.includes(themeColors, color)) {
    return {
      bgColor: '#f7f8fc',
      themeColor: '#2196f3',
      activeColor: getRgbaByColor('#2196f3', '0.1'),
      hoverColor: getRgbaByColor('#2196f3', '0.16'),
    };
  }

  return {
    bgColor: color !== '#2196F3' ? generate(color)[0] : '#f7f8fc',
    themeColor: color,
    activeColor: getRgbaByColor(color, '0.1'),
    hoverColor: getRgbaByColor(color, '0.16'),
  };
};

export const coverUrls = [
  'ProjectLogo/bulletin_1.jpg',
  'ProjectLogo/bulletin_2.jpg',
  'ProjectLogo/bulletin_3.jpg',
  'ProjectLogo/bulletin_4.jpg',
  'ProjectLogo/bulletin_5.jpg',
  'ProjectLogo/bulletin_6.jpg',
  'ProjectLogo/bulletin_7.jpg',
  'ProjectLogo/bulletin_8.jpg',
];
