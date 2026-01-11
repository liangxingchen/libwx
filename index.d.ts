import type { RequestInit } from 'akita';

export interface Options {
  /**
   * 平台渠道
   */
  channel?: 'jssdk' | 'app' | 'wxapp';
  /**
   * APP ID
   */
  appid: string;
  /**
   * 秘钥
   */
  secret: string;
  /**
   * 全局Token缓存器
   * 当多副本运行时，需在多副本之间共享全局 access_token 否则会报错 invalid credential, access_token is invalid or not latest
   */
  setGlobalTokenCache?: (token: string, expiredAt: number) => Promise<void>;
  /**
   * 全局Token缓存器
   * 当多副本运行时，需在多副本之间共享全局 access_token 否则会报错 invalid credential, access_token is invalid or not latest
   */
  getGlobalTokenCache?: () => Promise<string | null>;
}

/**
 * HTTP请求配置接口
 * 用于调用微信API的通用请求参数
 * 自动为URL添加 access_token 参数
 */
export interface Request extends RequestInit {
  /**
   * HTTP请求方法
   */
  method?: 'GET' | 'POST';
  /**
   * 请求URL地址
   * 可以是完整URL或相对路径（相对于 https://api.weixin.qq.com）
   */
  url: string;
  /**
   * URL查询参数对象
   * 会被自动序列化为查询字符串
   */
  query?: any;
  /**
   * 请求体数据
   * POST请求时使用，会被自动JSON序列化
   */
  body?: any;
}

/**
 * 微信API统一响应包装类型
 * 所有微信API响应都包含错误码和错误消息
 *
 * @template T - 响应数据类型
 *
 * @example 成功响应: { errcode: 0, errmsg: 'ok', data: {...} }
 * @example 失败响应: { errcode: 40001, errmsg: 'invalid credential' }
 */
export type Result<T = {}> = T & {
  /**
   * 错误码
   * 0 表示成功，非0 表示失败
   * 常见错误码:
   * - 40001: 无效的凭证
   * - 40002: 不合法的凭证类型
   * - 40003: 不合法的OpenID
   * - 42001: access_token超时
   * - 42002: refresh_token超时
   */
  errcode: number;
  /**
   * 错误描述信息
   * 成功时为 "ok"，失败时为具体错误原因
   */
  errmsg: string;
};

/**
 * 微信JSSDK配置对象
 * 用于前端调用微信JS-SDK时的签名配置
 * 由 getJsConfig() 方法生成
 */
export interface JsConfig {
  /**
   * 微信JS-SDK临时票据
   * 用于生成签名，有效期7200秒
   */
  jsapi_ticket: string;
  /**
   * 生成签名的时间戳（秒）
   */
  timestamp: number;
  /**
   * 签名字符串
   * 使用 SHA1 算法生成，用于验证请求合法性
   */
  signature: string;
  /**
   * 公众号的 appid
   */
  appId: string;
  /**
   * 随机字符串
   * 用于生成签名的随机参数
   */
  nonceStr: string;
  /**
   * 需要使用的JS接口列表
   * 如: ['chooseImage', 'previewImage', 'uploadImage']
   * 如果不提供，默认包含31个常用接口
   */
  jsApiList: string[];
}

export interface JsConfigOptions {
  /**
   * JSSDK 业务域名
   * 必填，当前网页的完整URL
   */
  url: string;
  /**
   * 是否开启调试模式
   * true: 在控制台输出调试信息，会弹窗显示alert
   * false: 不输出调试信息（默认）
   */
  debug?: boolean;
  /**
   * 需要使用的微信JS接口列表
   * 不填则默认包含31个常用接口
   * 常用接口: chooseImage, previewImage, uploadImage, downloadImage, getLocation, scanQRCode 等
   */
  jsApiList?: string[];
}

/**
 * 用户账户 AccessToken
 */
export interface AccessToken {
  /**
   * 用户 openid
   */
  openid: string;
  /**
   * 用户 unionid
   */
  unionid?: string;
  /**
   * 会话密钥，只小程序平台可用
   */
  session_key?: string;
  /**
   * 会话令牌，只公众号可用
   */
  access_token?: string;
  /**
   * 会话令牌过期时间，只公众号可用
   */
  expires_in?: number;
  /**
   * 刷新会话令牌，只公众号可用
   */
  refresh_token?: string;
  /**
   * 用户授权的作用域，只公众号可用
   */
  scope?: string;
}

