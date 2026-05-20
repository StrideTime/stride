import { createFileRoute } from '@tanstack/react-router';

import { SettingsView, type SettingsSectionId } from '../../components/settings';

const settingsSectionIds = [
  'my-workspace',
  'my-calendar',
  'my-notifications',
  'my-time-budgets',
  'my-event-types',
  'account',
  'appearance',
  'personal-connections',
  'privacy',
  'workspace-general',
  'workspace-connections',
  'workspace-members',
  'team-general',
  'team-members',
  'team-source',
] as const satisfies SettingsSectionId[];

type SettingsSearch = {
  section?: SettingsSectionId;
};

function isSettingsSection(value: unknown): value is SettingsSectionId {
  return typeof value === 'string' && settingsSectionIds.includes(value as SettingsSectionId);
}

export const Route = createFileRoute('/_auth/settings')({
  validateSearch: (search: Record<string, unknown>): SettingsSearch => ({
    section: isSettingsSection(search.section) ? search.section : undefined,
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { section } = Route.useSearch();

  return <SettingsView section={section ?? 'my-workspace'} />;
}
