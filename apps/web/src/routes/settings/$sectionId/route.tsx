import { createFileRoute } from '@tanstack/react-router';

import { SettingsView, type SettingsSectionId } from '../../../components/settings';

const settingsSectionIds = [
  'my-workspace',
  'my-calendar',
  'my-notifications',
  'account',
  'appearance',
  'my-statuses',
  'your-data',
  'workspace-general',
  'workspace-connections',
  'workspace-members',
  'team-general',
  'team-members',
  'team-source',
] as const satisfies SettingsSectionId[];

function isSettingsSection(value: unknown): value is SettingsSectionId {
  return typeof value === 'string' && settingsSectionIds.includes(value as SettingsSectionId);
}

export const Route = createFileRoute('/settings/$sectionId')({
  component: SettingsSectionPage,
});

function SettingsSectionPage() {
  const { sectionId } = Route.useParams();
  return <SettingsView section={isSettingsSection(sectionId) ? sectionId : 'my-workspace'} />;
}
