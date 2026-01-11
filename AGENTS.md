# PROJECT KNOWLEDGE BASE

**Generated:** 2026-01-11 21:05
**Commit:** 6a73241 (0.8.4)
**Branch:** master

## OVERVIEW
libwx - Node.js 端微信 SDK。支持公众号 H5、小程序、APP 平台，提供授权登录、用户信息、消息发送、模板消息、二维码生成等功能。

## STRUCTURE
```
libwx/
├── src/index.ts      # 主实现 (Weixin 类)
├── lib/index.js      # 编译输出 (package.json main)
├── index.d.ts       # 类型定义 (package.json types) - 根目录位置
├── eslint.config.js  # AlloyTeam ESLint 配置 (1400+ 行)
├── tsconfig.json     # TypeScript 编译配置
├── .prettierrc.js   # Prettier 格式化配置
└── package.json     # 项目配置
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| 微信 API 实现 | src/index.ts | Weixin 类所有方法 |
| 类型定义 | index.d.ts | 导入路径为 `from '..'` |
| 代码规范 | eslint.config.js | 260+ 规则，中文注释 |
| 编译配置 | tsconfig.json | 输出到 lib/ 目录 |

## CONVENTIONS
- **代码风格**: 2 空格缩进、单引号、LF 换行、行尾分号
- **类型定义**: 优先 interface > type
- **导入类型**: 必须使用 `import type`
- **比较**: 必须使用 `===`/`!==`，禁止 `==`/`!=`
- **变量**: 禁止 `var`，优先 `const`
- **模板字符串**: 必须使用模版字符串而非字符串连接

## ANTI-PATTERNS (THIS PROJECT)
- **禁止 @ts-ignore**: ESLint 配置禁止，但 src/index.ts 有 7 处违规 (lines 94, 123, 129, 238, 378, 433, 470)
- **禁止 any 类型**: 使用 @ts-expect-error 替代
- **禁止 var**: 使用 const/let
- **禁止魔法数字**: 定义常量
- **禁止 console.log**: 生产代码中禁止
- **禁止 eval/Function 构造函数**

## UNIQUE STYLES
- **类型定义位置**: index.d.ts 在根目录（非标准），src/index.ts 通过 `import { ... } from '..'` 导入
- **Token 缓存**: 支持多副本共享 access_token (通过 `setGlobalTokenCache`/`getGlobalTokenCache`)
- **平台区分**: 通过 `options.channel` 区分 'jssdk' | 'app' | 'wxapp'
- **错误处理**: 微信 API 错误时，Error 对象附加 `errcode` 属性

## COMMANDS
```bash
yarn tsc           # 编译 TypeScript → lib/
yarn tsc-watch     # 监听模式编译
yarn eslint        # 代码检查
yarn eslint:fix    # 自动修复
yarn prettier      # 格式检查
yarn prettier:fix  # 格式修复
yarn fix           # 同时运行 eslint:fix + prettier:fix
```

## NOTES
- **无测试基础设施**: 无测试框架、测试文件、CI/CD
- **无 GitHub Actions**: 手动发布到 npm
- **Token 自动刷新**: `request()` 方法自动处理 access_token 过期
- **发布内容**: 仅 lib/index.js + index.d.ts (src/ 不发布)
