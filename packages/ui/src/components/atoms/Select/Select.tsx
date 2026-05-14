import { CaretDown, Check } from '@phosphor-icons/react';
import { Select as BaseSelect } from '@base-ui-components/react/select';
import type { ReactNode } from 'react';

import styles from './Select.module.css';

type SelectOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};

type SelectProps = {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
};

export function Select({ label, value, options, onChange, className }: SelectProps) {
  const selectedOption = options.find(option => option.value === value);
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');

  return (
    <BaseSelect.Root
      value={value}
      onValueChange={nextValue => {
        if (nextValue) onChange(nextValue);
      }}
    >
      <div className={rootClassName}>
        <BaseSelect.Trigger className={styles.trigger} aria-label={label}>
          <span className={styles.valueLayout}>
            <span className={styles.label}>{label}</span>
            {selectedOption?.leading ? (
              <span className={styles.leading}>{selectedOption.leading}</span>
            ) : null}
            <BaseSelect.Value />
          </span>
          <BaseSelect.Icon className={styles.icon}>
            <CaretDown size={13} weight="bold" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner align="start" alignItemWithTrigger={false} sideOffset={6}>
          <BaseSelect.Popup className={styles.popup}>
            <BaseSelect.List className={styles.list}>
              {options.map(option => (
                <BaseSelect.Item
                  key={option.value}
                  className={styles.item}
                  value={option.value}
                >
                  <span className={styles.itemLayout}>
                    {option.leading ? (
                      <span className={styles.leading}>{option.leading}</span>
                    ) : null}
                    <BaseSelect.ItemText>{option.label}</BaseSelect.ItemText>
                  </span>
                  <BaseSelect.ItemIndicator className={styles.itemIndicator}>
                    <Check size={14} weight="bold" />
                  </BaseSelect.ItemIndicator>
                </BaseSelect.Item>
              ))}
            </BaseSelect.List>
          </BaseSelect.Popup>
        </BaseSelect.Positioner>
      </BaseSelect.Portal>
    </BaseSelect.Root>
  );
}
