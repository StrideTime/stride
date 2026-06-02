import { BellRingingIcon, CheckCircleIcon, ShieldCheckIcon } from '@phosphor-icons/react';

import type { InboxType } from './inbox.mock';
import type { InboxCategoryConfig, InboxNavVariant } from './types';

export const INBOX_NAV_VARIANTS: Array<{ id: InboxNavVariant; labelKey: string }> = [
  { id: 'chips', labelKey: 'inbox.navVariants.chips' },
  { id: 'feed', labelKey: 'inbox.navVariants.feed' },
  { id: 'strip', labelKey: 'inbox.navVariants.strip' },
  { id: 'select', labelKey: 'inbox.navVariants.select' },
];

export const INBOX_CATEGORIES: InboxCategoryConfig[] = [
  {
    view: 'review',
    titleKey: 'inbox.categories.review.title',
    shortKey: 'inbox.categories.review.short',
    icon: BellRingingIcon,
  },
  {
    view: 'unblocked',
    titleKey: 'inbox.categories.unblocked.title',
    shortKey: 'inbox.categories.unblocked.short',
    icon: CheckCircleIcon,
  },
  {
    view: 'decisions',
    titleKey: 'inbox.categories.decisions.title',
    shortKey: 'inbox.categories.decisions.short',
    icon: ShieldCheckIcon,
  },
];

export const INBOX_TYPE_TONES: Record<InboxType, 'accent' | 'neutral' | 'success' | 'warning'> = {
  assigned: 'accent',
  unblocked: 'success',
  handoff: 'accent',
  approval: 'warning',
  'source-drift': 'warning',
  unmapped: 'neutral',
};
