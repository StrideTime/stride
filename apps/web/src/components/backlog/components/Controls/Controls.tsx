import { useTranslation } from 'react-i18next';

import { ModeButton } from '../ModeButton/ModeButton';
import type { ControlsProps } from './Controls.type';
import { getModes } from './utils/getModes';
import styles from './Controls.module.css';

export function Controls({
  surface,
  activeView,
  onViewChange,
}: ControlsProps) {
  const { t } = useTranslation();
  const modes = getModes(surface, t);

  return (
    <div className={styles.controlStack}>
      <div className={styles.navUseCases}>
        <div className={styles.modes}>
          {modes.map(item => (
            <ModeButton
              key={item.view}
              view={item.view}
              activeView={activeView}
              onViewChange={onViewChange}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
