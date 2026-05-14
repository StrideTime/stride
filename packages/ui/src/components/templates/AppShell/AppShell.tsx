import { Link, Outlet } from '@tanstack/react-router';

import { Typography } from '../../atoms';
import styles from './AppShell.module.css';

type NavItem = {
  to: string;
  label: string;
  icon: string;
  badge?: number;
  children?: Array<{ href: string; label: string }>;
};

const navItems: NavItem[] = [
  { to: '/', label: 'Today', icon: '✓' },
  { to: '/inbox', label: 'Inbox', icon: '↓', badge: 3 },
  {
    to: '/backlog/specs',
    label: 'Backlog',
    icon: '□',
    badge: 7,
    children: [
      { href: '/backlog/specs', label: 'Specs' },
      { href: '/backlog/actions', label: 'Actions' },
    ],
  },
  { to: '/schedule', label: 'Schedule', icon: '◷' },
  { to: '/insights', label: 'Insights', icon: '⌁' },
];

export function AppShell() {
  return (
    <div className={styles.shell}>
      <aside className={styles.rail}>
        <div className={styles.workspaceButton}>
          <div className={styles.workspaceMark}>S</div>
          <div className={styles.workspaceCopy}>
            <Typography size="sm" weight="semibold" color="inverse">Stride</Typography>
            <Typography size="xs" color="muted">Acme · Platform</Typography>
          </div>
          <Typography size="xs" color="muted">⌄</Typography>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          {navItems.map(item => (
            <div key={item.to} className={styles.navGroup}>
              <Link
                to={item.to}
                className={styles.navItem}
                activeProps={{ className: `${styles.navItem} ${styles.active}` }}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <Typography size="sm" weight="medium" color="inverse">{item.label}</Typography>
                {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
              </Link>
              {item.children ? (
                <div className={styles.subNav}>
                  {item.children.map(child => (
                    <Link
                      key={child.href}
                      to={child.href}
                      className={styles.subNavItem}
                      activeProps={{ className: `${styles.subNavItem} ${styles.subNavActive}` }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>

        <div className={styles.sessionMini}>
          <div className={styles.sessionDot} />
          <div className={styles.sessionCopy}>
            <Typography size="xs" weight="bold" color="accent">Session ready</Typography>
            <Typography size="xs" color="muted">No active timer</Typography>
          </div>
        </div>

        <Link to="/settings" className={styles.settingsLink}>
          <span className={styles.navIcon}>⚙</span>
          <Typography size="sm" weight="medium" color="inverse">Settings</Typography>
        </Link>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
