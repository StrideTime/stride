import { useMemo, useState } from 'react';

import {
  BellRingingIcon,
  CaretRightIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  XIcon,
} from '@phosphor-icons/react';
import { Badge, Button, Select, Typography } from '@stride/ui';

import { inboxNotifications, type InboxNotification, type InboxType } from './inbox.mock';
import styles from './InboxView.module.css';

type InboxViewMode = 'all' | 'review' | 'unblocked' | 'decisions';
type InboxCategory = Exclude<InboxViewMode, 'all'>;
type InboxNavVariant = 'chips' | 'feed' | 'strip' | 'select';

type Category = {
  view: InboxCategory;
  title: string;
  short: string;
  icon: typeof BellRingingIcon;
};

type InboxRowProps = {
  item: InboxNotification;
  selected: boolean;
  onSelect: (item: InboxNotification) => void;
};

const NAV_VARIANTS: Array<{ id: InboxNavVariant; label: string }> = [
  { id: 'chips', label: 'A · Filter chips' },
  { id: 'feed', label: 'B · Grouped feed' },
  { id: 'strip', label: 'C · Counts strip' },
  { id: 'select', label: 'D · Scope dropdown' },
];

const CATEGORIES: Category[] = [
  { view: 'review', title: 'Needs review', short: 'need review', icon: BellRingingIcon },
  { view: 'unblocked', title: 'Unblocked', short: 'unblocked', icon: CheckCircleIcon },
  { view: 'decisions', title: 'Decisions', short: 'decisions', icon: ShieldCheckIcon },
];

const TYPE_TONES: Record<InboxType, 'accent' | 'neutral' | 'success' | 'warning'> = {
  assigned: 'accent',
  unblocked: 'success',
  handoff: 'accent',
  approval: 'warning',
  'source-drift': 'warning',
  unmapped: 'neutral',
};

export function InboxView() {
  const [activeView, setActiveView] = useState<InboxViewMode>('all');
  const [navVariant, setNavVariant] = useState<InboxNavVariant>('chips');
  const [query, setQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const visibleItems = useMemo(() => getVisibleItems(activeView, query), [activeView, query]);
  const selectedItem = visibleItems.find(item => item.id === selectedItemId);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography as="h1" size="2xl" weight="bold">Inbox</Typography>
        </div>
      </header>

      <div className={styles.variantBar} aria-label="Inbox navigation variants">
        {NAV_VARIANTS.map(variant => (
          <button
            key={variant.id}
            className={
              variant.id === navVariant
                ? `${styles.variantButton} ${styles.variantButtonActive}`
                : styles.variantButton
            }
            onClick={() => setNavVariant(variant.id)}
            type="button"
          >
            {variant.label}
          </button>
        ))}
      </div>

      <main className={styles.pipeline}>
        {navVariant === 'chips' ? (
          <ChipsVariant
            activeView={activeView}
            onSelect={setActiveView}
            query={query}
            onQuery={setQuery}
            visibleItems={visibleItems}
            onItemSelect={setSelectedItemId}
            selectedItemId={selectedItemId}
          />
        ) : null}

        {navVariant === 'feed' ? (
          <FeedVariant
            query={query}
            onQuery={setQuery}
            onItemSelect={setSelectedItemId}
            selectedItemId={selectedItemId}
          />
        ) : null}

        {navVariant === 'strip' ? (
          <StripVariant
            activeView={activeView}
            onSelect={setActiveView}
            query={query}
            onQuery={setQuery}
            visibleItems={visibleItems}
            onItemSelect={setSelectedItemId}
            selectedItemId={selectedItemId}
          />
        ) : null}

        {navVariant === 'select' ? (
          <SelectVariant
            activeView={activeView}
            onSelect={setActiveView}
            query={query}
            onQuery={setQuery}
            visibleItems={visibleItems}
            onItemSelect={setSelectedItemId}
            selectedItemId={selectedItemId}
          />
        ) : null}
      </main>

      {selectedItem ? (
        <InboxDetail item={selectedItem} onClose={() => setSelectedItemId(null)} />
      ) : null}
    </section>
  );
}

/**
 * Option A — Filter chips.
 * "All updates" is the default, count-free home (the absence of a filter). The three
 * categories are chips that narrow the single list, and counts live only on them — so
 * nothing is ever double-counted.
 */
