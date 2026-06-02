import {
  CaretDownIcon,
  GearIcon,
  PencilSimpleIcon,
  PlusIcon,
} from '@phosphor-icons/react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';

import { Popover, Select, Typography } from '../../atoms';
import {
  defaultShellStatuses,
  navItems,
  shellWorkspaces,
  type ShellStatus,
} from './AppShell.mock';
import { StatusBadge, StatusGlyph } from './components';
import styles from './AppShell.module.css';

export type { ShellStatus } from './AppShell.mock';

export type AppShellText = {
  edit: string;
  status: string;
  setStatusAria: string;
  customStatusPlaceholder: string;
  customStatusAria: string;
  addCustomStatusAria: string;
  workspace: string;
  teamAria: string;
  statusBadgeAria: (status: string) => string;
  openSettingsAria: string;
  primaryNavAria: string;
  userName: string;
  userEmail: string;
  nav: Record<string, string>;
};

export type AppShellProps = {
  statuses?: ShellStatus[];
  currentStatusId?: string;
  onSelectStatus?: (id: string) => void;
  text: AppShellText;
};

export function AppShell({ statuses, currentStatusId, onSelectStatus, text }: AppShellProps) {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isSettings = pathname.startsWith('/settings');
  const isSpecRoute = pathname.startsWith('/specs/');

  const baseStatuses = statuses && statuses.length > 0 ? statuses : defaultShellStatuses;
  const [customStatuses, setCustomStatuses] = useState<ShellStatus[]>([]);
  const [draftStatus, setDraftStatus] = useState('');
  const allStatuses = [...baseStatuses, ...customStatuses];
  const [selectedStatusId, setSelectedStatusId] = useState<string | undefined>(currentStatusId);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [desktopStatusOpen, setDesktopStatusOpen] = useState(false);
  const activeStatus =
    allStatuses.find(status => status.id === (selectedStatusId ?? currentStatusId)) ?? allStatuses[0]!;

  const [workspaceIndex, setWorkspaceIndex] = useState(0);
  const activeWorkspace = shellWorkspaces[workspaceIndex] ?? shellWorkspaces[0]!;
  const [teamId, setTeamId] = useState(shellWorkspaces[0]?.teams?.[0] ?? '');

  const handleSelectStatus = (id: string) => {
    setSelectedStatusId(id);
    onSelectStatus?.(id);
    setMobileAccountOpen(false);
    setDesktopStatusOpen(false);
  };

  const handleAddCustomStatus = () => {
    const label = draftStatus.trim();
    if (!label) return;
    const status: ShellStatus = { id: `custom-${Date.now()}`, label, color: 'slate' };
    setCustomStatuses(prev => [...prev, status]);
    setSelectedStatusId(status.id);
    onSelectStatus?.(status.id);
    setDraftStatus('');
  };

  const handleSelectWorkspace = (index: number) => {
    setWorkspaceIndex(index);
    setTeamId(shellWorkspaces[index]?.teams?.[0] ?? '');
  };

  const statusSection = (
    <div className={styles.accountSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.accountSectionLabel}>{text.status}</span>
        <Link
          to="/settings/$sectionId"
          params={{ sectionId: 'my-statuses' }}
          className={styles.sectionLink}
        >
          {text.edit}
        </Link>
      </div>
      <div className={styles.statusList} role="group" aria-label={text.setStatusAria}>
        {allStatuses.map(option => {
          const isActive = option.id === activeStatus.id;

          return (
            <button
              key={option.id}
              className={isActive ? `${styles.optionRow} ${styles.optionRowActive}` : styles.optionRow}
              onClick={() => handleSelectStatus(option.id)}
              type="button"
            >
              <StatusGlyph status={option} />
              <span className={styles.optionLabel}>{option.label}</span>
            </button>
          );
        })}
      </div>
      <form
        className={styles.customStatusForm}
        onSubmit={event => {
          event.preventDefault();
          handleAddCustomStatus();
        }}
      >
        <input
          className={styles.customStatusInput}
          value={draftStatus}
          onChange={event => setDraftStatus(event.target.value)}
          placeholder={text.customStatusPlaceholder}
          aria-label={text.customStatusAria}
          maxLength={40}
        />
        <button
          className={styles.customStatusAdd}
          type="submit"
          aria-label={text.addCustomStatusAria}
          disabled={!draftStatus.trim()}
        >
          <PlusIcon size={15} weight="bold" aria-hidden="true" />
        </button>
      </form>
    </div>
  );

  const workspaceSection = (
    <div className={styles.accountSection}>
      <span className={styles.accountSectionLabel}>{text.workspace}</span>
      <div className={styles.scrollList}>
        {shellWorkspaces.map((workspace, index) => {
          const isActive = index === workspaceIndex;

          return isActive ? (
            <div key={workspace.name} className={styles.workspaceCard}>
              <div className={styles.workspaceCardHead}>
                <span className={styles.optionMark}>{workspace.mark}</span>
                <span className={styles.optionCopy}>
                  <span className={styles.optionLabel}>{workspace.name}</span>
                  <span className={styles.optionMeta}>{workspace.org}</span>
                </span>
              </div>
              {workspace.teams ? (
                <Select
                  aria-label={text.teamAria}
                  value={teamId}
                  onChange={setTeamId}
                  options={workspace.teams.map(team => ({ value: team, label: team }))}
                  className={styles.teamSelect}
                />
              ) : null}
            </div>
          ) : (
            <button
              key={workspace.name}
              className={styles.optionRow}
              type="button"
              onClick={() => handleSelectWorkspace(index)}
            >
              <span className={styles.optionMark}>{workspace.mark}</span>
              <span className={styles.optionCopy}>
                <span className={styles.optionLabel}>{workspace.name}</span>
                <span className={styles.optionMeta}>{workspace.org}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const identity = (
    <Link to="/settings" className={styles.accountIdentity}>
      <span className={styles.accountAvatarWrap}>
        <span className={styles.accountAvatar}>J</span>
        <StatusBadge
          status={activeStatus}
          className={styles.accountAvatarBadge}
          label={text.statusBadgeAria(activeStatus.label)}
        />
      </span>
      <span className={styles.accountIdentityCopy}>
        <span className={styles.accountName}>{text.userName}</span>
        <span className={styles.accountHandle}>{text.userEmail}</span>
      </span>
      <PencilSimpleIcon size={16} className={styles.accountEdit} aria-hidden="true" />
    </Link>
  );

  return (
    <div className={styles.shell}>
      {!isSettings ? (
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
      ) : null}

      {!isSettings ? (
        <aside className={styles.rail}>
          <Popover
            trigger={(
              <>
                <div className={styles.scopeMark}>{activeWorkspace.mark}</div>
                <div className={styles.scopeCopy}>
                  <Typography size="sm" weight="semibold" color="inverse">{activeWorkspace.name}</Typography>
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
            <div className={styles.accountMenu}>
              {workspaceSection}
            </div>
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
                    <Typography size="sm" weight="medium" color="inverse">{text.nav[item.labelKey] ?? item.labelKey}</Typography>
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
                    <Typography size="sm" weight="semibold" color="inverse">{text.userName}</Typography>
                  </div>
                  <CaretDownIcon size={14} className={styles.caretIcon} aria-hidden="true" />
                </>
              )}
              triggerClassName={styles.profileCard}
              popupClassName={styles.accountPopup}
            >
              <div className={styles.accountMenu}>
                {statusSection}
              </div>
            </Popover>

            <Link to="/settings" className={styles.settingsButton} aria-label={text.openSettingsAria}>
              <GearIcon size={18} weight="bold" aria-hidden="true" />
            </Link>
          </div>
        </aside>
      ) : null}

      <main className={styles.main}>
        <Outlet />
      </main>

      {!isSettings ? (
        <nav className={styles.mobileNav} aria-label={text.primaryNavAria}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={styles.mobileNavItem}
                activeProps={{ className: `${styles.mobileNavItem} ${styles.mobileNavActive}` }}
                activeOptions={{ exact: !item.children }}
              >
                <span className={styles.mobileNavIcon}>
                  <Icon size={19} weight="bold" aria-hidden="true" />
                  {item.badge ? <span className={styles.mobileBadge}>{item.badge}</span> : null}
                </span>
                <span className={styles.mobileNavLabel}>{text.nav[item.labelKey] ?? item.labelKey}</span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
