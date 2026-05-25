import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Button, TextInput } from '@stride/ui';

import { useSpecs } from '../../../../specs';
import { FilterSelect } from '../FilterSelect/FilterSelect';
import { defaultBacklogFilters, getActiveFilterCount, getFilterOptions } from '../../../lib/backlogFilters';
import type { BacklogFilters } from '../../../types';
import type { FilterBarProps } from './FilterBar.type';
import { getAssigneeOptions } from './utils/getAssigneeOptions';
import { getAttentionOptions, getSimpleOptions } from './utils/getSimpleOptions';
import styles from './FilterBar.module.css';

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const { t } = useTranslation();
  const { specs } = useSpecs();
  const activeFilterCount = getActiveFilterCount(filters);
  const assigneeClassName = [styles.filterChip, filters.assignee.length > 0 ? styles.filterChipActive : '']
    .filter(Boolean)
    .join(' ');
  const priorityClassName = [styles.filterChip, filters.priority.length > 0 ? styles.filterChipActive : '']
    .filter(Boolean)
    .join(' ');
  const statusClassName = [styles.filterChip, filters.status.length > 0 ? styles.filterChipActive : '']
    .filter(Boolean)
    .join(' ');
  const attentionClassName = [styles.filterChip, filters.attention.length > 0 ? styles.filterChipActive : '']
    .filter(Boolean)
    .join(' ');

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
      <div className={styles.filterScroller}>
        <Button
          className={activeFilterCount > 0 ? styles.clearActive : styles.clearButton}
          disabled={activeFilterCount === 0}
          icon={<X size={14} weight="bold" />}
          onClick={() => onFilterChange(defaultBacklogFilters)}
          size="md"
          variant="secondary"
        >
          {activeFilterCount > 0
            ? t('backlog.filters.clear', { count: activeFilterCount })
            : t('backlog.filters.clear', { count: '' }).trim()}
        </Button>
        <FilterSelect
          label={t('backlog.filters.assignee')}
          values={filters.assignee}
          options={getAssigneeOptions(getFilterOptions(specs, 'assignee'), t)}
          placeholder={t('backlog.filters.everyone')}
          searchPlaceholder={t('backlog.filters.dropdownSearchPlaceholder')}
          className={assigneeClassName}
          onChange={assignee => onFilterChange({ ...filters, assignee })}
        />
        <FilterSelect
          label={t('backlog.filters.priority')}
          values={filters.priority}
          options={getSimpleOptions(t('backlog.filters.anyPriority'), getFilterOptions(specs, 'priority'))}
          placeholder={t('backlog.filters.anyPriority')}
          searchPlaceholder={t('backlog.filters.dropdownSearchPlaceholder')}
          className={priorityClassName}
          onChange={priority =>
            onFilterChange({
              ...filters,
              priority: priority as BacklogFilters['priority'],
            })
          }
        />
        <FilterSelect
          label={t('backlog.filters.status')}
          values={filters.status}
          options={getSimpleOptions(t('backlog.filters.anyStatus'), getFilterOptions(specs, 'status'))}
          placeholder={t('backlog.filters.anyStatus')}
          searchPlaceholder={t('backlog.filters.dropdownSearchPlaceholder')}
          className={statusClassName}
          onChange={status => onFilterChange({ ...filters, status })}
        />
        <FilterSelect
          label={t('backlog.filters.attention')}
          values={filters.attention}
          options={getAttentionOptions(t)}
          placeholder={t('backlog.filters.anyAttention')}
          searchPlaceholder={t('backlog.filters.dropdownSearchPlaceholder')}
          className={attentionClassName}
          onChange={attention =>
            onFilterChange({
              ...filters,
              attention: attention as BacklogFilters['attention'],
            })
          }
        />
      </div>
    </div>
  );
}