/**
 * 网页授权用户信息
 */
export interface AuthInfo {
  openid: string;
  unionid?: string;
  nickname: string;
  sex: 1 | 2 | 0;
  province: string;
  city: string;
  country: string;
  headimgurl: string;
  privilege?: string[];
}

/**
 * 微信关注者信息
 */
export interface UserInfo {
  openid: string;
  unionid?: string;
  subscribe: 0 | 1;
  language: string;
  subscribe_time: number;
  remark: string;
  groupid: number;
  tagid_list: number[];
  subscribe_scene: SubscribeScene;
  qr_scene: number;
  qr_scene_str: string;
}

/**
 * 获取用户列表返回值
 */
export interface GetUserListResult {
  /**
   * 关注该公众账号的总用户数
   */
  total: number;
  /**
   * 拉取的OPENID个数，最大值为10000
   * 如果为10000说明还有下页
   */
  count: number;
  data: {
    /**
     * openid 字符串列表
     */
    openid: string[];
  };
  /**
   * 下一页 next_openid 参数
   */
  next_openid: string;
}

/**
 * 素材类型
 */
export type MaterialType = 'image' | 'video' | 'voice' | 'news';

/**
 * 素材
 * 永久素材对象，由 getMaterialList() 返回
 */
export interface Material {
  /**
   * 素材ID
   * 用于在客服消息等接口中引用该素材
   */
  media_id: string;
  /**
   * 更新时间
   * 时间戳格式，如: "1517629847"
   */
  update_time: string;
  /**
   * 素材名称
   * 图片、语音、视频 类型素材可用
   */
  name?: string;
  /**
   * 素材URL
   * 图片、语音、视频 类型素材可用
   * 永久素材通过该URL访问
   */
  url?: string;
  /**
   * 图文消息素材内容
   * 仅 news 类型素材有此字段
   */
  content?: {
    /**
     * 图文消息列表
     */
    news_item: Array<{
      /** 图文消息标题 */
      title: string;
      /** 缩略图素材ID */
      thumb_media_id: string;
      /** 是否显示封面 */
      show_cover_pic: number;
      /** 作者 */
      author: string;
      /** 摘要 */
      digest: string;
      /** 图文消息内容 */
      content: string;
      /** 图文消息链接 */
      url: string;
      /** 缩略图URL */
      thumb_url: string;
      /** 原文链接 */
      content_source_url: string;
      /** 是否打开评论 */
      need_open_comment?: number;
      /** 是否只有粉丝可以评论 */
      only_fans_can_comment?: number;
    }>;
  };
}

/**
 * 获取素材列表返回结果
 * 由 getMaterialList() 方法返回
 */
export interface GetMaterialListResult {
  /**
   * 素材总数
   * 该类型的素材总数量
   */
  total_count: number;
  /**
   * 本次返回的素材数量
   * 固定为20条，通过 offset 参数分页获取更多
   */
  item_count: number;
  /**
   * 素材列表
   * Material 对象数组，包含素材的详细信息
   */
  item: Material[];
}

/**
 * 自定义菜单按钮类型
 * 用于配置公众号菜单按钮的交互行为
 * https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html
 */
export type ButtonType =
  /** 小程序类型 - 跳转到小程序 */
  | 'miniprogram'
  /** 点击推事件 - 用户点击后，微信服务器会推送事件消息 */
  | 'click'
  /** 跳转URL - 用户点击后，打开网页链接 */
  | 'view'
  /** 扫码推事件 - 用户点击后，调起微信扫一扫 */
  | 'scancode_push'
  /** 扫码带提示 - 用户点击后，调起微信扫一扫并显示结果 */
  | 'scancode_waitmsg'
  /** 系统拍照发图 - 用户点击后，调用系统相机拍照 */
  | 'pic_sysphoto'
  /** 拍照或者相册发图 - 用户点击后，可选择拍照或相册 */
  | 'pic_photo_or_album'
  /** 微信相册发图 - 用户点击后，打开微信相册 */
  | 'pic_weixin'
  /** 发送位置 - 用户点击后，选择地理位置发送 */
  | 'location_select'
  /** 下发消息 - 用户点击后，下发永久素材 */
  | 'media_id'
  /** 跳转图文消息URL - 用户点击后，打开图文消息页面 */
  | 'view_limited';

