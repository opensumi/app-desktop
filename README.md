<h1 align="center">OpenSumi Mini-App Layout Sample</h1>
<div align="center">

[![License][license-image]][license-url]
[![CLA assistant][cla-image]][cla-url]


[license-url]: https://github.com/opensumi/ide-startup/blob/master/LICENSE
[license-image]: https://img.shields.io/npm/l/@opensumi/ide-core-common.svg
[cla-image]: https://cla-assistant.io/readme/badge/opensumi/core
[cla-url]: https://cla-assistant.io/opensumi/core

</div>
This project is used to show how custom layout like Mini-App IDE.

![perview](https://img.alicdn.com/imgextra/i2/O1CN01GWtFj61dYArfmovB9_!!6000000003747-2-tps-2624-1804.png)

English | [简体中文](./README-zh_CN.md)

## Quick Start

```bash
$ git clone git@github.com:opensumi/app-desktop.git
$ cd app-desktop
$ yarn
$ yarn build
$ yarn start
```

## Project Structure

```bash
src
├── base
├── bootstrap                     
├── editor
│   ├── build                    # Build configuration
│   ├── browser
│   ├── common
│   ├── node
│   ├── modules                  # Custom modules
│   ├── extension                # The Buit-in extensions
│   └── main
├── pages
│   ├── dashboard
├── package.json
└── README.md
```

## Start Options

- `SUMI_DEBUG=true` allows to display DEBUG level logs.
- `DEV_TOOLS=true` always open the devtools when app start.

## License

Copyright (c) 2019-present Alibaba Group Holding Limited, Ant Group Co. Ltd.

Licensed under the [MIT](LICENSE) license.
