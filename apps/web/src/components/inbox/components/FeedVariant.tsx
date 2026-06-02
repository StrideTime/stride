import { useTranslation } from 'react-i18next';

import { INBOX_CATEGORIES } from '../inbox.constants';
import { getVisibleItems } from '../utils/inboxFilters';
import styles from '../InboxView.module.css';
import { InboxRow } from './InboxRow';
import { SearchBox } from './SearchBox';
import type { InboxVariantProps } from './types';

export function FeedVariant({
  query,
  onQuery,
  onItemSelect,
  selectedItemId,
}: Omit<InboxVariantProps, 'activeView' | 'onSelect' | 'visibleItems'>) {
  const { t } = useTranslation();
  const sections = INBOX_CATEGORIES.map(category => ({
    category,
    items: getVisibleItems(category.view, query),
  })).filter(section => section.items.length > 0);

  return (
    <section className={styles.group}>
      <SearchBox query={query} onQuery={onQuery} scopeLabel={t('inbox.allUpdates').toLowerCase()} />

      {sections.length ? (
        <div className={styles.feed}>
          {sections.map(({ category, items }) => (
            <div key={category.view} className={styles.feedSection}>
              <div className={styles.feedSectionHeader}>
                <span className={styles.feedSectionTitle}>{t(category.titleKey)}</span>
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
        <div className={styles.emptyState}>{t('inbox.empty.search')}</div>
      )}
    </section>
  );
}
