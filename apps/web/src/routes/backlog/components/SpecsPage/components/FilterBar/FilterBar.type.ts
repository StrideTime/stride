import type { BacklogFilters } from '../../../types';

export type FilterBarProps = {
  filters: BacklogFilters;
  onFilterChange: (filters: BacklogFilters) => void;
};
