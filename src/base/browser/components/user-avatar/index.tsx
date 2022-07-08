import cls from 'classnames';
import React from 'react';

import styles from './index.module.less';

const defaultAvatarUrl = 'https://gravatar.com/avatar/4a4ed8e8f201d57b5f179446d8e429ab?s=400&d=robohash&r=x';

interface IUserAvatar {
  onClick: () => void;
  className?: string;
}
export const UserAvatar = ({ onClick, className }: IUserAvatar) => (
  <>
    <img className={cls(className || styles.user_avatar, styles.user_avatar_cursor)} src={defaultAvatarUrl} alt="Not Login" onClick={onClick} />
  </>
);
