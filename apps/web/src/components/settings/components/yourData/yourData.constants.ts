import { SmileyIcon, SmileyMehIcon, SmileySadIcon, TargetIcon } from '@phosphor-icons/react';

import type { Feeling } from '../../yourData.mock';
import type { DataCategory } from './types';

export const PAGE_SIZE = 12;
export const DATA_CATEGORIES: readonly DataCategory[] = ['sessions', 'checkins', 'captures'];

export const CATEGORY_LABEL_KEY: Record<DataCategory, string> = {
  sessions: 'settings.yourData.categories.sessions',
  checkins: 'settings.yourData.categories.checkins',
  captures: 'settings.yourData.categories.captures',
};

export const FEELING_META: Record<Feeling, { labelKey: string; icon: typeof SmileyIcon }> = {
  frown: { labelKey: 'settings.yourData.feelings.frown', icon: SmileySadIcon },
  neutral: { labelKey: 'settings.yourData.feelings.neutral', icon: SmileyMehIcon },
  smile: { labelKey: 'settings.yourData.feelings.smile', icon: SmileyIcon },
  target: { labelKey: 'settings.yourData.feelings.target', icon: TargetIcon },
};
