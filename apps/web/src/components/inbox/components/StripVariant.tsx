import { useTranslation } from 'react-i18next';

import { INBOX_CATEGORIES } from '../inbox.constants';
import { getInboxScopeLabel, getItemsForView } from '../utils/inboxFilters';
import styles from '../InboxView.module.css';
import { InboxList } from './InboxList';
import { SearchBox } from './SearchBox';
import type { InboxVariantProps } from './types';

export function StripVariant({
  activeView,
  onSelect,
  query,
  onQuery,
  visibleItems,
  onItemSelect,
  selectedItemId,
}: InboxVariantProps) {
  const { t } = useTranslation();
  const tabs = [
    { view: 'all' as const, title: t('inbox.allUpdates') },
    ...INBOX_CATEGORIES.map(category => ({ view: category.view, title: t(category.titleKey) })),
  ];

  return (
    <section className={styles.group}>
      <p className={styles.countsStrip}>
        {INBOX_CATEGORIES.map((category, index) => {
          const count = getItemsForView(category.view).length;
          return (
            <span key={category.view}>
              {index > 0 ? <span className={styles.countsDot} aria-hidden="true"> · </span> : null}
              <span className={styles.countsValue}>{count}</span> {t(category.shortKey)}
            </span>
          );
        })}
      </p>

      <div className={styles.tabRow} role="tablist" aria-label={t('inbox.filters.aria')}>
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

      <SearchBox query={query} onQuery={onQuery} scopeLabel={getInboxScopeLabel(activeView, t)} />

      <InboxList
        items={visibleItems}
        onItemSelect={onItemSelect}
        selectedItemId={selectedItemId}
      />
    </section>
  );
}
