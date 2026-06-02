import type { BellRingingIcon } from '@phosphor-icons/react';

export type InboxViewMode = 'all' | 'review' | 'unblocked' | 'decisions';
export type InboxCategory = Exclude<InboxViewMode, 'all'>;

export type InboxCategoryConfig = {
  view: InboxCategory;
  titleKey: string;
  shortKey: string;
  icon: typeof BellRingingIcon;
};
