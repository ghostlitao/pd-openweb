export const FROM_TYPE = {
  PERSONAL: 0, // 个人好友
  GROUPS: 1, // 群组
  NORMAL: 4, // 网络
};

export const TAB_MODE = {
  PUBLIC_LINK: 1,
  MOBILE_EMAIL: 2,
  ADDRESS_BOOK: 3,
};

export const DETAIL_MODE = {
  NORMAL: 0,
  LINK: 1, // 使用链接
  INVITE: 2, // 邀请记录
};

export const DETAIL_MODE_TEXT = {
  1: _l('查看使用中的链接'),
  2: _l('邀请记录'),
};

export const TABS = [
  { text: _l('公开邀请'), value: 1, subText: _l('链接添加') },
  { text: _l('手机/邮箱邀请'), value: 2, subText: _l('搜索用户') },
  { text: _l('从通讯录邀请'), value: 3 },
];
