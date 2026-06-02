import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Plus, X } from '@phosphor-icons/react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Button, Typography } from '@stride/ui';

import { ConnectStep, DetailsStep, PlanStep } from './-components';
import {
  stepLabels,
  workspaceCreationSteps,
  type BillingCycle,
  type PlanId,
} from './-workspaceCreation.mock';
import styles from './NewWorkspacePage.module.css';

export const Route = createFileRoute('/workspaces/new')({
  component: NewWorkspacePage,
});

function NewWorkspacePage() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState('');
  const [billing, setBilling] = useState<BillingCycle>('annual');
  const [planId, setPlanId] = useState<PlanId>('team');
  const [sourceId, setSourceId] = useState<string | null>(null);

  const step = workspaceCreationSteps[stepIndex]!;
  const isFirst = stepIndex === 0;
  const isLast = stepIndex === workspaceCreationSteps.length - 1;
  const canContinue = step === 'details' ? name.trim().length > 0 : true;

  const goNext = () => {
    if (isLast) {
      navigate({ to: '/' });
      return;
    }
    setStepIndex(index => Math.min(index + 1, workspaceCreationSteps.length - 1));
  };

  const goBack = () => setStepIndex(index => Math.max(index - 1, 0));

  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>S</span>
          <Typography size="sm" weight="semibold">
            New workspace
          </Typography>
        </div>

        <ol className={styles.steps}>
          {workspaceCreationSteps.map((item, index) => {
            const state = index < stepIndex ? 'done' : index === stepIndex ? 'current' : 'upcoming';

            return (
              <li className={`${styles.stepItem} ${styles[state]}`} key={item}>
                <span className={styles.stepDot}>
                  {state === 'done' ? <Check size={11} weight="bold" aria-hidden="true" /> : index + 1}
                </span>
                <span className={styles.stepLabel}>{stepLabels[item]}</span>
              </li>
            );
          })}
        </ol>

        <Link to="/" className={styles.closeLink} aria-label="Cancel workspace creation">
          <X size={16} weight="bold" aria-hidden="true" />
        </Link>
      </header>

      <div className={styles.body}>
        {step === 'details' ? <DetailsStep name={name} onNameChange={setName} /> : null}
        {step === 'plan' ? (
          <PlanStep
            billing={billing}
            onBillingChange={setBilling}
            planId={planId}
            onPlanChange={setPlanId}
          />
        ) : null}
        {step === 'connect' ? (
          <ConnectStep
            sourceId={sourceId}
            onSelect={setSourceId}
            workspaceName={name.trim() || 'your workspace'}
          />
        ) : null}
      </div>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          {isFirst ? (
            <Link to="/" className={styles.footerBack}>
              <ArrowLeft size={14} weight="bold" aria-hidden="true" />
              Cancel
            </Link>
          ) : (
            <button className={styles.footerBack} onClick={goBack} type="button">
              <ArrowLeft size={14} weight="bold" aria-hidden="true" />
              Back
            </button>
          )}

          <Button
            variant="primary"
            disabled={!canContinue}
            onClick={goNext}
            icon={isLast ? <Plus size={15} weight="bold" /> : <ArrowRight size={15} weight="bold" />}
          >
            {isLast ? 'Create workspace' : 'Continue'}
          </Button>
        </div>
      </footer>
    </main>
  );
}
