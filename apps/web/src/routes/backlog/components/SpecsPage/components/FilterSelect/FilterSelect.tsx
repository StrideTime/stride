import { MultiSelect } from '@stride/ui';

import type { FilterSelectProps } from './FilterSelect.type';

export function FilterSelect({
  label,
  values,
  options,
  onChange,
  placeholder,
  searchPlaceholder,
  className,
}: FilterSelectProps) {
  return (
    <MultiSelect
      label={label}
      values={values}
      options={options}
      placeholder={placeholder}
      searchPlaceholder={searchPlaceholder}
      className={className}
      onChange={onChange}
    />
  );
}
