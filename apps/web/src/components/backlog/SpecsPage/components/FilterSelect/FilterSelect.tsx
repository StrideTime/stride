import { Select } from '@stride/ui';

import type { FilterSelectProps } from './FilterSelect.type';

export function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
  return <Select label={label} value={value} options={options} onChange={onChange} />;
}
