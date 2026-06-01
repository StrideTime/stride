import { CaretDown, Check, Info } from '@phosphor-icons/react';
import { Select as BaseSelect } from '@base-ui-components/react/select';
import type { ReactNode } from 'react';

import styles from './Select.module.css';

type SelectOption = {
  value: string;
  label: string;
  leading?: ReactNode;
};

type SelectProps = {
  label?: string;
  'aria-label'?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  className?: string;
  hideTriggerLabel?: boolean;
  infoText?: string;
};

export function Select({
  label,
  'aria-label': ariaLabel,
  value,
  options,
  onChange,
  className,
  hideTriggerLabel = false,
  infoText,
}: SelectProps) {
  const selectedOption = options.find(option => option.value === value);
  const rootClassName = [styles.root, className].filter(Boolean).join(' ');
  const showLabelRow = Boolean(infoText && label);

  return (
    <BaseSelect.Root
      value={value}
      onValueChange={nextValue => {
        if (nextValue) onChange(nextValue);
      }}
    >
      <div className={rootClassName}>
        {showLabelRow ? (
          <span className={styles.labelRow}>
            <span className={styles.label}>{label}</span>
            {infoText ? <InfoTooltip label={infoText} /> : null}
          </span>
        ) : null}
        <BaseSelect.Trigger className={styles.trigger} aria-label={ariaLabel ?? label}>
          <span className={styles.valueLayout}>
            {label && !hideTriggerLabel && !showLabelRow ? (
              <span className={styles.label}>{label}</span>
            ) : null}
            {selectedOption?.leading ? (
              <span className={styles.leading}>{selectedOption.leading}</span>
            ) : null}
            <span>{selectedOption?.label ?? value}</span>
          </span>
          <BaseSelect.Icon className={styles.icon}>
            <CaretDown size={13} weight="bold" />
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
      </div>
      <BaseSelect.Portal>
        <BaseSelect.Positioner
          align="start"
          alignItemWithTrigger={false}
          sideOffset={6}
          className={styles.positioner}
        >
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

function InfoTooltip({ label }: { label: string }) {
  return (
    <span className={styles.infoTooltip} data-tooltip={label} aria-label={label} tabIndex={0}>
      <Info size={13} weight="bold" aria-hidden="true" />
    </span>
  );
}
