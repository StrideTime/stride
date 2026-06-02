import { Dialog as BaseDialog } from '@base-ui/react/dialog';
import type { ReactNode } from 'react';

import { Typography } from '../../atoms/Typography';
import styles from './Modal.module.css';

export type ModalProps = {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  footer?: ReactNode;
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  closeLabel?: string;
  className?: string;
};

export function Modal({
  title,
  description,
  open,
  onOpenChange,
  children,
  footer,
  primaryAction,
  secondaryAction,
  closeLabel = 'Cancel',
  className,
}: ModalProps) {
  const popupClassName = [styles.popup, className].filter(Boolean).join(' ');
  const actions = footer ?? (primaryAction || secondaryAction ? (
    <div className={styles.actions}>
      {secondaryAction ?? <BaseDialog.Close className={styles.closeButton}>{closeLabel}</BaseDialog.Close>}
      {primaryAction}
    </div>
  ) : null);

  return (
    <BaseDialog.Root open={open} onOpenChange={onOpenChange}>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className={styles.backdrop} />
        <BaseDialog.Viewport className={styles.viewport}>
          <BaseDialog.Popup className={popupClassName}>
            <div className={styles.header}>
              <BaseDialog.Title className={styles.title}>
                <Typography as="span" size="lg" weight="bold">
                  {title}
                </Typography>
              </BaseDialog.Title>
              {description ? (
                <BaseDialog.Description className={styles.description}>
                  <Typography as="span" size="sm" color="muted">
                    {description}
                  </Typography>
                </BaseDialog.Description>
              ) : null}
            </div>
            <div className={styles.body}>{children}</div>
            {actions ? <div className={styles.footer}>{actions}</div> : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
