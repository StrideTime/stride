import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Controls } from '../components/Controls/Controls';
import { Header } from '../components/Header/Header';
import { SpecGroup } from './components/SpecGroup/SpecGroup';
import { defaultBacklogFilters, getVisibleSpecs } from '../lib/backlogFilters';
import { getViewCopy } from '../lib/viewCopy';
import type { BacklogView } from '../types';
import type { SpecsPageProps } from './SpecsPage.type';
import styles from './SpecsPage.module.css';

export function SpecsPage(_props: SpecsPageProps) {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<BacklogView>('all');
  const [filters, setFilters] = useState(defaultBacklogFilters);
  const visibleSpecs = useMemo(
    () => getVisibleSpecs(activeView, filters),
    [activeView, filters],
  );
  const viewCopy = getViewCopy(t, activeView);

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
          title={viewCopy.title}
          description={viewCopy.description}
          specs={visibleSpecs}
          emptyText={viewCopy.empty}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
    </section>
  );
}
