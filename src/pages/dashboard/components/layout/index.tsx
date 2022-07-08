import React from 'react';
import { MainSideNav } from '../main-side-nav';

import { FolderOpenOutlined } from '@ant-design/icons';
import { URI } from '@opensumi/ide-utils/lib/uri';
import { useDialogService, useWindowService } from 'base/browser/AppContext';
import style from './index.module.less';

export const BaseLayout = (props) => {
  const dialog = useDialogService();

  const winService = useWindowService();

  const openDialog = async () => {
    const paths = await dialog.showOpenDialog(
      {
        title: '打开项目',
        properties: ['openDirectory', 'createDirectory'],
      },
      window.id,
    );

    if (paths && paths.length > 0) {
      winService.openEditor(URI.file(paths[0]).toString());
    }
  };

  return (
    <div className={style.page}>
      <div className={style.sidebar}>
        <MainSideNav />
        <div className={style.openBtn} onClick={openDialog}>
          <FolderOpenOutlined className={style.openFolderIcon} />
          打开文件夹
        </div>
      </div>
      <div className={style.content}>{props.children}</div>
    </div>
  );
};
