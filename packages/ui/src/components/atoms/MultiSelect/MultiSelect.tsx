import { CaretDown, Check } from '@phosphor-icons/react';
import { Popover as BasePopover } from '@base-ui-components/react/popover';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import styles from './MultiSelect.module.css';

export type MultiSelectOption = {
  value: string;
  label: string;
  leading?: ReactNode;
  meta?: string;
};

export type MultiSelectProps = {
  label: string;
  values: string[];
  options: MultiSelectOption[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
};

export function MultiSelect({
  label,
  values,
  options,
  onChange,
  placeholder = 'Any',
  searchPlaceholder = 'Filter...',
  className,
}: MultiSelectProps) {
  const [query, setQuery] = useState('');
  const selectedOptions = options.filter(option => values.includes(option.value));
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const displayValue = selectedOptions.length === 0
    ? placeholder
    : selectedOptions.length === 1
      ? selectedOptions[0]?.label
      : `${selectedOptions.length} selected`;
  const visibleOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return options;
    return options.filter(option => option.label.toLowerCase().includes(normalizedQuery));
  }, [options, query]);

  return (
    <BasePopover.Root>
      <div className={rootClassName}>
        <BasePopover.Trigger className={styles.trigger} aria-label={label}>
          <span className={styles.valueLayout}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{displayValue}</span>
          </span>
          <CaretDown className={styles.icon} size={13} weight="bold" />
        </BasePopover.Trigger>
      </div>
      <BasePopover.Portal>
        <BasePopover.Positioner align="start" sideOffset={6}>
          <BasePopover.Popup className={styles.popup}>
            <label className={styles.searchLabel}>
              <input
                autoFocus
                value={query}
                onChange={event => setQuery(event.currentTarget.value)}
                placeholder={searchPlaceholder}
              />
            </label>
            <div className={styles.list}>
              {visibleOptions.map(option => {
                const selected = values.includes(option.value);

                return (
                  <button
                    key={option.value}
                    className={selected ? `${styles.item} ${styles.itemSelected}` : styles.item}
                    onClick={() => {
                      onChange(
                        selected
                          ? values.filter(value => value !== option.value)
                          : [...values, option.value],
                      );
                    }}
                    type="button"
                  >
                    <span className={styles.checkbox} aria-hidden="true">
                      {selected ? <Check size={12} weight="bold" /> : null}
                    </span>
                    <span className={styles.itemLayout}>
                      {option.leading ? <span className={styles.leading}>{option.leading}</span> : null}
                      <span className={styles.itemLabel}>{option.label}</span>
                    </span>
                    {option.meta ? <span className={styles.meta}>{option.meta}</span> : null}
                  </button>
                );
              })}
            </div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
