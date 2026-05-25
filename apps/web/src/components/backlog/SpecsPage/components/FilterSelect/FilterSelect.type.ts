import type { FilterOption } from '../../../types';

export type FilterSelectProps = {
  label: string;
  values: string[];
  options: FilterOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  onChange: (values: string[]) => void;
};
