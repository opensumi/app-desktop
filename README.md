# 桌面端

## 快速开始

### 编译本地项目

```
yarn          # 安装依赖
yarn rebuild-native -- --force-rebuild=true # 编译为 electron 支持的 node 模块
yarn download-extension # 下载插件
yarn build  # 打包资源
yarn start  # 启动开发版
```

## 文件目录

源码目录

```
src # 框架代码
├── base            # 可以共用的代码
│   ├── browser
│   ├── common
│   ├── main
│   ├── node
├── bootstrap
│   └── index.ts  # 程序主入口
├── editor
│   ├── browser
│   ├── main
│   ├── modules    # editor 的一些自有模块
│   │   ├── cli
│   │   ├── dock
│   │   ├── top-tab
│   │   ├── tracker
│   │   ├── updater
│   │   └── utils
│   ├── package.json
└── pages
    ├── auth
    ├── dashboard
```

产出目录

```
app # 编译代码的主目录
├── bootstrap
│   ├── index.js
│   └── node
├── editor
│   ├── browser
│   ├── main
│   ├── node
│   └── webview
├── package.json
└── pages
    ├── auth
    ├── dashboard
        ├── index.html
        └── index.js
```

## 开始开发

### 常见的开发环境变量：

- `SUMI_DEBUG=true` 可以让 app-desktop 的显示 DEBUG 级别的日志，包括 `KTLOG_SHOW_DEBUG` 的 debug 日志
- `DEV_TOOLS=true` 让程序启动的时候，就打开 devtools 工具

macOS 签名变量：

- APPLE_ID
- APPLE_ID_PASSWORD
- ASC_PROVIDER

windows 签名变量：

- WIN_CSC_LINK
- WIN_CSC_KEY_PASSWORD
