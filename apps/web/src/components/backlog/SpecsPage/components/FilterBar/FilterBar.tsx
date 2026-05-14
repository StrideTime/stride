import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput } from '@stride/ui';

import { FilterSelect } from '../FilterSelect/FilterSelect';
import { defaultBacklogFilters, getActiveFilterCount, getFilterOptions } from '../../../lib/backlogFilters';
import type { BacklogFilters } from '../../../types';
import type { FilterBarProps } from './FilterBar.type';
import { getAssigneeOptions } from './utils/getAssigneeOptions';
import { getAttentionOptions, getSimpleOptions } from './utils/getSimpleOptions';
import styles from './FilterBar.module.css';

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const { t } = useTranslation();
  const activeFilterCount = getActiveFilterCount(filters);

  return (
    <div className={styles.controls}>
      <TextInput
        aria-label={t('backlog.filters.searchAria')}
        className={styles.searchControl}
        placeholder={t('backlog.filters.searchPlaceholder')}
        value={filters.query}
        leading={<MagnifyingGlass size={16} weight="bold" />}
        onChange={event =>
          onFilterChange({ ...filters, query: event.currentTarget.value })
        }
      />
      <FilterSelect
        label={t('backlog.filters.assignee')}
        value={filters.assignee}
        options={getAssigneeOptions(getFilterOptions('assignee'), t)}
        onChange={assignee => onFilterChange({ ...filters, assignee })}
      />
      <FilterSelect
        label={t('backlog.filters.priority')}
        value={filters.priority}
        options={getSimpleOptions(t('backlog.filters.anyPriority'), getFilterOptions('priority'))}
        onChange={priority =>
          onFilterChange({
            ...filters,
            priority: priority as BacklogFilters['priority'],
          })
        }
      />
      <FilterSelect
        label={t('backlog.filters.status')}
        value={filters.status}
        options={getSimpleOptions(t('backlog.filters.anyStatus'), getFilterOptions('status'))}
        onChange={status => onFilterChange({ ...filters, status })}
      />
      <FilterSelect
        label={t('backlog.filters.attention')}
        value={filters.attention}
        options={getAttentionOptions(t)}
        onChange={attention =>
          onFilterChange({
            ...filters,
            attention: attention as BacklogFilters['attention'],
          })
        }
      />
      <Button
        disabled={activeFilterCount === 0}
        icon={<X size={14} weight="bold" />}
        onClick={() => onFilterChange(defaultBacklogFilters)}
        size="md"
        variant="secondary"
      >
        {t('backlog.filters.clear', { count: activeFilterCount > 0 ? activeFilterCount : '' })}
      </Button>
    </div>
  );
}
