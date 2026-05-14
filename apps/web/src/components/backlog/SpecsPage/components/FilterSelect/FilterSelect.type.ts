import type { FilterOption } from '../../../types';

export type FilterSelectProps = {
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
};
