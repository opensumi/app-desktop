<h1 align="center">OpenSumi Mini-App Layout Sample</h1>
<div align="center">

[![License][license-image]][license-url]
[![CLA assistant][cla-image]][cla-url]


[license-url]: https://github.com/opensumi/ide-startup/blob/master/LICENSE
[license-image]: https://img.shields.io/npm/l/@opensumi/ide-core-common.svg
[cla-image]: https://cla-assistant.io/readme/badge/opensumi/core
[cla-url]: https://cla-assistant.io/opensumi/core

</div>
本项目用于展示类小程序 IDE 的布局实现。

![perview](https://img.alicdn.com/imgextra/i2/O1CN01GWtFj61dYArfmovB9_!!6000000003747-2-tps-2624-1804.png)

[English](./README.md) | 简体中文

## 启动

```bash
$ git clone git@github.com:opensumi/app-desktop.git
$ cd app-desktop
$ yarn
$ yarn build
$ yarn start
```

## 项目结构

```bash
src
├── base
├── bootstrap                     
├── editor
│   ├── build                    # 构建配置
│   ├── browser
│   ├── common
│   ├── node
│   ├── modules                  # 自定义模块存放位置
│   ├── extension                # 内置插件存放位置
│   └── main
├── pages
│   ├── dashboard
├── package.json
└── README.md
```

## 启动配置

- `SUMI_DEBUG=true` allows to display DEBUG level logs.
- `DEV_TOOLS=true` always open the devtools when app start.

## 协议

Copyright (c) 2019-present Alibaba Group Holding Limited, Ant Group Co. Ltd.

Licensed under the [MIT](LICENSE) license.
