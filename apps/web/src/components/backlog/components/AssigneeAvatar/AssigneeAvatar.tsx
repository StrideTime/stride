import styles from '../../../backlog.module.css';

type AssigneeAvatarProps = {
  name?: string;
};

export function AssigneeAvatar({ name }: AssigneeAvatarProps) {
  return (
    <span className={name ? styles.avatar : styles.avatarEmpty}>
      {name ? name.slice(0, 1) : '–'}
    </span>
  );
}
