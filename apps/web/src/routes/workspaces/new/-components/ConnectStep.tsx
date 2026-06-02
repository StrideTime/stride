import { Buildings, CheckCircle, Plus } from '@phosphor-icons/react';
import { Typography } from '@stride/ui';

import { workspaceSourceOptions } from '../-workspaceCreation.mock';
import styles from '../NewWorkspacePage.module.css';

type ConnectStepProps = {
  sourceId: string | null;
  onSelect: (value: string | null) => void;
  workspaceName: string;
};

export function ConnectStep({ sourceId, onSelect, workspaceName }: ConnectStepProps) {
  return (
    <section className={styles.step}>
      <div className={styles.stepHead}>
        <Typography as="h1" size="2xl" weight="bold">
          Connect a source
        </Typography>
        <Typography as="p" size="base" color="muted">
          Stride pulls work from where your team already tracks it. Connect one now to seed {workspaceName}, or skip
          and add it later.
        </Typography>
      </div>

      <div className={styles.sourceList}>
        {workspaceSourceOptions.map(source => {
          const selected = source.id === sourceId;

          return (
            <button
              className={`${styles.sourceCard} ${selected ? styles.sourceSelected : ''}`}
              key={source.id}
              onClick={() => onSelect(selected ? null : source.id)}
              type="button"
              aria-pressed={selected}
            >
              <span className={styles.sourceMark}>{source.mark}</span>
              <span className={styles.sourceCopy}>
                <Typography size="sm" weight="semibold">
                  {source.name}
                </Typography>
                <Typography size="xs" color="muted">
                  {source.description}
                </Typography>
              </span>
              <span className={styles.sourceCheck}>
                {selected ? <CheckCircle size={18} weight="fill" /> : <Plus size={16} weight="bold" />}
              </span>
            </button>
          );
        })}
      </div>

      <button className={styles.skipLink} onClick={() => onSelect(null)} type="button">
        <Buildings size={14} weight="bold" aria-hidden="true" />
        I&apos;ll connect a source later
      </button>
    </section>
  );
}
