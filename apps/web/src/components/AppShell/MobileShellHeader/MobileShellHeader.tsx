import { CaretDownIcon, GearIcon } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { Popover } from '@stride/ui';

import type { ShellStatus, Workspace } from '../AppShell.data';
import type { AppShellText } from '../AppShell.types';
import { StatusBadge } from '../StatusIndicator';
import styles from '../AppShell.module.css';

type MobileShellHeaderProps = {
  activeWorkspace: Workspace;
  activeStatus: ShellStatus;
  teamId: string;
  text: AppShellText;
  identity: ReactNode;
  statusSection: ReactNode;
  workspaceSection: ReactNode;
  mobileAccountOpen: boolean;
  setMobileAccountOpen: Dispatch<SetStateAction<boolean>>;
};

export function MobileShellHeader({
  activeWorkspace,
  activeStatus,
  teamId,
  text,
  identity,
  statusSection,
  workspaceSection,
  mobileAccountOpen,
  setMobileAccountOpen,
}: MobileShellHeaderProps) {
  return (
    <header className={styles.mobileHeader}>
      <div className={styles.mobilePill}>
        <Popover
          open={mobileAccountOpen}
          onOpenChange={setMobileAccountOpen}
          trigger={(
            <>
              <div className={styles.mobileAvatarWrap}>
                <div className={styles.mobileAvatar}>J</div>
                <StatusBadge
                  status={activeStatus}
                  className={styles.mobileAvatarBadge}
                  label={text.statusBadgeAria(activeStatus.label)}
                />
              </div>
              <div className={styles.mobileScopeCopy}>
                <span className={styles.mobileScopeName}>{activeWorkspace.name}</span>
                <span className={styles.mobileScopeTeam}>{teamId || activeWorkspace.org}</span>
              </div>
              <CaretDownIcon size={13} className={styles.caretIcon} aria-hidden="true" />
            </>
          )}
          triggerClassName={styles.mobileScopeTrigger}
          popupClassName={styles.accountPopup}
        >
          <div className={styles.accountMenu}>
            {identity}
            {statusSection}
            {workspaceSection}
          </div>
        </Popover>

        <Link to="/settings" className={styles.mobileSettingsButton} aria-label={text.openSettingsAria}>
          <GearIcon size={18} weight="bold" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
}
