import { PencilSimpleIcon, PlusIcon } from '@phosphor-icons/react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';

import { Select } from '@stride/ui';

import {
  defaultShellStatuses,
  shellWorkspaces,
  type ShellStatus,
} from './AppShell.data';
import type { AppShellProps } from './AppShell.types';
import { MobileBottomNavigation } from './MobileBottomNavigation';
import { MobileShellHeader } from './MobileShellHeader';
import { Sidebar } from './Sidebar';
import { StatusBadge, StatusGlyph } from './StatusIndicator';
import styles from './AppShell.module.css';

export type { ShellStatus } from './AppShell.data';
export type { AppShellProps, AppShellText } from './AppShell.types';

export function AppShell({ statuses, currentStatusId, onSelectStatus, text }: AppShellProps) {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isSettings = pathname.startsWith('/settings');
  const isSpecRoute = pathname.startsWith('/backlog/specs/') || pathname.startsWith('/specs/');

  const baseStatuses = statuses && statuses.length > 0 ? statuses : defaultShellStatuses;
  const [customStatuses, setCustomStatuses] = useState<ShellStatus[]>([]);
  const [draftStatus, setDraftStatus] = useState('');
  const allStatuses = [...baseStatuses, ...customStatuses];
  const [selectedStatusId, setSelectedStatusId] = useState<string | undefined>(currentStatusId);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);
  const [desktopStatusOpen, setDesktopStatusOpen] = useState(false);
  const activeStatus =
    allStatuses.find(status => status.id === (selectedStatusId ?? currentStatusId)) ??
    allStatuses[0]!;

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
        <MobileShellHeader
          activeWorkspace={activeWorkspace}
          activeStatus={activeStatus}
          teamId={teamId}
          text={text}
          identity={identity}
          statusSection={statusSection}
          workspaceSection={workspaceSection}
          mobileAccountOpen={mobileAccountOpen}
          setMobileAccountOpen={setMobileAccountOpen}
        />
      ) : null}

      {!isSettings ? (
        <Sidebar
          activeWorkspace={activeWorkspace}
          teamId={teamId}
          activeStatus={activeStatus}
          text={text}
          workspaceSection={workspaceSection}
          statusSection={statusSection}
          desktopStatusOpen={desktopStatusOpen}
          setDesktopStatusOpen={setDesktopStatusOpen}
          isSpecRoute={isSpecRoute}
        />
      ) : null}

      <main className={styles.main}>
        <Outlet />
      </main>

      {!isSettings ? <MobileBottomNavigation text={text} /> : null}
    </div>
  );
}
