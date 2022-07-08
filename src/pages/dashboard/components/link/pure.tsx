import React, { EventHandler } from 'react';
import styles from './link.module.less';
import cls from 'classnames';

export interface LinkProps extends React.PropsWithChildren<any> {
  href?: string;
  className?: string;
  onClick: EventHandler<any>
}

export const Link: React.FunctionComponent<LinkProps> = (
  {
    href,
    className,
    children,
    onClick,
  }: LinkProps,
) => (
    <a title={href} onClick={onClick} className={cls(styles.link, className)}>
      {children}
    </a>
);
