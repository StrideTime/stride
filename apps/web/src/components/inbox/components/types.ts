import type { InboxNotification } from '../inbox.mock';
import type { InboxViewMode } from '../types';

export type InboxVariantProps = {
  activeView: InboxViewMode;
  onSelect: (view: InboxViewMode) => void;
  query: string;
  onQuery: (value: string) => void;
  visibleItems: InboxNotification[];
  onItemSelect: (id: string) => void;
  selectedItemId: string | null;
};
