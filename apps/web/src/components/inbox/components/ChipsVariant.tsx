import { useTranslation } from 'react-i18next';

import { INBOX_CATEGORIES } from '../inbox.constants';
import { getInboxScopeLabel, getItemsForView } from '../utils/inboxFilters';
import styles from '../InboxView.module.css';
import { InboxList } from './InboxList';
import { SearchBox } from './SearchBox';
import type { InboxVariantProps } from './types';

export function ChipsVariant({
  activeView,
  onSelect,
  query,
  onQuery,
  visibleItems,
  onItemSelect,
  selectedItemId,
}: InboxVariantProps) {
  const { t } = useTranslation();

  return (
    <section className={styles.group}>
      <div className={styles.chipRow} aria-label={t('inbox.filters.aria')}>
        <button
          className={activeView === 'all' ? `${styles.chip} ${styles.chipActive}` : styles.chip}
          onClick={() => onSelect('all')}
          type="button"
        >
          {t('inbox.allUpdates')}
        </button>
        {INBOX_CATEGORIES.map(category => {
          const count = getItemsForView(category.view).length;
          const isActive = activeView === category.view;
          return (
            <button
              key={category.view}
              className={isActive ? `${styles.chip} ${styles.chipActive}` : styles.chip}
              onClick={() => onSelect(category.view)}
              type="button"
            >
              {t(category.titleKey)}
              {count ? <span className={styles.chipCount}>{count}</span> : null}
            </button>
          );
        })}
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
