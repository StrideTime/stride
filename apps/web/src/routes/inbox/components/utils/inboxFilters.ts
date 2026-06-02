import { INBOX_CATEGORIES } from '../inbox.constants';
import { inboxNotifications } from '../inbox.mock';
import type { InboxNotification } from '../inbox.mock';
import type { InboxViewMode } from '../types';

export function getVisibleItems(view: InboxViewMode, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  const viewItems = getItemsForView(view);

  if (!normalizedQuery) {
    return viewItems;
  }

  return viewItems.filter(item => [
    item.title,
    item.sourceKey,
    item.source,
    item.team,
    item.actor,
    item.summary,
    item.detail,
  ].some(value => value.toLowerCase().includes(normalizedQuery)));
}

export function getItemsForView(view: InboxViewMode) {
  if (view === 'review') {
    return inboxNotifications.filter(item => item.type === 'assigned' || item.type === 'handoff');
  }

  if (view === 'unblocked') {
    return inboxNotifications.filter(item => item.type === 'unblocked');
  }

  if (view === 'decisions') {
    return inboxNotifications.filter(item => (
      item.type === 'approval' || item.type === 'source-drift' || item.type === 'unmapped'
    ));
  }

  return inboxNotifications;
}

export function getInboxScopeLabel(view: InboxViewMode, translate: (key: string) => string) {
  if (view === 'all') return translate('inbox.allUpdates').toLowerCase();
  const category = INBOX_CATEGORIES.find(item => item.view === view);
  return category ? translate(category.titleKey).toLowerCase() : translate('inbox.allUpdates').toLowerCase();
}

export function getDetailEventText(item: InboxNotification, translate: (key: string, values?: Record<string, string>) => string) {
  if (item.type === 'unblocked') {
    return translate('inbox.detail.unblocked', { actor: item.actor, timestamp: item.timestamp });
  }

  return translate('inbox.detail.updated', { actor: item.actor, timestamp: item.timestamp });
}
