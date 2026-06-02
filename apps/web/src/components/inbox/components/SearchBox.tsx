import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import styles from '../InboxView.module.css';

type SearchBoxProps = {
  query: string;
  onQuery: (value: string) => void;
  scopeLabel: string;
  inline?: boolean;
};

export function SearchBox({ query, onQuery, scopeLabel, inline = false }: SearchBoxProps) {
  const { t } = useTranslation();

  return (
    <label className={inline ? `${styles.searchBox} ${styles.searchBoxInline}` : styles.searchBox}>
      <MagnifyingGlassIcon size={16} weight="bold" aria-hidden="true" />
      <input
        aria-label={t('inbox.search.aria')}
        onChange={event => onQuery(event.target.value)}
        placeholder={t('inbox.search.placeholder', { scope: scopeLabel })}
        type="search"
        value={query}
      />
    </label>
  );
}
