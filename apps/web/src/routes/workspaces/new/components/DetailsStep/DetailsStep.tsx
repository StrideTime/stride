import { BriefcaseIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { Badge, TextInput, Typography } from '@stride/ui';

import styles from '../../NewWorkspacePage.module.css';

type DetailsStepProps = {
  name: string;
  onNameChange: (value: string) => void;
};

export function DetailsStep({ name, onNameChange }: DetailsStepProps) {
  return (
    <section className={styles.step}>
      <div className={styles.stepHead}>
        <Typography as="h1" size="2xl" weight="bold">
          Name your workspace
        </Typography>
        <Typography as="p" size="base" color="muted">
          A workspace is the home for one organization&apos;s teams, sources, and work. You can rename it later.
        </Typography>
      </div>

      <div className={styles.field}>
        <Typography as="label" size="sm" weight="semibold" className={styles.fieldLabel}>
          Workspace name
        </Typography>
        <TextInput
          leading={<BriefcaseIcon size={16} weight="bold" aria-hidden="true" />}
          placeholder="Workspace name"
          value={name}
          onChange={event => onNameChange(event.target.value)}
          autoFocus
        />
        <Typography as="p" size="xs" color="muted" className={styles.fieldHint}>
          Use the name your team would recognize.
        </Typography>
      </div>

      <div className={styles.previewCard}>
        <span className={styles.previewMark}>{(name.trim()[0] ?? 'W').toUpperCase()}</span>
        <div className={styles.previewCopy}>
          <Typography size="sm" weight="semibold">
            {name.trim() || 'Your workspace'}
          </Typography>
          <Typography size="xs" color="muted">
            You&apos;ll be the workspace admin
          </Typography>
        </div>
        <Badge variant="accent" leading={<CheckCircleIcon size={12} weight="fill" aria-hidden="true" />}>
          Owner
        </Badge>
      </div>
    </section>
  );
}
