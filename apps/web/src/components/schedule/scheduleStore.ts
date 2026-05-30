import { useSyncExternalStore } from 'react';

import {
  actualBlocks,
  plannedBlocks,
  type ScheduleBlock,
  type ScheduleMode,
} from './schedule.mock';

type ScheduleState = {
  plan: ScheduleBlock[];
  actual: ScheduleBlock[];
};

let state: ScheduleState = {
  plan: plannedBlocks,
  actual: actualBlocks,
};

const listeners = new Set<() => void>();

function getState() {
  return state;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function updateScheduleBlocks(
  mode: ScheduleMode,
  updater: (blocks: ScheduleBlock[]) => ScheduleBlock[]
) {
  state = mode === 'plan'
    ? { ...state, plan: updater(state.plan) }
    : { ...state, actual: updater(state.actual) };
  listeners.forEach(listener => listener());
}

export function getBlockById(blockId: string): { block: ScheduleBlock; layer: ScheduleMode } | null {
  const planBlock = state.plan.find(block => block.id === blockId);
  if (planBlock) {
    return { block: planBlock, layer: 'plan' };
  }

  const actualBlock = state.actual.find(block => block.id === blockId);
  if (actualBlock) {
    return { block: actualBlock, layer: 'actual' };
  }

  return null;
}

export function useScheduleState() {
  return useSyncExternalStore(subscribe, getState, getState);
}
