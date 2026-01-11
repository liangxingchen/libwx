# libwx

[![npm version](https://badge.fury.io/js/liangxingchen/libwx)](https://www.npmjs.com/package/libwx)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/liangxingchen/libwx/blob/master/LICENSE)

Node.js端微信SDK，支持微信公众号 H5、小程序、APP 平台，提供授权登录、用户信息、消息发送、模板消息、二维码生成等功能。

## 安装

```bash
npm install libwx
# 或
yarn add libwx
```

## 快速开始

### 初始化SDK

```typescript
import { Weixin } from 'libwx';

const wx = new Weixin({
  appid: 'your_appid',
  secret: 'your_secret',
  channel: 'jssdk'  // 平台类型: 'jssdk'(公众号) | 'app'(APP) | 'wxapp'(小程序)
});
```

### 平台说明

libwx 支持三个平台，不同平台支持不同的API功能：

| 平台 | 说明 | 可用API |
|--------|------|---------|
| `jssdk` | 微信公众号H5 | 全部API |
| `app` | 微信APP | 授权登录、用户信息、消息发送 |
| `wxapp` | 微信小程序 | 授权登录、用户信息、二维码生成、图片安全检测 |

### 多实例部署 (重要)

如果你的应用部署了多个实例（如多进程、多服务器），需要配置共享的token缓存，否则会报错：`invalid credential, access_token is invalid or not latest`

```typescript
import { Weixin } from 'libwx';

// 使用Redis或数据库实现跨实例共享token
const wx = new Weixin({
  appid: 'your_appid',
  secret: 'your_secret',
  channel: 'jssdk',
  // 设置token缓存
  setGlobalTokenCache: async (token: string, expiredAt: number) => {
    // 存储token和过期时间到Redis/数据库
    await redis.set('wx_token', token);
  },
  getGlobalTokenCache: async () => {
    // 从Redis/数据库获取token
    const token = await redis.get('wx_token');
    return token || null;
  }
});
```

## API 文档

### 1. 配置管理

#### `setOptions(options: Options): void`

更新SDK配置选项

```typescript
wx.setOptions({
  appid: 'new_appid',
  secret: 'new_secret'
});
```

---

### 2. Token管理

#### `getGlobalToken(refresh?: boolean): Promise<string>`

获取全局access_token，支持自动刷新和缓存

```typescript
// 获取token（自动缓存，7200秒有效期）
const token = await wx.getGlobalToken();

// 强制刷新token
const newToken = await wx.getGlobalToken(true);
```

#### `getTicket(): Promise<string>`

获取微信JSSDK的jsapi_ticket（缓存7200秒）

```typescript
const ticket = await wx.getTicket();
```

---

### 3. JSSDK配置

#### `getJsConfig(options: JsConfigOptions): Promise<JsConfig>`

生成前端JSSDK所需的配置对象（签名、appId、timestamp等）

```typescript
const config = await wx.getJsConfig({
  url: 'https://example.com/page',  // 当前网页完整URL（必填）
  debug: false,  // 是否开启调试模式（可选）
  jsApiList: ['chooseImage', 'previewImage']  // 需要使用的JS接口列表（可选，不填则默认31个）
});

// 将config传递给前端wx.config()
// wx.config(config);
```

**响应结构：**
```typescript
{
  jsapi_ticket: string,  // JSSDK临时票据
  timestamp: number,      // 生成签名的时间戳
  signature: string,      // SHA1签名
  appId: string,          // 公众号appid
  nonceStr: string,        // 随机字符串
  jsApiList: string[]     // 可用接口列表
}
```

---

### 4. 授权与用户信息

#### `getAccessToken(code: string): Promise<AccessToken>`

通过微信授权code换取用户access_token

```typescript
// 公众号H5授权
const token = await wx.getAccessToken(code);

// 小程序登录
const session = await wx.getAccessToken(code);
```

**AccessToken响应（公众号）：**
```typescript
{
  openid: string,        // 用户openid
  unionid?: string,     // 用户unionid
  access_token: string,  // 用户access_token
  expires_in: number,     // 过期时间（秒）
  refresh_token: string,  // 刷新token
  scope: string           // 授权作用域
}
```

**AccessToken响应（小程序）：**
```typescript
{
  openid: string,        // 用户openid
  unionid?: string,     // 用户unionid
  session_key: string    // 会话密钥
}
```

#### `getAuthInfo(openid: string, access_token: string): Promise<AuthInfo>`

获取网页授权用户的详细信息（仅公众号H5）

```typescript
const authInfo = await wx.getAuthInfo(openid, access_token);
```

**响应结构：**
```typescript
{
  openid: string,      // 用户openid
  unionid?: string,   // 用户unionid
  nickname: string,     // 昵称
  sex: 1|2|0,       // 性别: 1男 2女 0未知
  province: string,     // 省份
  city: string,        // 城市
  country: string,      // 国家
  headimgurl: string,  // 头像URL
  privilege?: string[]  // 用户特权信息
}
```

#### `getUserInfo(openid: string): Promise<UserInfo>`

获取公众号关注者的详细信息（仅公众号H5）

```typescript
const userInfo = await wx.getUserInfo(openid);
```

**响应结构：**
```typescript
{
  openid: string,           // 用户openid
  unionid?: string,        // 用户unionid
  subscribe: 0|1,          // 是否关注: 0未关注 1已关注
  language: string,           // 语言
  subscribe_time: number,    // 关注时间
  remark: string,             // 备注
  groupid: number,           // 分组ID
  tagid_list: number[],       // 标签ID列表
  subscribe_scene: 'ADD_SCENE_SEARCH' | 'ADD_SCENE_QR_CODE' | ...,  // 关注场景
  qr_scene: number,          // 二维码场景值
  qr_scene_str: string       // 二维码场景字符串
}
```

#### `getUserList(next_openid?: string): Promise<GetUserListResult>`

分页获取公众号关注者列表（仅公众号H5，每次最多10000条）

```typescript
// 获取第一页
const list1 = await wx.getUserList();

// 获取下一页
const list2 = await wx.getUserList(list1.next_openid);
```

**响应结构：**
```typescript
{
  total: number,           // 总关注者数
  count: number,           // 本次拉取的数量（最多10000）
  data: {
    openid: string[]      // openid列表
  },
  next_openid: string     // 下一页的起始openid
}
```

---

### 5. 素材管理

#### `getMaterialList(type: MaterialType, offset?: number): Promise<GetMaterialListResult>`

获取永久素材列表（仅公众号H5，每页20条）

```typescript
const result = await wx.getMaterialList('image', 0);
```

**参数：**
- `type`: 素材类型 - `'image'` | `'video'` | `'voice'` | `'news'`
- `offset`: 偏移位置（默认0）

**响应结构：**
```typescript
{
  total_count: number,   // 素材总数
  item_count: number,    // 本次返回数量（固定20）
  item: Material[]       // 素材列表
}
```

#### `downloadMedia(media_id: string): Promise<MediaData>`

从微信服务器下载媒体文件

```typescript
const mediaData = await wx.downloadMedia('media_id');
console.log(mediaData.type);  // 如: 'image/jpeg'
// mediaData 是Buffer类型，可直接写入文件
```

**MediaData结构：**
```typescript
interface MediaData extends Buffer {
  type: string;  // 媒体MIME类型，如: image/jpeg, audio/mp3
}
```

---

### 6. 菜单管理

#### `createMenu(menu: Menu): Promise<Result>`

创建/更新自定义菜单（仅公众号H5）

```typescript
await wx.createMenu({
  button: [
    {
      name: '今日推荐',
      type: 'click',
      key: 'V1001_TODAY_MUSIC'
    },
    {
      name: '搜索',
      type: 'view',
      url: 'https://www.soso.com/'
    }
  ]
});
```

**Button类型说明：**
| 类型值 | 说明 |
|--------|------|
| `click` | 点击推事件 |
| `view` | 跳转URL |
| `miniprogram` | 跳转小程序 |
| `scancode_push` | 扫码推事件 |
| `media_id` | 下发消息 |
| `view_limited` | 跳转图文消息URL |

完整按钮类型列表见 [ButtonType](#button-type)

#### `getMenu(): Promise<Menu>`

获取当前自定义菜单（仅公众号H5）

```typescript
const menu = await wx.getMenu();
console.log(menu.button);
```

---

### 7. 消息发送

#### `sendMessage(message: Message): Promise<Result<{msgid: number}>>`

发送客服消息给用户（仅公众号H5）

```typescript
// 发送文本消息
await wx.sendMessage({
  touser: 'openid',
  msgtype: 'text',
  text: { content: '你好' }
});

// 发送图片消息
await wx.sendMessage({
  touser: 'openid',
  msgtype: 'image',
  image: { media_id: 'media_id' }
});

// 发送图文消息
await wx.sendMessage({
  touser: 'openid',
  msgtype: 'news',
  news: {
    articles: [
      {
        title: '标题',
        description: '描述',
        url: 'https://example.com',
        picurl: 'https://example.com/image.jpg'
      }
    ]
  }
});
```

**支持的msgtype：**
- `text` - 文本消息
- `image` - 图片消息
- `voice` - 语音消息
- `video` - 视频消息
- `music` - 音乐消息
- `news` - 图文消息
- `mpnews` - 图文消息（mpnews）
- `msgmenu` - 菜单消息
- `wxcard` - 卡券消息
- `miniprogrampage` - 小程序卡片消息

#### `sendTemplateMessage(message: TemplateMessage): Promise<Result<{msgid: number}>>`

发送模板消息给用户（仅公众号H5）

```typescript
await wx.sendTemplateMessage({
  touser: 'openid',
  template_id: 'template_id',
  url: 'https://example.com',  // 点击消息后跳转的URL（可选）
  miniprogram: {  // 或跳转小程序（可选）
    appid: 'mini_appid',
    pagepath: 'pages/index'
  },
  data: {
    first: { value: '恭喜您购买成功' },
    keyword1: { value: '商品名称', color: '#173177' },
    keyword2: { value: '99.8元', color: '#173177' },
    keyword3: { value: '2024-01-11', color: '#173177' },
    remark: { value: '欢迎再次购买' }
  }
});
```

**TemplateMessage结构：**
```typescript
{
  touser: string,        // 接收者openid（必填）
  template_id: string,  // 模板ID（必填）
  url?: string,          // 点击后跳转URL（可选）
  miniprogram?: {       // 小程序配置（可选）
    appid: string,
    pagepath?: string
  },
  data: {             // 模板数据（必填）
    [key: string]: {
      value: string,      // 变量值
      color?: string     // 字体颜色，如: #173177
    }
  }
}
```

---

### 8. 二维码生成

#### `getQrCode(options: QrCodeOptions): Promise<{ticket, expire_seconds, url}>`

生成公众号二维码（仅公众号H5）

```typescript
// 生成临时二维码（30天有效期）
const qr = await wx.getQrCode({
  action_name: 'QR_SCENE',
  action_info: {
    scene: { scene_id: 123 }
  },
  expire_seconds: 2592000  // 最多30天
});

// 生成永久二维码
const qr = await wx.getQrCode({
  action_name: 'QR_LIMIT_SCENE',
  action_info: {
    scene: { scene_id: 100 }  // 永久二维码最大值100000
  }
});
```

**参数说明：**
- `action_name`: 二维码类型
  - `QR_SCENE` - 临时整型参数
  - `QR_STR_SCENE` - 临时字符串参数
  - `QR_LIMIT_SCENE` - 永久整型参数
  - `QR_LIMIT_STR_SCENE` - 永久字符串参数
- `expire_seconds`: 有效时间（秒），临时二维码最多2592000秒（30天）
- `action_info.scene`: 场景值
  - `scene_id`: 整型场景值（临时≤32位，永久≤100000）
  - `scene_str`: 字符串场景值（长度1-64）

**响应结构：**
```typescript
{
  ticket: string,         // 二维码ticket
  expire_seconds: number,  // 二维码有效时间（秒）
  url: string             // 二维码图片URL
}
```

#### `getWXACodeUnlimit(options: WXACodeOptions): Promise<Buffer>`

生成小程序码（仅小程序）

```typescript
const buffer = await wx.getWXACodeUnlimit({
  scene: 'id=1234',       // 最大32个可见字符
  page: 'pages/index',       // 小程序页面路径，根路径前不要加 /
  width: 430,               // 二维码宽度（默认430）
  auto_color: false,          // 是否使用默认黑色
  line_color: {              // 线条颜色配置
    r: 0,
    g: 0,
    b: 0
  },
  is_hyaline: false           // 是否需要透明底色
});

// buffer是图片Buffer，可保存为文件
```

**参数说明：**
- `scene`: 最大32个可见字符
- `page`: 小程序页面路径，不能带参数
- `width`: 宽度（280-1280，默认430）
- `auto_color`: 是否自动配置线条颜色
- `line_color`: 线条颜色（RGB，0-255）
- `is_hyaline`: 是否需要透明底色

---

### 9. 内容安全检测

#### `imgSecCheck(image: Buffer): Promise<boolean>`

检测图片是否包含违规内容（仅小程序）

```typescript
// 图片应小于1M，像素小于 750px x 1334px
const isSafe = await wx.imgSecCheck(imageBuffer);

if (!isSafe) {
  console.log('图片包含违规内容');
}
```

---

### 10. 通用请求

#### `request(req: Request): Promise<any>`

通用请求方法，自动为URL添加access_token参数

```typescript
const result = await wx.request({
  method: 'POST',
  url: '/cgi-bin/custom/api',
  query: { param1: 'value1' },
  body: { data: 'value2' }
});
```

**Request结构：**
```typescript
{
  method?: 'GET' | 'POST',  // HTTP方法
  url: string,                 // 请求URL
  query?: any,                // 查询参数
  body?: any                  // 请求体
}
```

---

## 错误处理

所有微信API响应都包含 `errcode` 和 `errmsg` 字段：

```typescript
try {
  const result = await wx.getAccessToken(code);
  // 处理成功逻辑
} catch (error) {
  // error 对象会被附加 errcode 属性
  console.error(error.errcode, error.errmsg);
}
```

**常见错误码：**
| 错误码 | 说明 |
|---------|------|
| 40001 | 无效的凭证 |
| 40002 | 不合法的凭证类型 |
| 40003 | 不合法的OpenID |
| 42001 | access_token超时 |
| 42002 | refresh_token超时 |

---

## 类型定义

完整的TypeScript类型定义，请查看 [index.d.ts](./index.d.ts)

**核心类型：**
- `Options` - SDK配置选项
- `Request` - HTTP请求配置
- `Result<T>` - 微信API响应包装类型
- `AccessToken` - 用户授权Token
- `AuthInfo` - 网页授权用户信息
- `UserInfo` - 公众号关注者信息
- `Message` - 客服消息
- `TemplateMessage` - 模板消息
- `QrCodeOptions` - 公众号二维码选项
- `WXACodeOptions` - 小程序码选项
- `Menu` - 自定义菜单
- `Button` - 菜单按钮

**联合类型：**
- `ButtonType` - 菜单按钮类型（11种）
- `MaterialType` - 素材类型（4种）
- `SubscribeScene` - 关注场景（8种）

---

## 完整示例

### 公众号H5完整流程

```typescript
import { Weixin } from 'libwx';

const wx = new Weixin({
  appid: 'your_appid',
  secret: 'your_secret',
  channel: 'jssdk'
});

async function main() {
  try {
    // 1. 生成JSSDK配置
    const jsConfig = await wx.getJsConfig({
      url: 'https://example.com/page'
    });
    console.log('JSSDK Config:', jsConfig);

    // 2. 通过code获取用户token
    const token = await wx.getAccessToken('auth_code');
    console.log('User Token:', token);

    // 3. 获取用户详细信息
    const authInfo = await wx.getAuthInfo(token.openid, token.access_token);
    console.log('User Info:', authInfo);

    // 4. 获取关注者列表
    const userList = await wx.getUserList();
    console.log('Total users:', userList.total);

    // 5. 发送模板消息
    await wx.sendTemplateMessage({
      touser: 'openid',
      template_id: 'template_id',
      data: {
        first: { value: '您有一条新消息' },
        keyword1: { value: '消息内容' },
        remark: { value: '请查收' }
      }
    });

    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error:', error.errcode, error.errmsg);
  }
}

main();
```

### 小程序完整流程

```typescript
import { Weixin } from 'libwx';

const wx = new Weixin({
  appid: 'your_appid',
  secret: 'your_secret',
  channel: 'wxapp'
});

async function main() {
  try {
    // 1. 用户登录
    const session = await wx.getAccessToken('wx_login_code');
    console.log('User OpenID:', session.openid);

    // 2. 生成小程序码
    const qrBuffer = await wx.getWXACodeUnlimit({
      scene: `uid=${session.openid}`,
      page: 'pages/index'
    });

    // 保存为文件
    const fs = require('fs');
    fs.writeFileSync('qrcode.png', qrBuffer);
    console.log('QR Code generated');

    // 3. 检测图片安全性
    const isSafe = await wx.imgSecCheck(qrBuffer);
    console.log('Image is safe:', isSafe);

  } catch (error) {
    console.error('Error:', error.errcode, error.errmsg);
  }
}

main();
```

---

## 常见问题

### 1. Token报错 "invalid credential, access_token is invalid or not latest"

**原因：** 多实例部署时，不同实例获取了不同的access_token

**解决方法：** 配置 `setGlobalTokenCache` 和 `getGlobalTokenCache` 实现token共享

### 2. JSSDK签名错误

**原因：** URL参数错误或签名计算问题

**解决方法：** 确保 `getJsConfig` 的 `url` 参数是当前页面的完整URL

### 3. 素材下载返回JSON错误

**原因：** media_id错误或素材已删除

**解决方法：** 检查media_id是否正确，素材是否已删除


---

## 许可证

MIT License

---

## 作者

[Liang Xingchen](https://github.com/liangxingchen)