/**
 * 自定义菜单按钮
 * https://developers.weixin.qq.com/doc/offiaccount/Custom_Menus/Creating_Custom-Defined_Menu.html
 */
export interface Button {
  /**
   * 按钮名称
   */
  name: string;
  /**
   * 按钮类型
   */
  type?: ButtonType;
  /**
   * 二级按钮列表，只第一级按钮可设置
   */
  sub_button?: Button[];
  /**
   * 网页链接，用户点击菜单可打开链接
   */
  url?: string;
  /**
   * 调用新增永久素材接口返回的合法media_id
   */
  media_id?: string;
  /**
   * 小程序的appid
   */
  appid?: string;
  /**
   * 小程序的页面路径
   */
  pagepath?: string;
}

/**
 * 微信公众号自定义菜单
 * 由最多3个一级菜单组成，每个一级菜单最多包含5个二级菜单
 */
export interface Menu {
  /**
   * 菜单按钮列表
   * 一级菜单数组，每个按钮可以包含 sub_button 二级菜单
   */
  button: Button[];
}

/**
 * 客服消息接口
 * 用于向用户主动发送客服消息
 * 根据msgtype类型，只能设置对应的字段
 */
export interface Message {
  /**
   * 接收消息的用户的 openid
   */
  touser: string;
  /**
   * 消息类型
   * 根据不同类型，需要设置对应的消息内容字段
   */
  msgtype: /** 文本消息 */
    | 'text'
    /** 图片消息 */
    | 'image'
    /** 语音消息 */
    | 'voice'
    /** 视频消息 */
    | 'video'
    /** 音乐消息 */
    | 'music'
    /** 图文消息 */
    | 'news'
    /** 图文消息（mpnews） */
    | 'mpnews'
    /** 菜单消息 */
    | 'msgmenu'
    /** 卡券消息 */
    | 'wxcard'
    /** 小程序卡片消息 */
    | 'miniprogrampage';
  /**
   * 文本消息内容
   * 当 msgtype 为 'text' 时设置
   */
  text?: { content: string };
  /**
   * 图片消息
   * 当 msgtype 为 'image' 时设置
   */
  image?: { media_id: string };
  /**
   * 语音消息
   * 当 msgtype 为 'voice' 时设置
   */
  voice?: { media_id: string };
  /**
   * 视频消息
   * 当 msgtype 为 'video' 时设置
   */
  video?: { media_id: string; thumb_media_id: string; title: string; description: string };
  /**
   * 音乐消息
   * 当 msgtype 为 'music' 时设置
   */
  music?: {
    media_id: string;
    thumb_media_id: string;
    title: string;
    description: string;
    musicurl: string;
    hqmusicurl: string;
  };
  /**
   * 图文消息
   * 当 msgtype 为 'news' 时设置
   */
  news?: {
    articles: Array<{
      title: string;
      description: string;
      url: string;
      picurl: string;
    }>;
  };
  /**
   * 图文消息（mpnews类型）
   * 当 msgtype 为 'mpnews' 时设置
   */
  mpnews?: { media_id: string };
  /**
   * 菜单消息
   * 当 msgtype 为 'msgmenu' 时设置
   */
  msgmenu?: {
    head_content: string;
    tail_content: string;
    list: Array<{
      id: string;
      content: string;
    }>;
  };
  /**
   * 卡券消息
   * 当 msgtype 为 'wxcard' 时设置
   */
  wxcard?: { card_id: string };
  /**
   * 小程序卡片消息
   * 当 msgtype 为 'miniprogrampage' 时设置
   */
  miniprogrampage?: {
    title: string;
    appid: string;
    pagepath: string;
    thumb_media_id: string;
  };
  /**
   * 转接客服消息
   * 当 msgtype 为 'customservice' 时设置
   */
  customservice?: {
    kf_account: string;
  };
}

/**
 * 模板消息接口
 * 用于向用户发送服务通知（如：订单状态、支付成功等）
 * https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Template_Message_Interface.html
 */
