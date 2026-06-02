import type { BacklogSpec } from '@providers';
import type { BacklogFilters } from '../../../types';

export type SpecGroupProps = {
  specs: BacklogSpec[];
  emptyText: string;
  filters: BacklogFilters;
  onFilterChange: (filters: BacklogFilters) => void;
};
