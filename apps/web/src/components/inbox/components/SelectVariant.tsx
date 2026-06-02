import { Select } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import { INBOX_CATEGORIES } from '../inbox.constants';
import type { InboxViewMode } from '../types';
import { getInboxScopeLabel, getItemsForView } from '../utils/inboxFilters';
import styles from '../InboxView.module.css';
import { InboxList } from './InboxList';
import { SearchBox } from './SearchBox';
import type { InboxVariantProps } from './types';

export function SelectVariant({
  activeView,
  onSelect,
  query,
  onQuery,
  visibleItems,
  onItemSelect,
  selectedItemId,
}: InboxVariantProps) {
  const { t } = useTranslation();
  const options = [
    { value: 'all', label: t('inbox.allUpdates') },
    ...INBOX_CATEGORIES.map(category => ({
      value: category.view,
      label: t('inbox.filters.optionWithCount', {
        label: t(category.titleKey),
        count: getItemsForView(category.view).length,
      }),
    })),
  ];

  return (
    <section className={styles.group}>
      <div className={styles.selectRow}>
        <Select
          aria-label={t('inbox.filters.aria')}
          value={activeView}
          options={options}
          onChange={value => onSelect(value as InboxViewMode)}
          className={styles.scopeSelect}
        />
        <SearchBox query={query} onQuery={onQuery} scopeLabel={getInboxScopeLabel(activeView, t)} inline />
      </div>

      <InboxList
        items={visibleItems}
        onItemSelect={onItemSelect}
        selectedItemId={selectedItemId}
      />
    </section>
  );
}