export interface TemplateMessage {
  /**
   * 接收消息的用户的 openid
   */
  touser: string;
  /**
   * 模板ID
   * 在微信公众平台后台->功能->模板消息中获取
   */
  template_id: string;
  /**
   * 点击模板消息后跳转的URL
   * 不填写则无跳转
   */
  url?: string;
  /**
   * 跳转小程序配置
   * 点击消息后跳转到指定小程序页面
   */
  miniprogram?: {
    /**
     * 小程序的 appid
     */
    appid: string;
    /**
     * 小程序的页面路径
     */
    pagepath?: string;
  };
  /**
   * 模板数据
   * key 为模板变量名，value 为变量值
   * 格式: { "key1": { "value": "value1", "color": "#173177" } }
   */
  data: {
    [key: string]: {
      /**
       * 变量值
       */
      value: string;
      /**
       * 模板内容字体的颜色
       * 不填则默认为黑色
       */
      color?: string;
    };
  };
}

/**
 * 用户关注公众号的场景来源
 * 用于统计用户是通过什么渠道关注公众号的
 */
export type SubscribeScene =
  /** 公众号搜索 */
  | 'ADD_SCENE_SEARCH'
  /** 帐号迁移 */
  | 'ADD_SCENE_ACCOUNT_MIGRATION'
  /** 扫描名片二维码 */
  | 'ADD_SCENE_PROFILE_CARD'
  /** 扫描二维码 */
  | 'ADD_SCENE_QR_CODE'
  /** 图文页内名称点击 */
  | 'ADD_SCENEPROFILE'
  /** 图文页内图标点击 */
  | 'ADD_SCENE_PROFILE_ITEM'
  /** 支付后关注 */
  | 'ADD_SCENE_PAID'
  /** 其他 */
  | 'ADD_SCENE_OTHERS';

/**
 * 下载的媒体文件数据
 * 由 downloadMedia() 方法返回
 * 扩展自 Buffer，增加了媒体类型属性
 */
export interface MediaData extends Buffer {
  /**
   * 媒体文件类型
   * 如: image/jpeg, audio/mp3, video/mp4
   */
  type: string;
}

/**
 * 获取公众号二维码参数
 */
export interface QrCodeOptions {
  /**
   * 二维码类型
   * QR_SCENE 为临时的整型参数值
   * QR_STR_SCENE 为临时的字符串参数值
   * QR_LIMIT_SCENE 为永久的整型参数值
   * QR_LIMIT_STR_SCENE 为永久的字符串参数值
   */
  action_name: 'QR_SCENE' | 'QR_STR_SCENE' | 'QR_LIMIT_SCENE' | 'QR_LIMIT_STR_SCENE';
  /**
   * 该二维码有效时间，以秒为单位。 最大不超过2592000（即30天）
   * 此字段如果不填，则默认有效期为30秒。
   */
  expire_seconds?: number;
  /**
   * 二维码详细信息
   */
  action_info: {
    scene: {
      /**
       * 场景值ID
       * 临时二维码时为32位非0整型，永久二维码时最大值为100000
       */
      scene_id?: number;
      /**
       * 场景值ID（字符串形式的ID）
       * 字符串类型，长度限制为1到64
       */
      scene_str?: string;
    };
  };
}

/**
 * 生成小程序二维码参数
 * 用于生成小程序码（适用于需要的码数量极多的业务场景）
 * https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.html
 */
export interface WXACodeOptions {
  /**
   * 最大32个可见字符，支持数字、大小写英文以及部分特殊字符
   * 如: id=1234&a=b
   */
  scene: string;
  /**
   * 小程序页面路径
   * 不能带参数，根路径前不要加 /
   * 如: pages/index/index
   */
  page?: string;
  /**
   * 二维码宽度
   * 单位: px，最小280，最大1280，默认430
   */
  width?: number;
  /**
   * 是否自动配置线条颜色
   * 如果为 true，则使用 line_color 设置颜色
   * 如果为 false，则使用默认黑色
   */
  auto_color?: boolean;
  /**
   * 线条颜色配置
   * 当 auto_color 为 false 时生效
   */
  line_color?: {
    /** 红色值，0-255 */
    r: number;
    /** 绿色值，0-255 */
    g: number;
    /** 蓝色值，0-255 */
    b: number;
  };
  /**
   * 是否需要透明底色
   * true 表示生成透明底色的小程序码
   * 默认为 false
   */
  is_hyaline?: boolean;
}

