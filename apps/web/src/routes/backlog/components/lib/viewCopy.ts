import type { TFunction } from 'i18next';

import type { BacklogView } from '../types';

export function getViewCopy(t: TFunction, view: BacklogView) {
  return {
    empty: t(`backlog.views.${view}.empty`),
  };
}
