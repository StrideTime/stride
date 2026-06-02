import { CaretLeftIcon } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';
import { Badge, Button, Typography } from '@stride/ui';

import {
  BlockTitleEditor,
  ScheduleBlockInspector,
  getEventTypeBadgeVariant,
  formatEventType,
} from './ScheduleShared';
import type { RecurrenceRule, ScheduleAction } from './schedule.mock';
import { getBlockById, updateScheduleBlocks, useScheduleState } from './scheduleStore';
import styles from './ScheduleBlockDetail.module.css';

export function ScheduleBlockDetail({ blockId }: { blockId: string }) {
  useScheduleState();
  const navigate = useNavigate();
  const found = getBlockById(blockId);

  function goBack(date?: string, view?: 'schedule' | 'sessions') {
    navigate({
      to: '/schedule',
      search: date ? { date, view } : {},
    });
  }

  if (!found) {
    return (
      <section className={styles.page}>
        <header className={styles.header}>
          <Button size="sm" variant="ghost" icon={<CaretLeftIcon size={15} />} onClick={() => goBack()}>
            Back to schedule
          </Button>
        </header>
        <div className={styles.empty}>
          <Typography size="lg" weight="bold">Event not found</Typography>
          <Typography size="sm" color="muted">
            This scheduled event may have been deleted.
          </Typography>
        </div>
      </section>
    );
  }

  const { block, layer } = found;
  const view = layer === 'actual' ? 'sessions' : 'schedule';

  function handleRename(id: string, title: string) {
    updateScheduleBlocks(layer, blocks => blocks.map(item => (
      item.id === id ? { ...item, title } : item
    )));
  }

  function handleLinkAction(id: string, action: ScheduleAction | null) {
    const linkedFields = action
      ? { actionId: action.id, sourceKey: action.sourceKey, title: action.title }
      : { actionId: undefined, sourceKey: undefined };

    updateScheduleBlocks(layer, blocks => blocks.map(item => (
      item.id === id ? { ...item, ...linkedFields } : item
    )));
  }

  function handleChangeRecurrence(id: string, recurrence: RecurrenceRule | null) {
    const recurrenceFields = recurrence
      ? { recurring: true, recurrence }
      : { recurring: false, recurrence: undefined };

    updateScheduleBlocks(layer, blocks => blocks.map(item => (
      item.id === id ? { ...item, ...recurrenceFields } : item
    )));
  }

  function handleDelete(id: string) {
    updateScheduleBlocks(layer, blocks => blocks.filter(item => item.id !== id));
    goBack(block.date, view);
  }

  return (
    <section className={styles.page}>
      <header className={styles.header}>
        <Button
          size="sm"
          variant="ghost"
          icon={<CaretLeftIcon size={15} />}
          onClick={() => goBack(block.date, view)}
        >
          Back to schedule
        </Button>
      </header>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          {block.fixed ? (
            <Typography as="h1" size="2xl" weight="bold">{block.title}</Typography>
          ) : (
            <BlockTitleEditor block={block} onRename={handleRename} />
          )}
          <Badge variant={getEventTypeBadgeVariant(block.type)}>
            {formatEventType(block.type)}
          </Badge>
        </div>
        <ScheduleBlockInspector
          block={block}
          onLinkAction={handleLinkAction}
          onChangeRecurrence={handleChangeRecurrence}
          onDeleteBlock={handleDelete}
        />
      </div>
    </section>
  );
}
