import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSpecs } from '../../specs';
import { Controls } from '../components/Controls/Controls';
import { Header } from '../components/Header/Header';
import { SpecGroup } from './components/SpecGroup/SpecGroup';
import { defaultBacklogFilters, getVisibleSpecs } from '../lib/backlogFilters';
import type { BacklogView } from '../types';
import type { SpecsPageProps } from './SpecsPage.type';
import styles from './SpecsPage.module.css';

export function SpecsPage(_props: SpecsPageProps) {
  const { t } = useTranslation();
  const { specs } = useSpecs();
  const [activeView, setActiveView] = useState<BacklogView>('all');
  const [filters, setFilters] = useState(defaultBacklogFilters);
  const visibleSpecs = useMemo(
    () => getVisibleSpecs(specs, activeView, filters),
    [specs, activeView, filters],
  );
  const emptyText = t(`backlog.views.${activeView}.empty`);

  return (
    <section className={styles.page}>
      <Header surface="specs" />
      <Controls
        surface="specs"
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className={styles.pipeline}>
        <SpecGroup
          specs={visibleSpecs}
          emptyText={emptyText}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </section>
  );
}
