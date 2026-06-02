import { CheckIcon, CheckCircleIcon } from '@phosphor-icons/react';
import { Typography } from '@stride/ui';

import { workspacePlans, type BillingCycle, type PlanId } from '../../-workspaceCreation.mock';
import styles from '../../NewWorkspacePage.module.css';

type PlanStepProps = {
  billing: BillingCycle;
  onBillingChange: (value: BillingCycle) => void;
  planId: PlanId;
  onPlanChange: (value: PlanId) => void;
};

export function PlanStep({ billing, onBillingChange, planId, onPlanChange }: PlanStepProps) {
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
                  {selected ? <CheckCircleIcon size={20} weight="fill" /> : null}
                </span>
              </div>
              <Typography as="p" size="sm" color="muted" className={styles.planTagline}>
                {plan.tagline}
              </Typography>
              <div className={styles.planPrice}>
                {price === null ? (
                  <span className={styles.planPriceValue}>Custom</span>
                ) : (
                  <span className={styles.planPriceValue}>${price}</span>
                )}
                <span className={styles.planPriceSuffix}>{plan.priceSuffix}</span>
              </div>
              <ul className={styles.planFeatures}>
                {plan.features.map(feature => (
                  <li key={feature}>
                    <CheckIcon size={14} weight="bold" aria-hidden="true" />
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
