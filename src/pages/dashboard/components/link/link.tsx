import React from 'react';
import styles from './link.module.less';
import cls from 'classnames';
import { useShellService } from 'base/browser/AppContext';

export interface LinkProps extends React.PropsWithChildren<any> {
  href?: string;
  className?: string;
}

export const Link: React.FunctionComponent<LinkProps> = (
  {
    href,
    className,
    children,
    onClick,
  }: LinkProps,
) => {
  const shell = useShellService();
  const open = () => {
    if (href) {
      shell.openExternal(href);
    }
  };

  return (
    <a title={href} onClick={onClick || open} className={cls(styles.link, className)}>
      {children}
    </a>
  );
};
