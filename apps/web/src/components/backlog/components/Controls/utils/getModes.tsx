import { CheckCircle, GitBranch, Timer, Tray } from '@phosphor-icons/react';
import type { TFunction } from 'i18next';

import type { BacklogMode } from '../Controls.type';

export function getModes(surface: 'specs' | 'actions', t: TFunction): BacklogMode[] {
  if (surface === 'actions') {
    return [
      { view: 'next', title: t('backlog.views.next.title'), subtitle: t('backlog.views.next.subtitle'), icon: <CheckCircle size={18} weight="bold" /> },
      { view: 'progress', title: t('backlog.views.progress.title'), subtitle: t('backlog.views.progress.subtitle'), icon: <Timer size={18} weight="bold" /> },
      { view: 'blocked', title: t('backlog.views.blocked.title'), subtitle: t('backlog.views.blocked.subtitle'), icon: <GitBranch size={18} weight="bold" /> },
      { view: 'completed', title: t('backlog.views.completed.title'), subtitle: t('backlog.views.completed.subtitle'), icon: <CheckCircle size={18} weight="bold" /> },
    ];
  }

  return [
    { view: 'all', title: t('backlog.views.all.title'), subtitle: t('backlog.views.all.subtitle'), icon: <Tray size={18} weight="bold" /> },
    { view: 'refine', title: t('backlog.views.refine.title'), subtitle: t('backlog.views.refine.subtitle'), icon: <GitBranch size={18} weight="bold" /> },
    { view: 'progress', title: t('backlog.views.progress.title'), subtitle: t('backlog.views.progress.specsSubtitle'), icon: <Timer size={18} weight="bold" /> },
    { view: 'blocked', title: t('backlog.views.blocked.title'), subtitle: t('backlog.views.blocked.subtitle'), icon: <Timer size={18} weight="bold" /> },
  ];
}
