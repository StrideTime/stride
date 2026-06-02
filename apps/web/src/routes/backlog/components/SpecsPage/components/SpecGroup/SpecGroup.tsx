import { FilterBar } from '../FilterBar/FilterBar';
import { SpecRow } from '../SpecRow/SpecRow';
import type { SpecGroupProps } from './SpecGroup.type';
import styles from './SpecGroup.module.css';

export function SpecGroup({
  specs,
  emptyText,
  filters,
  onFilterChange,
}: SpecGroupProps) {
  return (
    <section className={styles.group}>
      <div className={styles.specList}>
        <FilterBar filters={filters} onFilterChange={onFilterChange} />
        {specs.length > 0 ? (
          specs.map(spec => <SpecRow key={spec.id} spec={spec} />)
        ) : (
          <div className={styles.emptyState}>{emptyText}</div>
        )}
      </div>
    </section>
  );
}
