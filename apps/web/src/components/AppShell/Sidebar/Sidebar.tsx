import { CaretDownIcon, GearIcon } from '@phosphor-icons/react';
import { Link } from '@tanstack/react-router';
import type { Dispatch, ReactNode, SetStateAction } from 'react';

import { Popover, Typography } from '@stride/ui';

import { navItems, type ShellStatus, type Workspace } from '../AppShell.data';
import type { AppShellText } from '../AppShell.types';
import { StatusBadge } from '../StatusIndicator';
import styles from '../AppShell.module.css';

type SidebarProps = {
  activeWorkspace: Workspace;
  teamId: string;
  activeStatus: ShellStatus;
  text: AppShellText;
  workspaceSection: ReactNode;
  statusSection: ReactNode;
  desktopStatusOpen: boolean;
  setDesktopStatusOpen: Dispatch<SetStateAction<boolean>>;
  isSpecRoute: boolean;
};

export function Sidebar({
  activeWorkspace,
  teamId,
  activeStatus,
  text,
  workspaceSection,
  statusSection,
  desktopStatusOpen,
  setDesktopStatusOpen,
  isSpecRoute,
}: SidebarProps) {
  return (
    <aside className={styles.rail}>
      <Popover
        trigger={(
          <>
            <div className={styles.scopeMark}>{activeWorkspace.mark}</div>
            <div className={styles.scopeCopy}>
              <Typography size="sm" weight="semibold" color="inverse">
                {activeWorkspace.name}
              </Typography>
              <div className={styles.scopeBranch}>
                <span className={styles.scopeBranchLine} aria-hidden="true" />
                <div className={styles.scopeTeamRow}>
                  <span className={styles.scopeBadge}>{teamId || activeWorkspace.org}</span>
                </div>
              </div>
            </div>
            <CaretDownIcon size={14} className={styles.caretIcon} aria-hidden="true" />
          </>
        )}
        triggerClassName={styles.scopeTrigger}
        popupClassName={styles.accountPopup}
      >
        <div className={styles.accountMenu}>{workspaceSection}</div>
      </Popover>

      <nav className={styles.nav} aria-label={text.primaryNavAria}>
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <div key={item.to} className={styles.navGroup}>
              <Link
                to={item.to}
                className={styles.navItem}
                activeProps={item.children ? undefined : { className: `${styles.navItem} ${styles.active}` }}
                activeOptions={{ exact: !item.children }}
              >
                <span className={styles.navIcon}>
                  <Icon size={16} weight="bold" aria-hidden="true" />
                </span>
                <Typography size="sm" weight="medium" color="inverse">
                  {text.nav[item.labelKey] ?? item.labelKey}
                </Typography>
                {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
              </Link>
              {item.children ? (
                <div className={styles.subNav}>
                  {item.children.map(child => {
                    const ChildIcon = child.icon;
                    const isSpecsChildActive = child.href === '/backlog/specs' && isSpecRoute;
                    const subNavClassName = isSpecsChildActive
                      ? `${styles.subNavItem} ${styles.subNavActive}`
                      : styles.subNavItem;

                    return (
                      <Link
                        key={child.href}
                        to={child.href}
                        className={subNavClassName}
                        activeProps={{ className: `${styles.subNavItem} ${styles.subNavActive}` }}
                        activeOptions={{ exact: true }}
                      >
                        <span className={styles.subNavIcon}>
                          <ChildIcon size={14} weight="bold" aria-hidden="true" />
                        </span>
                        <span>{text.nav[child.labelKey] ?? child.labelKey}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>

      <div className={styles.accountCard}>
        <Popover
          side="top"
          open={desktopStatusOpen}
          onOpenChange={setDesktopStatusOpen}
          trigger={(
            <>
              <span className={styles.profileAvatarWrap}>
                <span className={styles.profileAvatar}>J</span>
                <StatusBadge
                  status={activeStatus}
                  className={styles.profileAvatarBadge}
                  label={text.statusBadgeAria(activeStatus.label)}
                />
              </span>
              <div className={styles.profileCopy}>
                <Typography size="sm" weight="semibold" color="inverse">
                  {text.userName}
                </Typography>
              </div>
              <CaretDownIcon size={14} className={styles.caretIcon} aria-hidden="true" />
            </>
          )}
          triggerClassName={styles.profileCard}
          popupClassName={styles.accountPopup}
        >
          <div className={styles.accountMenu}>{statusSection}</div>
        </Popover>

        <Link to="/settings" className={styles.settingsButton} aria-label={text.openSettingsAria}>
          <GearIcon size={18} weight="bold" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  );
}