/**
 * 微信SDK主类
 * 封装了微信公众号、小程序、APP的常用API
 */
export default class Weixin {
  /**
   * SDK配置选项
   */
  options: Options;

  /**
   * 构造函数
   * @param options - SDK配置选项
   *   - appid: 微信应用ID（必填）
   *   - secret: 微信应用密钥（必填）
   *   - channel: 平台类型，默认 'jssdk'（公众号）
   *   - setGlobalTokenCache: 多实例共享token的缓存设置器
   *   - getGlobalTokenCache: 多实例共享token的缓存获取器
   *
   * @example 基本初始化
   * ```ts
   * const wx = new Weixin({
   *   appid: 'your_appid',
   *   secret: 'your_secret',
   *   channel: 'jssdk'
   * });
   * ```
   */
  constructor(options?: Options);

  /**
   * 设置libwx选项
   * @param {Options} options
   */
  setOptions(options: Options): void;

  /**
   * 获取全局访问token
   * @param {boolean} [refresh] 是否强制刷新
   */
  getGlobalToken(refresh?: boolean): Promise<string>;

  /**
   * 通用请求方法，自动会为url加上 access_token 参数
   * @param {string} req
   */
  request(req: Request): Promise<any>;

  /**
   * 获取全局访问Ticket
   */
  getTicket(): Promise<string>;

  /**
   * 获取公众号h5平台 JSSDK Config
   * @param {JsConfigOptions} options
   */
  getJsConfig(options: JsConfigOptions): Promise<JsConfig>;

  /**
   * 获取用户 AccessToken
   * 小程序和公众号都可用
   * @param {string} code
   */
  getAccessToken(code: string): Promise<AccessToken>;

  /**
   * 获取网页授权用户信息
   * 只公众号可用
   * @param {string} openid
   * @param {string} access_token 用户 access_token，并非全局 access_token
   */
  getAuthInfo(openid: string, access_token: string): Promise<AuthInfo>;

  /**
   * 获取公众号关注者信息
   * 只公众号可用
   * @param {string} openid
   */
  getUserInfo(openid: string): Promise<UserInfo>;

  /**
   * 获取公众号关注者列表
   * 只公众号可用
   * @param {string} [next_openid] 下一页开头，如果不传从第一页开始
   */
  getUserList(next_openid?: string): Promise<GetUserListResult>;

  /**
   * 获取永久素材列表，每页20条
   * 只公众号可用
   * @param {string} type 素材类型
   * @param {number} [offset] 从全部素材的该偏移位置开始返回，0表示从第一个素材
   */
  getMaterialList(type: MaterialType, offset?: number): Promise<GetMaterialListResult>;

  /**
   * 创建自定义菜单
   * 只公众号可用
   */
  createMenu(menu: Menu): Promise<Result>;

  /**
   * 获取自定义菜单
   * 只公众号可用
   */
  getMenu(): Promise<Menu>;

  /**
   * 向用户发送消息
   * 只公众号可用
   * @param {Message} message
   */
  sendMessage(message: Message): Promise<Result<{ msgid: number }>>;

  /**
   * 向用户发送模板消息
   * 只公众号可用
   * @param {TemplateMessage} message
   */
  sendTemplateMessage(message: TemplateMessage): Promise<Result<{ msgid: number }>>;

  /**
   * 下载媒体文件数据
   * @param {string} media_id
   */
  downloadMedia(media_id: string): Promise<MediaData>;

  /**
   * 生成公众号二维码
   * 只公众号可用
   * @param {QrCodeOptions} options 二维码选项
   */
  getQrCode(options: QrCodeOptions): Promise<{ ticket: string; expire_seconds: number; url: string }>;

  /**
   * 生成小程序二维码
   * @param {WXACodeOptions} options 二维码选项
   */
  getWXACodeUnlimit(options: WXACodeOptions): Promise<Buffer>;

  /**
   * 监测图片是否包含违规内容
   * 如果有违规内容，返回false
   * 图片应小于1M，像素小于 750px x 1334px
   * @param {Buffer} image 图片Buffer数据
   */
  imgSecCheck(image: Buffer): Promise<boolean>;
}