function ChipsVariant({
  activeView,
  onSelect,
  query,
  onQuery,
  visibleItems,
  onItemSelect,
  selectedItemId,
}: {
  activeView: InboxViewMode;
  onSelect: (view: InboxViewMode) => void;
  query: string;
  onQuery: (value: string) => void;
  visibleItems: InboxNotification[];
  onItemSelect: (id: string) => void;
  selectedItemId: string | null;
}) {
  return (
    <section className={styles.group}>
      <div className={styles.chipRow} aria-label="Filter updates">
        <button
          className={activeView === 'all' ? `${styles.chip} ${styles.chipActive}` : styles.chip}
          onClick={() => onSelect('all')}
          type="button"
        >
          All updates
        </button>
        {CATEGORIES.map(category => {
          const count = getItemsForView(category.view).length;
          const isActive = activeView === category.view;
          return (
            <button
              key={category.view}
              className={isActive ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              onClick={() => onSelect(category.view)}
              type="button"
            >
              {category.title}
              {count ? <span className={styles.chipCount}>{count}</span> : null}
            </button>
          );
        })}
      </div>

      <SearchBox query={query} onQuery={onQuery} scopeLabel={scopeLabel(activeView)} />

      <InboxList
        items={visibleItems}
        onItemSelect={onItemSelect}
        selectedItemId={selectedItemId}
      />
    </section>
  );
}

/**
 * Option B — Grouped feed.
 * No tabs at all. The inbox is one chronological feed, partitioned into labelled sections
 * whose headers carry the counts. "Everything" stops being a concept — it is simply the
 * whole feed. Search filters across all sections.
 */
function FeedVariant({
  query,
  onQuery,
  onItemSelect,
  selectedItemId,
}: {
  query: string;
  onQuery: (value: string) => void;
  onItemSelect: (id: string) => void;
  selectedItemId: string | null;
}) {
  const sections = CATEGORIES.map(category => ({
    category,
    items: getVisibleItems(category.view, query),
  })).filter(section => section.items.length > 0);

  return (
    <section className={styles.group}>
      <SearchBox query={query} onQuery={onQuery} scopeLabel="all updates" />

      {sections.length ? (
        <div className={styles.feed}>
          {sections.map(({ category, items }) => (
            <div key={category.view} className={styles.feedSection}>
              <div className={styles.feedSectionHeader}>
                <span className={styles.feedSectionTitle}>{category.title}</span>
                <span className={styles.feedSectionCount}>{items.length}</span>
              </div>
              <div className={styles.inboxList}>
                {items.map(item => (
                  <InboxRow
                    key={item.id}
                    item={item}
                    onSelect={selected => onItemSelect(selected.id)}
                    selected={item.id === selectedItemId}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>No updates match your search.</div>
      )}
    </section>
  );
}

/**
 * Option C — Counts strip + count-free tabs.
 * Navigation and counting are split onto separate elements. The tabs (All included) carry
 * no badges and are pure navigation; one muted strip holds every count in a single place,
 * so there is nothing to duplicate.
 */
function StripVariant({
  activeView,
  onSelect,
  query,
  onQuery,
  visibleItems,
  onItemSelect,
  selectedItemId,
}: {
  activeView: InboxViewMode;
  onSelect: (view: InboxViewMode) => void;
  query: string;
  onQuery: (value: string) => void;
  visibleItems: InboxNotification[];
  onItemSelect: (id: string) => void;
  selectedItemId: string | null;
}) {
  const tabs: Array<{ view: InboxViewMode; title: string }> = [
    { view: 'all', title: 'All updates' },
    ...CATEGORIES.map(category => ({ view: category.view, title: category.title })),
  ];

  return (
    <section className={styles.group}>
      <p className={styles.countsStrip}>
        {CATEGORIES.map((category, index) => {
          const count = getItemsForView(category.view).length;
          return (
            <span key={category.view}>
              {index > 0 ? <span className={styles.countsDot} aria-hidden="true"> · </span> : null}
              <span className={styles.countsValue}>{count}</span> {category.short}
            </span>
          );
        })}
      </p>

      <div className={styles.tabRow} role="tablist" aria-label="Filter updates">
        {tabs.map(tab => (
          <button
            key={tab.view}
            role="tab"
            aria-selected={activeView === tab.view}
            className={activeView === tab.view ? `${styles.tab} ${styles.tabActive}` : styles.tab}
            onClick={() => onSelect(tab.view)}
            type="button"
          >
            {tab.title}
          </button>
        ))}
      </div>

      <SearchBox query={query} onQuery={onQuery} scopeLabel={scopeLabel(activeView)} />

      <InboxList
        items={visibleItems}
        onItemSelect={onItemSelect}
        selectedItemId={selectedItemId}
      />
    </section>
  );
}

/**
 * Option D — Scope dropdown.
 * A single compact picker sets the scope ("All updates" by default). Counts appear only
 * inside the menu options, never on the surface, so the header stays quiet and the control
 * scales if more categories arrive.
 */
function SelectVariant({
  activeView,
  onSelect,
  query,
  onQuery,
  visibleItems,
  onItemSelect,
  selectedItemId,
}: {
  activeView: InboxViewMode;
  onSelect: (view: InboxViewMode) => void;
  query: string;
  onQuery: (value: string) => void;
  visibleItems: InboxNotification[];
  onItemSelect: (id: string) => void;
  selectedItemId: string | null;
}) {
  const options = [
    { value: 'all', label: 'All updates' },
    ...CATEGORIES.map(category => ({
      value: category.view,
      label: `${category.title} · ${getItemsForView(category.view).length}`,
    })),
  ];

  return (
    <section className={styles.group}>
      <div className={styles.selectRow}>
        <Select
          aria-label="Filter updates"
          value={activeView}
          options={options}
          onChange={value => onSelect(value as InboxViewMode)}
          className={styles.scopeSelect}
        />
        <SearchBox query={query} onQuery={onQuery} scopeLabel={scopeLabel(activeView)} inline />
      </div>

      <InboxList
        items={visibleItems}
        onItemSelect={onItemSelect}
        selectedItemId={selectedItemId}
      />
    </section>
  );
}

function SearchBox({
  query,
  onQuery,
  scopeLabel,
  inline = false,
}: {
  query: string;
  onQuery: (value: string) => void;
  scopeLabel: string;
  inline?: boolean;
}) {
  return (
    <label className={inline ? `${styles.searchBox} ${styles.searchBoxInline}` : styles.searchBox}>
      <MagnifyingGlassIcon size={16} weight="bold" aria-hidden="true" />
      <input
        aria-label="Search inbox updates"
        onChange={event => onQuery(event.target.value)}
        placeholder={`Search ${scopeLabel}`}
        type="search"
        value={query}
      />
    </label>
  );
}

function InboxList({
  items,
  onItemSelect,
  selectedItemId,
}: {
  items: InboxNotification[];
  onItemSelect: (id: string) => void;
  selectedItemId: string | null;
}) {
  if (!items.length) {
    return <div className={styles.emptyState}>No updates in this view.</div>;
  }

  return (
    <div className={styles.inboxList}>
      {items.map(item => (
        <InboxRow
          key={item.id}
          item={item}
          onSelect={selected => onItemSelect(selected.id)}
          selected={item.id === selectedItemId}
        />
      ))}
    </div>
  );
}

function InboxRow({ item, selected, onSelect }: InboxRowProps) {
  const className = [
    styles.inboxRow,
    item.unread ? styles.unreadRow : undefined,
    selected ? styles.selectedRow : undefined,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      aria-label={`Open inbox item: ${item.title}`}
      className={className}
      onClick={() => onSelect(item)}
      type="button"
    >
      <div className={styles.unreadDot} aria-hidden="true" />
      <span className={styles.sourceKey}>{item.sourceKey}</span>
      <div className={styles.rowCopy}>
        <Typography className={styles.changeLine} weight="semibold">
          {item.detail}
        </Typography>
        <div className={styles.contextLine}>
          <Badge variant={TYPE_TONES[item.type]}>{item.summary}</Badge>
          <span>{item.title}</span>
        </div>
      </div>
      <span className={styles.timestamp}>{item.timestamp}</span>
      <CaretRightIcon className={styles.rowChevron} size={16} weight="bold" aria-hidden="true" />
    </button>
  );
}

function InboxDetail({ item, onClose }: { item: InboxNotification; onClose: () => void }) {
  return (
    <div className={styles.modalLayer}>
      <button
        aria-label="Close inbox detail"
        className={styles.modalScrim}
        onClick={onClose}
        type="button"
      />
      <aside
        className={styles.modal}
        aria-label="Selected inbox item"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <div className={styles.detailMeta}>
            <span className={styles.sourceKey}>{item.sourceKey}</span>
            <Badge variant={TYPE_TONES[item.type]}>{item.summary}</Badge>
            <span>{item.timestamp}</span>
          </div>
          <button
            aria-label="Close inbox detail"
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            <XIcon size={16} weight="bold" aria-hidden="true" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.specContext}>
            <Typography size="xs" color="muted" weight="semibold">Spec</Typography>
            <Typography as="h2" size="lg" weight="bold">{item.title}</Typography>
          </div>
          <div className={styles.detailCallout}>
            <span className={styles.detailCalloutIcon} aria-hidden="true">
              <CheckCircleIcon size={18} weight="bold" />
            </span>
            <div className={styles.detailCalloutCopy}>
              <Typography weight="semibold">{getDetailEventText(item)}</Typography>
              <Typography size="sm" color="muted">{item.detail}</Typography>
            </div>
          </div>
        </div>

        <div className={styles.modalActions}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary">Open spec</Button>
        </div>
      </aside>
    </div>
  );
}

function scopeLabel(view: InboxViewMode) {
  if (view === 'all') return 'all updates';
  return CATEGORIES.find(category => category.view === view)?.title.toLowerCase() ?? 'all updates';
}

function getDetailEventText(item: InboxNotification) {
  if (item.type === 'unblocked') {
    return `${item.actor} unblocked you ${item.timestamp}`;
  }

  return `${item.actor} updated this ${item.timestamp}`;
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
