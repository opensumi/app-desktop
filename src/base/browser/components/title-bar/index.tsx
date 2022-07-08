import React from 'react';
import cls from 'classnames';
import { isMac } from 'base/common/utils/platform';
import { iconStyleSheets } from 'base/browser/constants';

import styles from './index.module.less';

interface TitleBarProps {
  title?: string;
  hidden?: boolean;
  children?: JSX.Element | string | undefined;
  leftComponent?: JSX.Element | undefined;
  rightComponent?: JSX.Element | undefined;
}

export const TitleBar = (props: TitleBarProps) => {
  const { title, children, hidden, leftComponent: left, rightComponent: right } = props;
  if (hidden) {
    return null;
  }

  const leftComponent = left || <div></div>;

  const iconMap = iconStyleSheets[0].iconMap;
  const quitClassName = iconStyleSheets[0].prefix + iconMap.windows_quit;
  const windowActions = (
    <div
      className={cls(quitClassName, styles.close)}
      onClick={() => {
        window.close();
      }}
    />
  );

  let rightComponent = right;
  if (!rightComponent && !isMac) {
    rightComponent = windowActions;
  }

  return (
    <div className={styles.navigatorbar}>
      {leftComponent}
      <header>{children || title}</header>
      {rightComponent}
    </div>
  );
};
