import type { BacklogSpec } from '../../../backlog.mock';
import type { BacklogFilters } from '../../../types';

export type SpecGroupProps = {
  specs: BacklogSpec[];
  emptyText: string;
  filters: BacklogFilters;
  onFilterChange: (filters: BacklogFilters) => void;
};
