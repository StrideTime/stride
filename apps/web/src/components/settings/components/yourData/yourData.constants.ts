import { Smiley, SmileyMeh, SmileySad, Target } from '@phosphor-icons/react';

import type { Feeling } from '../../yourData.mock';
import type { DataCategory } from './types';

export const PAGE_SIZE = 12;
export const DATA_CATEGORIES: readonly DataCategory[] = ['sessions', 'checkins', 'captures'];

export const CATEGORY_LABEL_KEY: Record<DataCategory, string> = {
  sessions: 'settings.yourData.categories.sessions',
  checkins: 'settings.yourData.categories.checkins',
  captures: 'settings.yourData.categories.captures',
};

export const FEELING_META: Record<Feeling, { labelKey: string; icon: typeof Smiley }> = {
  frown: { labelKey: 'settings.yourData.feelings.frown', icon: SmileySad },
  neutral: { labelKey: 'settings.yourData.feelings.neutral', icon: SmileyMeh },
  smile: { labelKey: 'settings.yourData.feelings.smile', icon: Smiley },
  target: { labelKey: 'settings.yourData.feelings.target', icon: Target },
};
