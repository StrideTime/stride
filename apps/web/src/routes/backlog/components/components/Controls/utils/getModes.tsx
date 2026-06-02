import { CheckCircleIcon, GitBranchIcon, TimerIcon, TrayIcon } from '@phosphor-icons/react';
import type { TFunction } from 'i18next';

import type { BacklogMode } from '../Controls.type';

export function getModes(surface: 'specs' | 'actions', t: TFunction): BacklogMode[] {
  if (surface === 'actions') {
    return [
      { view: 'next', title: t('backlog.views.next.title'), subtitle: t('backlog.views.next.subtitle'), icon: <CheckCircleIcon size={18} weight="bold" /> },
      { view: 'progress', title: t('backlog.views.progress.title'), subtitle: t('backlog.views.progress.subtitle'), icon: <TimerIcon size={18} weight="bold" /> },
      { view: 'blocked', title: t('backlog.views.blocked.title'), subtitle: t('backlog.views.blocked.subtitle'), icon: <GitBranchIcon size={18} weight="bold" /> },
      { view: 'completed', title: t('backlog.views.completed.title'), subtitle: t('backlog.views.completed.subtitle'), icon: <CheckCircleIcon size={18} weight="bold" /> },
    ];
  }

  return [
    { view: 'all', title: t('backlog.views.all.title'), subtitle: t('backlog.views.all.subtitle'), icon: <TrayIcon size={18} weight="bold" /> },
    { view: 'refine', title: t('backlog.views.refine.title'), subtitle: t('backlog.views.refine.subtitle'), icon: <GitBranchIcon size={18} weight="bold" /> },
    { view: 'progress', title: t('backlog.views.progress.title'), subtitle: t('backlog.views.progress.specsSubtitle'), icon: <TimerIcon size={18} weight="bold" /> },
    { view: 'blocked', title: t('backlog.views.blocked.title'), subtitle: t('backlog.views.blocked.subtitle'), icon: <TimerIcon size={18} weight="bold" /> },
  ];
}
