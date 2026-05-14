import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ActionList } from './components/ActionList/ActionList';
import { Controls } from '../components/Controls/Controls';
import { Header } from '../components/Header/Header';
import { defaultBacklogFilters, getVisibleActions } from '../lib/backlogFilters';
import { getViewCopy } from '../lib/viewCopy';
import type { ActionScope, BacklogView } from '../types';
import type { ActionsPageProps } from './ActionsPage.type';
import styles from './ActionsPage.module.css';

export function ActionsPage(_props: ActionsPageProps) {
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState<BacklogView>('next');
  const [actionScope, setActionScope] = useState<ActionScope>('mine');
  const viewCopy = getViewCopy(t, activeView);
  const effectiveActionScope = activeView === 'next' ? 'mine' : actionScope;
  const actionRows = useMemo(
    () => getVisibleActions(activeView, effectiveActionScope, defaultBacklogFilters),
    [activeView, effectiveActionScope],
  );

  return (
    <section className={styles.page}>
      <Header surface="actions" />
      <Controls
        surface="actions"
        activeView={activeView}
        onViewChange={setActiveView}
      />
      <div className={styles.pipeline}>
        <ActionList
          title={viewCopy.title}
          description={viewCopy.description}
          actions={actionRows}
          emptyText={viewCopy.empty}
          scope={effectiveActionScope}
          activeView={activeView}
          onScopeChange={setActionScope}
        />
      </div>
    </section>
  );
}
