import { Drawer as BaseDrawer } from '@base-ui/react/drawer';
import type { ReactNode } from 'react';

import { Typography } from '../../atoms/Typography';
import styles from './Drawer.module.css';

export type DrawerProps = {
  title: string;
  description?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Drawer({
  title,
  description,
  open,
  onOpenChange,
  children,
  footer,
  className,
}: DrawerProps) {
  const classNames = [styles.popup, className].filter(Boolean).join(' ');

  return (
    <BaseDrawer.Root
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
      modal
    >
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className={styles.backdrop} />
        <BaseDrawer.Viewport className={styles.viewport}>
          <BaseDrawer.Popup className={classNames}>
            <BaseDrawer.Content className={styles.content}>
              <div className={styles.header}>
                <div className={styles.heading}>
                  <BaseDrawer.Title className={styles.title}>
                    <Typography as="span" size="lg" weight="bold">
                      {title}
                    </Typography>
                  </BaseDrawer.Title>
                  {description ? (
                    <BaseDrawer.Description className={styles.description}>
                      <Typography as="span" size="sm" color="muted">
                        {description}
                      </Typography>
                    </BaseDrawer.Description>
                  ) : null}
                </div>
                <BaseDrawer.Close className={styles.closeButton} aria-label="Close drawer">
                  Close
                </BaseDrawer.Close>
              </div>
              <div className={styles.body}>{children}</div>
              {footer ? <div className={styles.footer}>{footer}</div> : null}
            </BaseDrawer.Content>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}
