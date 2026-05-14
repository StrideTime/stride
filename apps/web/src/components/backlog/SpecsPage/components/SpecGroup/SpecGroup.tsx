import { Typography } from '@stride/ui';

import { FilterBar } from '../FilterBar/FilterBar';
import { SpecRow } from '../SpecRow/SpecRow';
import type { SpecGroupProps } from './SpecGroup.type';
import styles from './SpecGroup.module.css';

export function SpecGroup({
  title,
  description,
  specs,
  emptyText,
  filters,
  onFilterChange,
}: SpecGroupProps) {
  return (
    <section className={styles.group}>
      <div className={styles.groupHeader}>
        <div>
          <Typography as="h2" size="lg" weight="semibold">
            {title}
          </Typography>
          <Typography as="p" size="sm" color="muted">
            {description}
          </Typography>
        </div>
        <span className={styles.groupCount}>{specs.length}</span>
      </div>
      <FilterBar filters={filters} onFilterChange={onFilterChange} />
      <div className={styles.specList}>
        {specs.length > 0 ? (
          specs.map(spec => <SpecRow key={spec.id} spec={spec} />)
        ) : (
          <div className={styles.emptyState}>{emptyText}</div>
        )}
      </div>
    </section>
  );
}
