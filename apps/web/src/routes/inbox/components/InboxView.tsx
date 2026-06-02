import { useMemo, useState } from 'react';
import { Typography } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import { ChipsVariant, InboxDetail } from './components';
import type { InboxViewMode } from './types';
import { getVisibleItems } from './utils/inboxFilters';
import styles from './InboxView.module.css';

export function InboxView() {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<InboxViewMode>('all');
  const [query, setQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const visibleItems = useMemo(() => getVisibleItems(activeView, query), [activeView, query]);
  const selectedItem = visibleItems.find(item => item.id === selectedItemId);

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Typography as="h1" size="2xl" weight="bold">{t('inbox.title')}</Typography>
        </div>
      </header>

      <main className={styles.pipeline}>
        <ChipsVariant
          activeView={activeView}
          onSelect={setActiveView}
          query={query}
          onQuery={setQuery}
          visibleItems={visibleItems}
          onItemSelect={setSelectedItemId}
          selectedItemId={selectedItemId}
        />
      </main>

      {selectedItem ? (
        <InboxDetail item={selectedItem} onClose={() => setSelectedItemId(null)} />
      ) : null}
    </section>
  );
}
