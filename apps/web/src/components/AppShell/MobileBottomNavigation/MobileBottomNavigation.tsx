import { Link } from '@tanstack/react-router';

import { navItems } from '../AppShell.data';
import type { AppShellText } from '../AppShell.types';
import styles from '../AppShell.module.css';

type MobileBottomNavigationProps = {
  text: AppShellText;
};

export function MobileBottomNavigation({ text }: MobileBottomNavigationProps) {
  return (
    <nav className={styles.mobileNav} aria-label={text.primaryNavAria}>
      {navItems.map(item => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={styles.mobileNavItem}
            activeProps={{ className: `${styles.mobileNavItem} ${styles.mobileNavActive}` }}
            activeOptions={{ exact: !item.children }}
          >
            <span className={styles.mobileNavIcon}>
              <Icon size={19} weight="bold" aria-hidden="true" />
              {item.badge ? <span className={styles.mobileBadge}>{item.badge}</span> : null}
            </span>
            <span className={styles.mobileNavLabel}>{text.nav[item.labelKey] ?? item.labelKey}</span>
          </Link>
        );
      })}
    </nav>
  );
}
