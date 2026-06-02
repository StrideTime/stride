import { useMemo, useState } from 'react';
import { Typography } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import {
  ChipsVariant,
  FeedVariant,
  InboxDetail,
  SelectVariant,
  StripVariant,
} from './components';
import { INBOX_NAV_VARIANTS } from './inbox.constants';
import type { InboxNavVariant, InboxViewMode } from './types';
import { getVisibleItems } from './utils/inboxFilters';
import styles from './InboxView.module.css';

export function InboxView() {
  const { t } = useTranslation();
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
          <Typography as="h1" size="2xl" weight="bold">{t('inbox.title')}</Typography>
        </div>
      </header>

      <div className={styles.variantBar} aria-label={t('inbox.navVariants.aria')}>
        {INBOX_NAV_VARIANTS.map(variant => (
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
            {t(variant.labelKey)}
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
