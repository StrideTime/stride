import { useEffect, useMemo, useRef, useState } from 'react';

import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core';
import { DotsSixVerticalIcon, PlusIcon, TrashIcon, TrayIcon } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';
import { Typography } from '@stride/ui';

import { useAppMode } from '../app-mode';
import {
  formatTime,
  getGenericBlockIcon,
  getGenericBlockTitle,
  MiniWeekStrip,
  ModeToggle,
  ScheduleBlockCard,
  ScheduleDateNavigator,
  ScheduleTray,
  toScheduleBlock,
  type GenericBlockType,
  type SelectedScheduleBlock,
  type TrayState,
} from './ScheduleShared';
import {
  type ScheduleAction,
  type ScheduleBlock,
  type ScheduleMode,
} from './schedule.mock';
import { updateScheduleBlocks as storeUpdateScheduleBlocks, useScheduleState } from './scheduleStore';
import styles from './ScheduleDayView.module.css';

const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const HOUR_HEIGHT = 96;
const DEFAULT_WORKDAY_START_HOUR = 8;
const CURRENT_TIME_HOUR = 14.35;
const SLOT_MINUTES = 15;
const MIN_BLOCK_MINUTES = 15;

const cursorCenteredDragOverlay: Modifier = ({
  activatorEvent,
  activeNodeRect,
  overlayNodeRect,
  transform,
}) => {
  // `PointerEvent` is undefined during SSR; dnd-kit still applies modifiers on
  // the server render, so guard the global before the `instanceof` check.
  if (
    typeof PointerEvent === 'undefined' ||
    !(activatorEvent instanceof PointerEvent) ||
    !activeNodeRect ||
    !overlayNodeRect
  ) {
    return transform;
  }

  return {
    ...transform,
    x: transform.x + activatorEvent.clientX - activeNodeRect.left - overlayNodeRect.width / 2,
    y: transform.y + activatorEvent.clientY - activeNodeRect.top - overlayNodeRect.height / 2,
  };
};

