import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Buildings,
  Check,
  CheckCircle,
  Plus,
  X,
} from '@phosphor-icons/react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Badge, Button, TextInput, Typography } from '@stride/ui';

import {
  stepLabels,
  workspaceCreationSteps,
  workspacePlans,
  workspaceSourceOptions,
  type BillingCycle,
  type PlanId,
} from './workspaces.new.mock';
import styles from './workspaces.new.module.css';

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
        {step === 'details' ? (
          <DetailsStep name={name} onNameChange={setName} />
        ) : null}
        {step === 'plan' ? (
          <PlanStep billing={billing} onBillingChange={setBilling} planId={planId} onPlanChange={setPlanId} />
        ) : null}
        {step === 'connect' ? (
          <ConnectStep sourceId={sourceId} onSelect={setSourceId} workspaceName={name.trim() || 'your workspace'} />
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

type DetailsStepProps = {
  name: string;
  onNameChange: (value: string) => void;
};

function DetailsStep({ name, onNameChange }: DetailsStepProps) {
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
          leading={<Briefcase size={16} weight="bold" aria-hidden="true" />}
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
        <Badge variant="accent" leading={<CheckCircle size={12} weight="fill" aria-hidden="true" />}>
          Owner
        </Badge>
      </div>
    </section>
  );
}

type PlanStepProps = {
  billing: BillingCycle;
  onBillingChange: (value: BillingCycle) => void;
  planId: PlanId;
  onPlanChange: (value: PlanId) => void;
};

function PlanStep({ billing, onBillingChange, planId, onPlanChange }: PlanStepProps) {
  return (
    <section className={`${styles.step} ${styles.stepWide}`}>
      <div className={styles.stepHead}>
        <Typography as="h1" size="2xl" weight="bold">
          Choose a plan
        </Typography>
        <Typography as="p" size="base" color="muted">
          Start free and upgrade when your team grows. Billing isn&apos;t live yet — this is a preview of how plans
          will look.
        </Typography>
      </div>

      <div className={styles.billingToggle} role="group" aria-label="Billing cycle">
        <button
          className={`${styles.billingOption} ${billing === 'monthly' ? styles.billingActive : ''}`}
          onClick={() => onBillingChange('monthly')}
          type="button"
        >
          Monthly
        </button>
        <button
          className={`${styles.billingOption} ${billing === 'annual' ? styles.billingActive : ''}`}
          onClick={() => onBillingChange('annual')}
          type="button"
        >
          Annual
          <span className={styles.billingSave}>Save ~20%</span>
        </button>
      </div>

      <div className={styles.planGrid}>
        {workspacePlans.map(plan => {
          const price = billing === 'annual' ? plan.annual : plan.monthly;
          const selected = plan.id === planId;

          return (
            <button
              className={`${styles.planCard} ${selected ? styles.planSelected : ''}`}
              key={plan.id}
              onClick={() => onPlanChange(plan.id)}
              type="button"
              aria-pressed={selected}
            >
              {plan.recommended ? <span className={styles.planRibbon}>Recommended</span> : null}
              <div className={styles.planTop}>
                <Typography size="base" weight="bold">
                  {plan.name}
                </Typography>
                <span className={styles.planCheck} aria-hidden={!selected}>
                  {selected ? <CheckCircle size={20} weight="fill" /> : null}
                </span>
              </div>
              <Typography as="p" size="sm" color="muted" className={styles.planTagline}>
                {plan.tagline}
              </Typography>
              <div className={styles.planPrice}>
                {price === null ? (
                  <span className={styles.planPriceValue}>Custom</span>
                ) : (
                  <>
                    <span className={styles.planPriceValue}>${price}</span>
                  </>
                )}
                <span className={styles.planPriceSuffix}>{plan.priceSuffix}</span>
              </div>
              <ul className={styles.planFeatures}>
                {plan.features.map(feature => (
                  <li key={feature}>
                    <Check size={14} weight="bold" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          );
        })}
      </div>
    </section>
  );
}

type ConnectStepProps = {
  sourceId: string | null;
  onSelect: (value: string | null) => void;
  workspaceName: string;
};

function ConnectStep({ sourceId, onSelect, workspaceName }: ConnectStepProps) {
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
