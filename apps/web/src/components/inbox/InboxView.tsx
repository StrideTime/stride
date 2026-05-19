import { useMemo, useState } from 'react';

import {
  BellRingingIcon,
  CheckCircleIcon,
  GitPullRequestIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
} from '@phosphor-icons/react';
import { Badge, Button, Typography } from '@stride/ui';

import { inboxNotifications, type InboxNotification, type InboxType } from './inbox.mock';
import styles from './InboxView.module.css';

type InboxViewMode = 'review' | 'unblocked' | 'decisions' | 'all';

type Mode = {
  view: InboxViewMode;
  title: string;
  subtitle: string;
  icon: typeof BellRingingIcon;
};

type InboxRowProps = {
  item: InboxNotification;
};

const MODES: Mode[] = [
  {
    view: 'review',
    title: 'Needs review',
    subtitle: 'New work and handoffs',
    icon: BellRingingIcon,
  },
  {
    view: 'unblocked',
    title: 'Unblocked',
    subtitle: 'Work that can move now',
    icon: CheckCircleIcon,
  },
  {
    view: 'decisions',
    title: 'Decisions',
    subtitle: 'Approvals and source holds',
    icon: ShieldCheckIcon,
  },
  {
    view: 'all',
    title: 'All updates',
    subtitle: 'Everything recent',
    icon: GitPullRequestIcon,
  },
];

const TYPE_LABELS: Record<InboxType, string> = {
  assigned: 'Assigned',
  unblocked: 'Unblocked',
  handoff: 'Handoff',
  approval: 'Approval',
  'source-drift': 'Source drift',
  unmapped: 'Setup',
};

const TYPE_TONES: Record<InboxType, 'accent' | 'neutral' | 'success' | 'warning'> = {
  assigned: 'accent',
  unblocked: 'success',
  handoff: 'accent',
  approval: 'warning',
  'source-drift': 'warning',
  unmapped: 'neutral',
};

export function InboxView() {
  const [activeView, setActiveView] = useState<InboxViewMode>('review');
  const [query, setQuery] = useState('');
  const visibleItems = useMemo(
    () => getVisibleItems(activeView, query),
    [activeView, query]
  );
  const activeMode = MODES.find(mode => mode.view === activeView) ?? MODES[0]!;
  const ActiveIcon = activeMode.icon;

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography as="h1" size="2xl" weight="bold">Inbox</Typography>
          <Typography as="p" size="sm" color="muted">
            Review work that changed outside your plan before it moves into Backlog or Schedule.
          </Typography>
        </div>
      </header>

      <div className={styles.navUseCases}>
        <div className={styles.modes}>
          {MODES.map(mode => {
            const Icon = mode.icon;
            const unreadCount = getItemsForView(mode.view).filter(item => item.unread).length;
            const className = mode.view === activeView
              ? `${styles.mode} ${styles.modeActive}`
              : styles.mode;

            return (
              <button
                key={mode.view}
                className={className}
                onClick={() => setActiveView(mode.view)}
                type="button"
              >
                <span className={styles.modeIconWrap}>
                  <span className={styles.modeIcon}><Icon size={18} weight="bold" /></span>
                  {unreadCount ? <span className={styles.modeBadge}>{unreadCount}</span> : null}
                </span>
                <span className={styles.modeCopy}>
                  <span className={styles.modeTitle}>{mode.title}</span>
                  <span className={styles.modeSubtitle}>{mode.subtitle}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main className={styles.pipeline}>
        <section className={styles.group}>
          <div className={styles.groupHeader}>
            <div className={styles.groupTitleBlock}>
              <span className={styles.sectionIcon} aria-hidden="true">
                <ActiveIcon size={19} weight="bold" />
              </span>
              <div>
                <Typography as="h2" size="lg" weight="bold">{activeMode.title}</Typography>
                <Typography size="sm" color="muted">{getViewDescription(activeView)}</Typography>
              </div>
            </div>
            <div className={styles.groupCount}>{visibleItems.length}</div>
          </div>

          <label className={styles.searchBox}>
            <MagnifyingGlassIcon size={16} weight="bold" aria-hidden="true" />
            <input
              aria-label="Search inbox updates"
              onChange={event => setQuery(event.target.value)}
              placeholder={`Search ${activeMode.title.toLowerCase()}`}
              type="search"
              value={query}
            />
          </label>

          <div className={styles.inboxList}>
            {visibleItems.length ? visibleItems.map(item => (
              <InboxRow key={item.id} item={item} />
            )) : (
              <div className={styles.emptyState}>No updates in this view.</div>
            )}
          </div>
        </section>
      </main>
    </section>
  );
}

function InboxRow({ item }: InboxRowProps) {
  return (
    <article className={item.unread ? `${styles.inboxRow} ${styles.unreadRow}` : styles.inboxRow}>
      <div className={styles.unreadDot} aria-hidden="true" />
      <span className={styles.sourceKey}>{item.sourceKey}</span>
      <div className={styles.rowMain}>
        <Typography weight="semibold">{item.title}</Typography>
        <div className={styles.metaLine}>
          <Badge variant={TYPE_TONES[item.type]}>{TYPE_LABELS[item.type]}</Badge>
          <span>{item.summary}</span>
          <span>{item.timestamp}</span>
          <span>{item.actor}</span>
        </div>
      </div>
      <Typography className={styles.reason} size="sm" color="muted">
        {item.detail}
      </Typography>
      <div className={styles.rowActions}>
        <Button size="sm">{item.primaryAction}</Button>
      </div>
    </article>
  );
}

function getVisibleItems(view: InboxViewMode, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const viewItems = getItemsForView(view);

  if (!normalizedQuery) {
    return viewItems;
  }

  return viewItems.filter(item => [
    item.title,
    item.sourceKey,
    item.source,
    item.team,
    item.actor,
    item.summary,
    item.detail,
    TYPE_LABELS[item.type],
  ].some(value => value.toLowerCase().includes(normalizedQuery)));
}

function getItemsForView(view: InboxViewMode) {
  if (view === 'review') {
    return inboxNotifications.filter(item => item.type === 'assigned' || item.type === 'handoff');
  }

  if (view === 'unblocked') {
    return inboxNotifications.filter(item => item.type === 'unblocked');
  }

  if (view === 'decisions') {
    return inboxNotifications.filter(item => (
      item.type === 'approval' || item.type === 'source-drift' || item.type === 'unmapped'
    ));
  }

  return inboxNotifications;
}

function getViewDescription(view: InboxViewMode) {
  if (view === 'review') {
    return 'New specs and handoffs that need a quick read before planning.';
  }

  if (view === 'unblocked') {
    return 'Specs that were waiting and can move again.';
  }

  if (view === 'decisions') {
    return 'Approvals, source conflicts, and setup holds that need an explicit choice.';
  }

  return 'Every recent inbox update in one list.';
}