export function ScheduleDayView({
  date,
  selectedBlockId,
  view,
}: {
  date: string;
  selectedBlockId?: string;
  view: 'schedule' | 'sessions';
}) {
  const { mode: appMode } = useAppMode();
  const scheduleFirst = appMode === 'schedule-first';
  const [mode, setMode] = useState<ScheduleMode>(
    scheduleFirst ? 'plan' : view === 'sessions' ? 'actual' : 'plan'
  );
  const navigate = useNavigate();
  const sensors = useSensors(
    // Desktop: start dragging after a small movement.
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // Touch: require a deliberate press-and-hold so a quick swipe scrolls
    // instead of accidentally dragging a block. Small movement during the
    // hold cancels (treated as a scroll).
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } })
  );
  const canvasShellRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const dragOffsetMinRef = useRef(0);
  const lastClientPointerRef = useRef<{ x: number; y: number } | null>(null);
  const lastSchedulePointerRef = useRef<{ x: number; y: number } | null>(null);
  const activeDragDataRef = useRef<Record<string, unknown> | null>(null);
  const resizeStateRef = useRef<ResizeState | null>(null);
  const [activeDrag, setActiveDrag] = useState<ScheduleAction | ScheduleBlock | null>(null);
  const [activeGenericDrag, setActiveGenericDrag] = useState<GenericBlockType | null>(null);
  const [draggingBlockId, setDraggingBlockId] = useState<string | null>(null);
  const [dropPreview, setDropPreview] = useState<DropPreview | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<SelectedScheduleBlock | null>(null);
  const [newBlockTitleFocusId, setNewBlockTitleFocusId] = useState<string | null>(null);
  const [trayState, setTrayState] = useState<TrayState>('hidden');
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [placingAction, setPlacingAction] = useState<ScheduleAction | null>(null);
  const [placingBlockType, setPlacingBlockType] = useState<GenericBlockType | null>(null);
  const isMobile = useIsMobile();
  const isDragging = Boolean(activeDrag || activeGenericDrag);
  const isPlacing = Boolean(placingAction || placingBlockType);
  const placingLabel = placingAction
    ? placingAction.title
    : placingBlockType
      ? getGenericBlockTitle(placingBlockType)
      : null;
  const { plan: plannedScheduleBlocks, actual: actualScheduleBlocks } = useScheduleState();
  const scheduleBlocks = mode === 'plan' ? plannedScheduleBlocks : actualScheduleBlocks;
  const contextScheduleBlocks = mode === 'plan' ? actualScheduleBlocks : plannedScheduleBlocks;
  const activeBlocks = useMemo(
    () => scheduleBlocks.filter(block => block.date === date),
    [date, scheduleBlocks]
  );
  const contextBlocks = useMemo(
    () => contextScheduleBlocks.filter(block => block.date === date),
    [contextScheduleBlocks, date]
  );
  const activeBlockLayouts = layoutScheduleBlocks(activeBlocks);
  const contextBlockLayouts = layoutScheduleBlocks(contextBlocks);

  function handleDayChange(dayOffset: number) {
    navigate({
      to: '/schedule',
      search: {
        date: toDateKey(addDays(parseDateKey(date), dayOffset)),
        view: mode === 'actual' ? 'sessions' : 'schedule',
      },
    });
  }

  function handleModeChange(nextMode: ScheduleMode) {
    setMode(nextMode);
    setSelectedBlock(null);
    setNewBlockTitleFocusId(null);
    navigate({
      to: '/schedule',
      search: { date, view: nextMode === 'actual' ? 'sessions' : 'schedule' },
      replace: true,
    });
  }

  function handleSelectBlock(block: SelectedScheduleBlock) {
    setSelectedBlock(block);
    navigate({
      to: '/schedule',
      search: {
        date,
        view: mode === 'actual' ? 'sessions' : 'schedule',
        blockId: block.id,
      },
      replace: true,
    });
  }

  function handleOpenBlock(block: SelectedScheduleBlock) {
    if (isMobile) {
      navigate({
        to: '/schedule/block/$blockId',
        params: { blockId: block.id },
      });
      return;
    }

    handleSelectBlock(block);
  }

  function handleClearSelection() {
    setSelectedBlock(null);
    setNewBlockTitleFocusId(null);
    navigate({
      to: '/schedule',
      search: { date, view: mode === 'actual' ? 'sessions' : 'schedule' },
      replace: true,
    });
  }

  useEffect(() => {
    const canvasShell = canvasShellRef.current;

    if (!canvasShell || selectedBlockId) {
      return;
    }

    const currentTimeTop = CURRENT_TIME_HOUR * HOUR_HEIGHT;
    const scrollTop = Math.max(currentTimeTop - canvasShell.clientHeight * 0.25, 0);

    canvasShell.scrollTo({
      top: scrollTop,
      behavior: 'instant',
    });
  }, [date, selectedBlockId]);

  useEffect(() => {
    setMode(scheduleFirst ? 'plan' : view === 'sessions' ? 'actual' : 'plan');
  }, [scheduleFirst, view]);

  useEffect(() => {
    if (!selectedBlockId) {
      return;
    }

    const visibleBlock = activeBlocks.find(item => item.id === selectedBlockId);

    if (visibleBlock) {
      setSelectedBlock({ ...visibleBlock, layer: mode });
      scrollBlockIntoFocus(visibleBlock, canvasShellRef.current);
    }
  }, [activeBlocks, mode, selectedBlockId]);

  useEffect(() => {
    if (!activeDrag && !activeGenericDrag) {
      return;
    }

    function handlePointerMove(event: PointerEvent) {
      lastClientPointerRef.current = { x: event.clientX, y: event.clientY };
    }

    window.addEventListener('pointermove', handlePointerMove, true);

    return () => window.removeEventListener('pointermove', handlePointerMove, true);
  }, [activeDrag, activeGenericDrag]);

  function handleDragStart(event: DragStartEvent) {
    const data = event.active.data.current;
    activeDragDataRef.current = data ?? null;
    lastClientPointerRef.current = getEventPointer(event.activatorEvent);
    // Confirm the drag has "locked in" with a haptic tick (no-op where unsupported).
    triggerHaptic(18);
    // Only compress a fully-open tray so it doesn't cover the calendar mid-drag;
    // a hidden tray (e.g. dragging a calendar block) stays out of the way.
    setTrayState(prev => (prev === 'full' ? 'peek' : prev));
    setAddMenuOpen(false);

    setActiveDrag((data?.action ?? data?.block ?? null) as ScheduleAction | ScheduleBlock | null);
    setActiveGenericDrag(data?.type === 'generic' ? data.blockType as GenericBlockType : null);

    if (data?.type === 'action' || data?.type === 'generic') {
      dragOffsetMinRef.current = 0;
      lastSchedulePointerRef.current = null;
      setDraggingBlockId(null);
      return;
    }

    if (data?.type !== 'block' || !canvasRef.current) {
      dragOffsetMinRef.current = 0;
      lastSchedulePointerRef.current = null;
      setDraggingBlockId(null);
      return;
    }

    const block = data.block as ScheduleBlock;
    setDraggingBlockId(block.id);

    dragOffsetMinRef.current = Math.max(
      0,
      getPointerMinutes(event.activatorEvent, canvasRef.current) - block.startMin
    );
  }

  function handleDragMove(event: DragMoveEvent) {
    const data = event.active.data.current;

    if (!data || !canvasRef.current || !canvasShellRef.current) {
      lastClientPointerRef.current = null;
      lastSchedulePointerRef.current = null;
      setDropPreview(null);
      return;
    }

    const pointer = lastClientPointerRef.current
      ?? getDragPointer(event.activatorEvent, event.delta.x, event.delta.y);

    if (!isPointerInsideElement(pointer, canvasShellRef.current)) {
      lastSchedulePointerRef.current = null;
      setDropPreview(null);
      return;
    }

    lastSchedulePointerRef.current = pointer;

    if (data.type === 'action' || data.type === 'generic') {
      const durationMin = data.type === 'generic'
        ? getGenericBlockDuration(data.blockType as GenericBlockType)
        : 60;
      const block = data.type === 'generic'
        ? createGenericBlock(data.blockType as GenericBlockType, date, mode, 0)
        : toScheduleBlock(data.action as ScheduleAction, date);
      const startMin = clampStart(getEventStartMinutes(pointer, canvasRef.current, 0), durationMin);

      setDropPreview({
        block: { ...block, durationMin },
        startMin,
        durationMin,
      });
      return;
    }

    const block = data.block as ScheduleBlock;
    const startMin = clampStart(
      getEventStartMinutes(pointer, canvasRef.current, dragOffsetMinRef.current),
      block.durationMin
    );

    setDropPreview({
      block,
      startMin,
      durationMin: block.durationMin,
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    triggerHaptic(12);
    const data = event.active.data.current ?? activeDragDataRef.current;
    const activeDragAtDrop = activeDrag;
    const pointer = lastClientPointerRef.current
      ?? getDragPointer(event.activatorEvent, event.delta.x, event.delta.y);
    const schedulePointer = canvasShellRef.current && isPointerInsideElement(pointer, canvasShellRef.current)
      ? pointer
      : lastSchedulePointerRef.current ?? pointer;

    setActiveDrag(null);
    setActiveGenericDrag(null);
    setDropPreview(null);
    setDraggingBlockId(null);
    setTrayState('hidden');
    activeDragDataRef.current = null;
    lastClientPointerRef.current = null;

    if (!canvasRef.current || !data) {
      dragOffsetMinRef.current = 0;
      lastSchedulePointerRef.current = null;
      return;
    }

    if (data.type === 'action' || (activeDragAtDrop && 'estimateMin' in activeDragAtDrop)) {
      const action = (data.action ?? activeDragAtDrop) as ScheduleAction;
      const durationMin = 60;
      const startMin = dropPreview
        ? dropPreview.startMin
        : clampStart(getEventStartMinutes(schedulePointer, canvasRef.current, 0), durationMin);

      dragOffsetMinRef.current = 0;
      lastSchedulePointerRef.current = null;
      addActionBlock(action, startMin);
      return;
    }

    if (data.type === 'generic') {
      const blockType = data.blockType as GenericBlockType;
      const durationMin = getGenericBlockDuration(blockType);
      const startMin = dropPreview
        ? dropPreview.startMin
        : clampStart(getEventStartMinutes(schedulePointer, canvasRef.current, 0), durationMin);
      const block = createGenericBlock(blockType, date, mode, startMin);

      dragOffsetMinRef.current = 0;
      lastSchedulePointerRef.current = null;
      updateScheduleBlocks(blocks => [...blocks, block]);
      handleSelectBlock({ ...block, layer: mode });
      setNewBlockTitleFocusId(block.id);
      return;
    }

    if (data.type === 'block') {
      const block = data.block as ScheduleBlock;
      const startMin = dropPreview
        ? dropPreview.startMin
        : clampStart(
            getEventStartMinutes(schedulePointer, canvasRef.current, dragOffsetMinRef.current),
            block.durationMin
          );

      dragOffsetMinRef.current = 0;
      lastSchedulePointerRef.current = null;
      if (block.recurring) {
        confirmRecurringEdit('move');
      }

      updateScheduleBlocks(blocks => blocks.map(item => (
        item.id === block.id ? { ...item, date, startMin } : item
      )));
    }
  }

  function handleResize(block: ScheduleBlock, edge: 'start' | 'end', pointerDeltaY: number) {
    if (!resizeStateRef.current || resizeStateRef.current.blockId !== block.id) {
      resizeStateRef.current = {
        blockId: block.id,
        startMin: block.startMin,
        durationMin: block.durationMin,
      };
    }

    const initial = resizeStateRef.current;
    const deltaMin = snapDeltaMinutes((pointerDeltaY / HOUR_HEIGHT) * 60);
    const initialEndMin = initial.startMin + initial.durationMin;
    const nextStartMin = edge === 'start'
      ? Math.min(initial.startMin + deltaMin, initialEndMin - MIN_BLOCK_MINUTES)
      : initial.startMin;
    const nextEndMin = edge === 'end'
      ? Math.max(initialEndMin + deltaMin, initial.startMin + MIN_BLOCK_MINUTES)
      : initialEndMin;
    const durationMin = Math.max(MIN_BLOCK_MINUTES, nextEndMin - nextStartMin);
    const clampedStart = clampStart(nextStartMin, durationMin);

    if (block.recurring) {
      confirmRecurringEdit('resize');
    }

    updateScheduleBlocks(blocks => blocks.map(item => (
      item.id === block.id ? { ...item, startMin: clampedStart, durationMin } : item
    )));
  }

  function handleAddGenericBlock(type: GenericBlockType) {
    const durationMin = getGenericBlockDuration(type);
    const startMin = getVisibleCenterStart(canvasShellRef.current, durationMin);
    const block = createGenericBlock(type, date, mode, startMin);

    updateScheduleBlocks(blocks => [...blocks, block]);
    handleSelectBlock({ ...block, layer: mode });
    setNewBlockTitleFocusId(block.id);
    setAddMenuOpen(false);
    // On mobile the block is added from the bottom drawer; close it so the new
    // block (with its title focused for editing) is visible on the calendar.
    setTrayState('hidden');
  }

  function addActionBlock(action: ScheduleAction, startMin: number) {
    const durationMin = 60;
    const block = toScheduleBlock(action, date);
    const newBlock = {
      ...block,
      id: `${mode}-${block.id}-${startMin}`,
      startMin,
      durationMin,
    };

    updateScheduleBlocks(blocks => [...blocks, newBlock]);
    handleSelectBlock({ ...newBlock, layer: mode });
    setNewBlockTitleFocusId(newBlock.id);
  }

  function handlePickAction(action: ScheduleAction) {
    setPlacingAction(action);
    setPlacingBlockType(null);
    setTrayState('hidden');
  }

  function handlePickGenericBlock(type: GenericBlockType) {
    setPlacingBlockType(type);
    setPlacingAction(null);
    setAddMenuOpen(false);
    setTrayState('hidden');
  }

  function handlePlaceAtPointer(clientX: number, clientY: number) {
    if (!canvasRef.current) {
      return;
    }

    if (placingAction) {
      const startMin = clampStart(
        getEventStartMinutes({ x: clientX, y: clientY }, canvasRef.current, 0),
        60
      );

      addActionBlock(placingAction, startMin);
      setPlacingAction(null);
      setTrayState('hidden');
      return;
    }

    if (placingBlockType) {
      const durationMin = getGenericBlockDuration(placingBlockType);
      const startMin = clampStart(
        getEventStartMinutes({ x: clientX, y: clientY }, canvasRef.current, 0),
        durationMin
      );
      const block = createGenericBlock(placingBlockType, date, mode, startMin);

      updateScheduleBlocks(blocks => [...blocks, block]);
      handleSelectBlock({ ...block, layer: mode });
      setNewBlockTitleFocusId(block.id);
      setPlacingBlockType(null);
      setTrayState('hidden');
    }
  }

  function handleRenameBlock(blockId: string, title: string) {
    const selectedRecurringBlock = selectedBlock?.id === blockId && selectedBlock.recurring
      ? selectedBlock
      : null;

    if (selectedRecurringBlock) {
      confirmRecurringEdit('rename');
    }

    updateScheduleBlocks(blocks => blocks.map(block => (
      block.id === blockId ? { ...block, title } : block
    )));
    setSelectedBlock(block => (block?.id === blockId ? { ...block, title } : block));
  }

  function handleLinkAction(blockId: string, action: ScheduleAction | null) {
    const linkedFields = action
      ? { actionId: action.id, sourceKey: action.sourceKey, title: action.title }
      : { actionId: undefined, sourceKey: undefined };

    updateScheduleBlocks(blocks => blocks.map(block => (
      block.id === blockId ? { ...block, ...linkedFields } : block
    )));
    setSelectedBlock(block => (block?.id === blockId ? { ...block, ...linkedFields } : block));
  }

  function handleChangeRecurrence(
    blockId: string,
    recurrence: ScheduleBlock['recurrence'] | null
  ) {
    const recurrenceFields = recurrence
      ? { recurring: true, recurrence }
      : { recurring: false, recurrence: undefined };

    updateScheduleBlocks(blocks => blocks.map(block => (
      block.id === blockId ? { ...block, ...recurrenceFields } : block
    )));
    setSelectedBlock(block => (block?.id === blockId ? { ...block, ...recurrenceFields } : block));
  }

  function handleDeleteBlock(blockId: string) {
    if (selectedBlock?.id === blockId && selectedBlock.recurring) {
      confirmRecurringEdit('delete');
    }

    updateScheduleBlocks(blocks => blocks.filter(block => block.id !== blockId));
    setSelectedBlock(null);
  }

  function confirmRecurringEdit(action: 'rename' | 'resize' | 'delete' | 'move') {
    window.confirm(
      `This is a recurring scheduled event. Apply this ${action} to future events too?`
    );
  }

  function updateScheduleBlocks(updater: (blocks: ScheduleBlock[]) => ScheduleBlock[]) {
    storeUpdateScheduleBlocks(mode, updater);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      // Gentle, edge-only auto-scroll confined to the calendar's own scroll
      // container. Without `canScroll`, dnd-kit also scrolls the app shell and
      // window — which raced the whole page (and triggered pull-to-refresh)
      // when a drag drifted toward the bottom. Low acceleration + a small
      // trigger zone keep the dragged block tracking the finger.
      autoScroll={{
        acceleration: 3,
        threshold: { x: 0, y: 0.1 },
        canScroll: element => element === canvasShellRef.current,
      }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragCancel={() => {
        dragOffsetMinRef.current = 0;
        lastClientPointerRef.current = null;
        lastSchedulePointerRef.current = null;
        setActiveDrag(null);
        setActiveGenericDrag(null);
        setDraggingBlockId(null);
        setTrayState('hidden');
        activeDragDataRef.current = null;
        setDropPreview(null);
      }}
      onDragEnd={handleDragEnd}
    >
      <section className={styles.page}>
        <div className={styles.mainContent}>
          <div className={styles.topBar}>
            <ScheduleDateNavigator
              label={formatDateSelectorLabel(date)}
              previousLabel="Previous day"
              nextLabel="Next day"
              selectedDate={date}
              onPrevious={() => handleDayChange(-1)}
              onNext={() => handleDayChange(1)}
              onSelectDate={nextDate => navigate({
                to: '/schedule',
                search: { date: nextDate, view: mode === 'actual' ? 'sessions' : 'schedule' },
              })}
            />
            {!scheduleFirst ? (
              <ModeToggle mode={mode} onModeChange={handleModeChange} />
            ) : null}
          </div>
          <MiniWeekStrip selectedDate={date} viewParam={mode === 'actual' ? 'sessions' : 'schedule'} />
          <DayCanvas
            mode={mode}
            canvasRef={canvasRef}
            canvasShellRef={canvasShellRef}
            activeBlockLayouts={activeBlockLayouts}
            contextBlockLayouts={contextBlockLayouts}
            selectedBlock={selectedBlock}
            newBlockTitleFocusId={newBlockTitleFocusId}
            draggingBlockId={draggingBlockId}
            dropPreview={dropPreview}
            isPlacing={isPlacing}
            onPlaceAtPointer={handlePlaceAtPointer}
            onSelectBlock={handleOpenBlock}
            onClearSelection={handleClearSelection}
            onRenameBlock={handleRenameBlock}
            onDeleteBlock={handleDeleteBlock}
            onResize={handleResize}
            onResizeEnd={() => {
              resizeStateRef.current = null;
            }}
          />
        </div>
        {isPlacing ? (
          <div className={styles.placingHint} role="status">
            <span className={styles.placingHintText}>
              Tap a time to place <strong>{placingLabel}</strong>
            </span>
            <button
              className={styles.placingHintCancel}
              type="button"
              onClick={() => {
                setPlacingAction(null);
                setPlacingBlockType(null);
                setTrayState('hidden');
              }}
            >
              Cancel
            </button>
          </div>
        ) : null}
        <ScheduleTray
          mode={mode}
          selectedBlock={isMobile ? null : selectedBlock}
          showAdjustInSchedule={false}
          trayState={trayState}
          dragging={isDragging}
          onChangeTrayState={setTrayState}
          onPickAction={isMobile ? handlePickAction : undefined}
          onPickGenericBlock={isMobile ? handlePickGenericBlock : undefined}
          onRenameBlock={handleRenameBlock}
          onLinkAction={handleLinkAction}
          onChangeRecurrence={handleChangeRecurrence}
          onDeleteBlock={handleDeleteBlock}
          onClearSelection={handleClearSelection}
        />
        {!isPlacing && !isDragging && (!isMobile || trayState === 'hidden') ? (
          <FloatingAddBlock
            mode={mode}
            open={addMenuOpen}
            onOpenChange={setAddMenuOpen}
            onAddBlock={handleAddGenericBlock}
            onOpenTray={isMobile ? () => setTrayState('full') : undefined}
          />
        ) : null}
      </section>
      <DragOverlay zIndex={9999} dropAnimation={null} modifiers={[cursorCenteredDragOverlay]}>
        {activeDrag && 'estimateMin' in activeDrag ? (
          <div className={styles.trayDragOverlay}>
            <Typography size="sm" weight="semibold">{activeDrag.title}</Typography>
            <Typography size="xs" color="muted">
              {activeDrag.sourceKey} · {activeDrag.priority} · 1h block
            </Typography>
          </div>
        ) : null}
        {!isMobile && activeDrag && !('estimateMin' in activeDrag) ? (
          <div className={styles.blockDragOverlay}>
            <ScheduleBlockCard
              block={activeDrag}
              layer={mode}
              compact
              allowTiny={false}
              timeFormat="durationAware"
            />
          </div>
        ) : null}
        {activeGenericDrag ? (
          <div className={styles.genericDragOverlay}>
            <Typography size="xs" weight="semibold">{getGenericBlockTitle(activeGenericDrag)}</Typography>
            <Typography size="xs" color="muted">30m</Typography>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function FloatingAddBlock({
  mode,
  open,
  onOpenChange,
  onAddBlock,
  onOpenTray,
}: {
  mode: ScheduleMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddBlock: (type: GenericBlockType) => void;
  onOpenTray?: () => void;
}) {
  const addBlockRef = useRef<HTMLDivElement>(null);
  const isSession = mode === 'actual';
  const types: GenericBlockType[] = isSession
    ? ['session']
    : ['focus', 'research', 'learning', 'buffer', 'break', 'meeting', 'personal'];

  useEffect(() => {
    if (!open) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!addBlockRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [onOpenChange, open]);

  // Mobile: a single, always-labelled button that opens the bottom drawer in
  // one tap. Deliberately not the hover/focus-expand desktop pill — on touch
  // that made the first tap reveal the label and a second tap open the drawer.
  if (onOpenTray) {
    return (
      <button
        className={styles.mobileAddButton}
        type="button"
        aria-label={isSession ? 'Add session' : 'Add event'}
        onClick={onOpenTray}
      >
        <PlusIcon size={20} weight="bold" />
        <span>{isSession ? 'Add session' : 'Add event'}</span>
      </button>
    );
  }

  return (
    <div ref={addBlockRef} className={open ? styles.floatingAddBlockOpen : styles.floatingAddBlock}>
      <div className={styles.floatingAddOptions} aria-label="Add event options" aria-hidden={!open}>
        {onOpenTray ? (
          <button
            className={styles.floatingAddTrayOption}
            type="button"
            disabled={!open}
            onClick={() => {
              onOpenTray();
              onOpenChange(false);
            }}
          >
            <TrayIcon size={15} weight="bold" />
            <span>{isSession ? 'Log sessions' : 'Plan work'}</span>
          </button>
        ) : null}
        {types.map(type => (
          <DraggableAddBlockOption
            key={type}
            type={type}
            disabled={!open}
            onAdd={() => {
              onAddBlock(type);
              onOpenChange(false);
            }}
          />
        ))}
      </div>
      {!open ? (
        <button
          className={styles.floatingAddButton}
          type="button"
          aria-label={isSession ? 'Add session' : 'Add event'}
          aria-expanded={open}
          onClick={() => onOpenChange(true)}
        >
          <PlusIcon size={20} weight="bold" />
          <span>{isSession ? 'Add session' : 'Add event'}</span>
        </button>
      ) : null}
    </div>
  );
}

function DraggableAddBlockOption({
  type,
  disabled,
  onAdd,
}: {
  type: GenericBlockType;
  disabled: boolean;
  onAdd: () => void;
}) {
  const draggableOption = useDraggable({
    id: `generic:${type}`,
    data: { type: 'generic', blockType: type },
    disabled,
  });
  const Icon = getGenericBlockIcon(type);

  return (
    <button
      ref={draggableOption.setNodeRef}
      className={styles.floatingAddOption}
      data-event-type={type}
      type="button"
      disabled={disabled}
      {...draggableOption.attributes}
      {...draggableOption.listeners}
      onClick={event => {
        event.preventDefault();
        onAdd();
      }}
    >
      <Icon size={15} />
      <span>{getGenericBlockTitle(type)}</span>
      <DotsSixVerticalIcon className={styles.floatingAddDragIcon} size={15} weight="bold" />
    </button>
  );
}

type DropPreview = {
  block: ScheduleBlock;
  startMin: number;
  durationMin: number;
};

type ResizeState = {
  blockId: string;
  startMin: number;
  durationMin: number;
};

type DayCanvasProps = {
  mode: ScheduleMode;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  canvasShellRef: React.RefObject<HTMLDivElement | null>;
  activeBlockLayouts: ReturnType<typeof layoutScheduleBlocks>;
  contextBlockLayouts: ReturnType<typeof layoutScheduleBlocks>;
  selectedBlock: SelectedScheduleBlock | null;
  newBlockTitleFocusId: string | null;
  draggingBlockId: string | null;
  dropPreview: DropPreview | null;
  isPlacing: boolean;
  onPlaceAtPointer: (clientX: number, clientY: number) => void;
  onSelectBlock: (block: SelectedScheduleBlock) => void;
  onClearSelection: () => void;
  onRenameBlock: (blockId: string, title: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onResize: (block: ScheduleBlock, edge: 'start' | 'end', pointerDeltaY: number) => void;
  onResizeEnd: () => void;
};

function DayCanvas({
  mode,
  canvasRef,
  canvasShellRef,
  activeBlockLayouts,
  contextBlockLayouts,
  selectedBlock,
  newBlockTitleFocusId,
  draggingBlockId,
  dropPreview,
  isPlacing,
  onPlaceAtPointer,
  onSelectBlock,
  onClearSelection,
  onRenameBlock,
  onDeleteBlock,
  onResize,
  onResizeEnd,
}: DayCanvasProps) {
  const droppable = useDroppable({ id: 'day-canvas' });

  return (
    <div className={styles.layout}>
      <div className={styles.canvasShell} ref={canvasShellRef}>
        <div
          ref={node => {
            canvasRef.current = node;
            droppable.setNodeRef(node);
          }}
          className={[styles.canvas, isPlacing ? styles.canvasPlacing : null]
            .filter(Boolean)
            .join(' ')}
          style={{ '--hour-height': `${HOUR_HEIGHT}px` } as React.CSSProperties}
          onClick={event => {
            if (isPlacing) {
              onPlaceAtPointer(event.clientX, event.clientY);
              return;
            }

            onClearSelection();
          }}
        >
          {HOURS.map(hour => (
            <div key={hour} className={isWorkingHour(hour) ? styles.hourRow : styles.hourRowOff}>
              <div className={styles.hourLabel}>
                <Typography size="xs" color="muted">{formatHourLabel(hour)}</Typography>
              </div>
            </div>
          ))}
          <div className={styles.nowLine} style={{ top: `${CURRENT_TIME_HOUR * HOUR_HEIGHT}px` }} />
          {dropPreview ? (
            <div
              className={styles.dropPreview}
              style={{
                ...blockStyle(dropPreview.startMin, dropPreview.durationMin),
                ...columnStyle(0, 1),
              }}
            >
              <ScheduleBlockCard
                block={{
                  ...dropPreview.block,
                  id: `preview-${dropPreview.block.id}`,
                  date: dropPreview.block.date,
                  startMin: dropPreview.startMin,
                  durationMin: dropPreview.durationMin,
                }}
                layer={mode}
                compact
                timeFormat="durationAware"
                showDuration
              />
            </div>
          ) : null}
          {contextBlockLayouts.map(({ block, column }) => (
            <div
              key={block.id}
              className={styles.contextBlock}
              style={{
                ...contextBlockStyle(block.startMin, block.durationMin, column),
              }}
            >
              <ScheduleGhostBlock block={block} layer={mode === 'plan' ? 'actual' : 'plan'} />
            </div>
          ))}
          {activeBlockLayouts.map(({ block, column, columnCount }) => (
            <div
              key={block.id}
              className={[
                styles.activeBlock,
                block.durationMin <= 15 ? styles.activeBlockMicro : null,
                block.id === draggingBlockId && dropPreview ? styles.activeBlockDragging : null,
              ].filter(Boolean).join(' ') }
              style={{
                ...blockStyle(block.startMin, block.durationMin),
                ...columnStyle(column, columnCount),
              }}
            >
              {!block.fixed ? (
                <button
                  className={styles.deleteBlockButton}
                  type="button"
                  aria-label={`Delete ${block.title}`}
                  onPointerDownCapture={event => {
                    event.stopPropagation();
                  }}
                  onClick={event => {
                    event.preventDefault();
                    event.stopPropagation();
                    onDeleteBlock(block.id);
                  }}
                >
                  <TrashIcon size={13} weight="bold" />
                </button>
              ) : null}
              <ResizeHandle
                disabled={Boolean(block.fixed)}
                edge="start"
                onResizeStart={() => undefined}
                onResize={pointerDeltaY => onResize(block, 'start', pointerDeltaY)}
                onResizeEnd={onResizeEnd}
              />
              <DraggableScheduleBlock
                block={block}
                layer={mode}
                selected={selectedBlock?.id === block.id}
                autoFocusTitle={newBlockTitleFocusId === block.id}
                onSelect={onSelectBlock}
                onRename={onRenameBlock}
              />
              <ResizeHandle
                disabled={Boolean(block.fixed)}
                edge="end"
                onResizeStart={() => undefined}
                onResize={pointerDeltaY => onResize(block, 'end', pointerDeltaY)}
                onResizeEnd={onResizeEnd}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DraggableScheduleBlock({
  block,
  layer,
  selected,
  onSelect,
  autoFocusTitle = false,
  onRename,
}: {
  block: ScheduleBlock;
  layer: ScheduleMode;
  selected: boolean;
  onSelect: (block: SelectedScheduleBlock) => void;
  autoFocusTitle?: boolean;
  onRename: (blockId: string, title: string) => void;
}) {
  const draggableBlock = useDraggable({
    id: `block:${block.id}`,
    data: { type: 'block', block },
    disabled: Boolean(block.fixed),
  });

  return (
    <div
      ref={draggableBlock.setNodeRef}
      className={styles.draggableBlock}
      {...draggableBlock.attributes}
      {...draggableBlock.listeners}
    >
      <ScheduleBlockCard
        block={block}
        layer={layer}
        selected={selected}
        compact
        timeFormat="durationAware"
        showDuration
        autoFocusTitle={autoFocusTitle}
        onSelect={onSelect}
        onRename={onRename}
      />
    </div>
  );
}

function ScheduleGhostBlock({ block, layer }: { block: ScheduleBlock; layer: ScheduleMode }) {
  return (
    <div className={styles.ghostBlock} data-event-type={block.type}>
      <span className={styles.ghostIndicator} aria-label={`Show ${layer} comparison`} />
      <div className={styles.ghostPreview}>
        <div className={styles.ghostPreviewMetaRow}>
          <div className={styles.ghostPreviewMeta}>{layer === 'actual' ? 'Session' : 'Plan'}</div>
          {layer === 'plan' ? (
            <div className={styles.ghostPreviewType}>{formatScheduleEventType(block.type)}</div>
          ) : null}
        </div>
        <div className={styles.ghostPreviewTitle}>{block.title}</div>
        <div className={styles.ghostPreviewTime}>{formatGhostBlockTime(block)}</div>
      </div>
    </div>
  );
}

function formatGhostBlockTime(block: ScheduleBlock) {
  return `${formatTime(block.startMin)}–${formatTime(block.startMin + block.durationMin)}`;
}

function formatScheduleEventType(type: ScheduleBlock['type']) {
  const labels: Record<ScheduleBlock['type'], string> = {
    session: 'Session',
    action: 'Action',
    meeting: 'Meeting',
    break: 'Break',
    focus: 'Focus',
    personal: 'Personal',
    buffer: 'Buffer',
    external: 'External',
    research: 'Research',
    learning: 'Learning',
  };

  return labels[type];
}

function ResizeHandle({
  disabled,
  edge,
  onResizeStart,
  onResize,
  onResizeEnd,
}: {
  disabled: boolean;
  edge: 'start' | 'end';
  onResizeStart: () => void;
  onResize: (pointerDeltaY: number) => void;
  onResizeEnd: () => void;
}) {
  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (disabled) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    event.nativeEvent.stopImmediatePropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    onResizeStart();

    function handlePointerMove(moveEvent: PointerEvent) {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      onResize(moveEvent.clientY - startY);
    }

    function handlePointerUp(moveEvent: PointerEvent) {
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      onResizeEnd();
      window.removeEventListener('pointermove', handlePointerMove, true);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerUp, true);
    }

    window.addEventListener('pointermove', handlePointerMove, true);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerUp, true);
  }

  return (
    <div
      className={[
        disabled ? styles.resizeHandleDisabled : styles.resizeHandle,
        edge === 'start' ? styles.resizeHandleTop : styles.resizeHandleBottom,
      ].join(' ')}
      aria-hidden="true"
      onPointerDownCapture={handlePointerDown}
    />
  );
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(max-width: 1180px)');
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener('change', update);

    return () => query.removeEventListener('change', update);
  }, []);

  return isMobile;
}

function getPointerMinutes(event: Event, canvas: HTMLDivElement) {
  const pointerY = 'clientY' in event && typeof event.clientY === 'number' ? event.clientY : 0;
  const rect = canvas.getBoundingClientRect();
  return ((pointerY - rect.top) / HOUR_HEIGHT) * 60;
}

function getEventPointer(event: Event) {
  return {
    x: 'clientX' in event && typeof event.clientX === 'number' ? event.clientX : 0,
    y: 'clientY' in event && typeof event.clientY === 'number' ? event.clientY : 0,
  };
}

function getDragPointer(event: Event, deltaX: number, deltaY: number) {
  const pointer = getEventPointer(event);

  return {
    x: pointer.x + deltaX,
    y: pointer.y + deltaY,
  };
}

function isPointerInsideElement(pointer: { x: number; y: number }, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return pointer.x >= rect.left && pointer.x <= rect.right && pointer.y >= rect.top && pointer.y <= rect.bottom;
}

function getEventStartMinutes(
  pointer: { x: number; y: number },
  canvas: HTMLDivElement,
  dragOffsetMin: number
) {
  const rect = canvas.getBoundingClientRect();
  return snapMinutes(((pointer.y - rect.top) / HOUR_HEIGHT) * 60 - dragOffsetMin);
}

function parseDateKey(date: string) {
  const [year = 0, month = 1, day = 1] = date.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function addDays(date: Date, dayCount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + dayCount);
  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateSelectorLabel(date: string) {
  return parseDateKey(date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function isWorkingHour(hour: number) {
  return hour >= 8 && hour < 18;
}

// Compact on-the-hour label ("9 AM", "12 PM") — drops the ":00" so the time
// gutter stays narrow and legible beside the layer-comparison indicators.
function formatHourLabel(hour: number) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour} ${period}`;
}

// A hidden <label><input switch></label>; toggling it is the only way to get a
// system haptic on iOS Safari (17.4+), which exposes no Vibration API.
let iosHapticSwitch: HTMLLabelElement | null = null;

function getIosHapticSwitch() {
  if (typeof document === 'undefined') {
    return null;
  }
  if (iosHapticSwitch) {
    return iosHapticSwitch;
  }
  const label = document.createElement('label');
  label.setAttribute('aria-hidden', 'true');
  // Must stay rendered (not display:none) for the toggle to fire a haptic.
  label.style.cssText =
    'position:absolute;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none';
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  label.appendChild(input);
  document.body.appendChild(label);
  iosHapticSwitch = label;
  return label;
}

// Best-effort haptic tick. Uses the Vibration API where available (Android),
// and falls back to the iOS <input switch> toggle. No-ops where neither works.
function triggerHaptic(durationMs: number) {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(durationMs);
  }
  getIosHapticSwitch()?.click();
}

function getGenericBlockDuration(_type: GenericBlockType) {
  return 30;
}

function createGenericBlock(
  type: GenericBlockType,
  date: string,
  mode: ScheduleMode,
  startMin: number
): ScheduleBlock {
  return {
    id: `${mode}-${type}-${date}-${Date.now()}`,
    date,
    title: getGenericBlockTitle(type),
    type,
    startMin,
    durationMin: getGenericBlockDuration(type),
  };
}

function scrollBlockIntoFocus(block: ScheduleBlock, canvasShell: HTMLDivElement | null) {
  if (!canvasShell) {
    return;
  }

  const blockTop = (block.startMin / 60) * HOUR_HEIGHT;
  const scrollTop = Math.max(blockTop - canvasShell.clientHeight * 0.25, 0);

  canvasShell.scrollTo({ top: scrollTop, behavior: 'instant' });
}

function getVisibleCenterStart(canvasShell: HTMLDivElement | null, durationMin: number) {
  if (!canvasShell) {
    return clampStart(DEFAULT_WORKDAY_START_HOUR * 60, durationMin);
  }

  const visibleCenterPx = canvasShell.scrollTop + canvasShell.clientHeight / 2;
  const visibleCenterMin = (visibleCenterPx / HOUR_HEIGHT) * 60;

  return clampStart(snapMinutes(visibleCenterMin - durationMin / 2), durationMin);
}

function snapMinutes(minutes: number) {
  return Math.max(0, Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES);
}

function snapDeltaMinutes(minutes: number) {
  return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

function clampStart(startMin: number, durationMin: number) {
  return Math.min(Math.max(0, startMin), 24 * 60 - durationMin);
}

function blockStyle(startMin: number, durationMin: number) {
  return {
    top: `calc(${(startMin / 60) * HOUR_HEIGHT}px + 2px)`,
    height: `calc(${(durationMin / 60) * HOUR_HEIGHT}px - 4px)`,
  };
}

function contextBlockStyle(startMin: number, durationMin: number, column: number) {
  return {
    ...blockStyle(startMin, durationMin),
    '--ghost-column': column,
  } as React.CSSProperties;
}

function columnStyle(column: number, columnCount: number) {
  const gutter = 6;
  const widthExpression =
    `calc((100% - var(--lane-left) - var(--lane-right) - ${(columnCount - 1) * gutter}px) / ${columnCount})`;

  return {
    left: `calc(var(--lane-left) + (${widthExpression} + ${gutter}px) * ${column})`,
    width: widthExpression,
  };
}

function layoutScheduleBlocks(blocks: ScheduleBlock[]) {
  const sortedBlocks = [...blocks].sort((left, right) => left.startMin - right.startMin);
  const groups: ScheduleBlock[][] = [];

  sortedBlocks.forEach(block => {
    const startMin = block.startMin;
    const lastGroup = groups.at(-1);
    const lastGroupEndMin = lastGroup
      ? Math.max(...lastGroup.map(item => item.startMin + item.durationMin))
      : 0;

    if (!lastGroup || startMin >= lastGroupEndMin) {
      groups.push([block]);
      return;
    }

    lastGroup.push(block);
  });

  return groups.flatMap(group => {
    const columnEndTimes: number[] = [];
    const layouts = group.map(block => {
      const startMin = block.startMin;
      const reusableColumn = columnEndTimes.findIndex(endMin => endMin <= startMin);
      const column = reusableColumn === -1 ? columnEndTimes.length : reusableColumn;

      columnEndTimes[column] = startMin + block.durationMin;

      return { block, column };
    });
    const columnCount = Math.max(columnEndTimes.length, 1);

    return layouts.map(layout => ({ ...layout, columnCount }));
  });
}
