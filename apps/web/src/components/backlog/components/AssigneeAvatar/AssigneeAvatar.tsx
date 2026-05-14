import { CircleDashed } from '@phosphor-icons/react';

import { getAvatarTone } from './utils/getAvatarTone';
import styles from './AssigneeAvatar.module.css';

type AssigneeAvatarProps = {
  name?: string;
};

export function AssigneeAvatar({ name }: AssigneeAvatarProps) {
  const tone = getAvatarTone(name);
  const className = name && tone
    ? `${styles.avatar} ${styles[tone]}`
    : styles.avatarEmpty;

  return (
    <span className={className}>
      {name ? name.slice(0, 1) : <CircleDashed size={18} weight="regular" />}
    </span>
  );
}
