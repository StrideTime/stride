import { useTranslation } from 'react-i18next';
import { Badge } from '@stride/ui';

import type { StatusPillProps } from './StatusPill.type';
import { getStatusPill } from './utils/getStatusPill';

export function StatusPill({ action }: StatusPillProps) {
  const { t } = useTranslation();
  const status = getStatusPill(action, t);

  return <Badge variant={status.variant}>{status.label}</Badge>;
}
