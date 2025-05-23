export default {
  /**
  * 申请秘钥
  * @param {Object} args 请求参数
  * @param {string} args.serverId 服务器id
  * @param {string} args.projectName 网络名称
  * @param {string} args.job 职位
  * @param {integer} args.scaleId 规模
  * @param {string} args.licenseTemplateVersion 支持的密钥模板版本
  * @param {} args.licenseVersion
  * @param {string} args.channel 申请来源
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   applyLicenseCode: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'ApplyLicenseCode', args, options);
   },
  /**
  * 获取当前用户秘钥申请列表
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getLicenseList: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'GetLicenseList', args, options);
   },
  /**
  * 获取当前服务器秘钥申请列表（废弃）
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getServerLicenseList: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'GetServerLicenseList', args, options);
   },
  /**
  * 获取当前服务器信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getServerInfo: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'GetServerInfo', args, options);
   },
  /**
  * 获取当前授权信息
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPlatformLicenseInfo: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'GetPlatformLicenseInfo', args, options);
   },
  /**
  * 获取授权日志
  * @param {Object} args 请求参数
  * @param {integer} args.pageIndex 页码
  * @param {integer} args.pageSize 页大小
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getPlatformLicenseLogs: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'GetPlatformLicenseLogs', args, options);
   },
  /**
  * 获取升级服务到期时间
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getSupportInfo: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'GetSupportInfo', args, options);
   },
  /**
  * 密钥验证
  * @param {Object} args 请求参数
  * @param {string} args.licenseCode 授权码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   verifyLicenseCode: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'VerifyLicenseCode', args, options);
   },
  /**
  * 添加授权
  * @param {Object} args 请求参数
  * @param {string} args.licenseCode 授权码
  * @param {array} args.projectIds 组织Id列表
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   bindLicenseCode: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'BindLicenseCode', args, options);
   },
  /**
  * 添加增值服务授权
  * @param {Object} args 请求参数
  * @param {string} args.licenseCode 授权码
  * @param {} args.extendFunType
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   bindTrialLicenseCode: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'BindTrialLicenseCode', args, options);
   },
  /**
  * 获取组织列表
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getProjects: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'GetProjects', args, options);
   },
  /**
  * 绑定组织
  * @param {Object} args 请求参数
  * @param {array} args.projectIds 网络id
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   bindProject: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'BindProject', args, options);
   },
  /**
  * 获取初始化状态
  * @param {Object} args 请求参数
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   getGuideStepStatus: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'GetGuideStepStatus', args, options);
   },
  /**
  * 创建管理员账号（安装流程）
  * @param {Object} args 请求参数
  * @param {string} args.name 姓名
  * @param {string} args.email 邮箱
  * @param {string} args.password 密码
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addAdmin: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'AddAdmin', args, options);
   },
  /**
  * 创建组织（安装流程）
  * @param {Object} args 请求参数
  * @param {string} args.name 网络名称
  * @param {Object} options 配置参数
  * @param {Boolean} options.silent 是否禁止错误弹层
  * @returns {Promise<Boolean, ErrorModel>}
  **/
   addProject: function (args, options = {}) {
     
     return mdyAPI('PrivateGuide', 'AddProject', args, options);
   },
};
