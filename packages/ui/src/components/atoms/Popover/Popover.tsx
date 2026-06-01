import { Popover as BasePopover } from '@base-ui-components/react/popover';
import type { ReactNode } from 'react';

import styles from './Popover.module.css';

type PopoverProps = {
  trigger: ReactNode;
  children: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  sideOffset?: number;
  triggerClassName?: string;
  popupClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Popover({
  trigger,
  children,
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  triggerClassName,
  popupClassName,
  open,
  onOpenChange,
}: PopoverProps) {
  const popupClassNames = [styles.popup, popupClassName].filter(Boolean).join(' ');

  return (
    <BasePopover.Root open={open} onOpenChange={onOpenChange}>
      <BasePopover.Trigger className={triggerClassName}>
        {trigger}
      </BasePopover.Trigger>
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} align={align} sideOffset={sideOffset} className={styles.positioner}>
          <BasePopover.Popup className={popupClassNames}>
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
