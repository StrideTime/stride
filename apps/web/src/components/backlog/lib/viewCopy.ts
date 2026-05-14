import type { TFunction } from 'i18next';

import type { BacklogView } from '../types';

export function getViewCopy(t: TFunction, view: BacklogView) {
  return {
    title: t(`backlog.views.${view}.title`),
    description: t(`backlog.views.${view}.description`),
    empty: t(`backlog.views.${view}.empty`),
  };
}
