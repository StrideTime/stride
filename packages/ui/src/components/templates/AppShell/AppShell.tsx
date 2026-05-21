import {
  CaretDown,
  CheckCircle,
  ClockCountdown,
  Gear,
  House,
  ListBullets,
  SquaresFour,
  Tray,
} from '@phosphor-icons/react';
import { Link, Outlet, useRouterState } from '@tanstack/react-router';

import { Popover, Typography } from '../../atoms';
import styles from './AppShell.module.css';

type NavItem = {
  to: string;
  label: string;
  icon: typeof House;
  badge?: number;
  children?: Array<{ href: string; label: string; icon: typeof House }>;
};

type StatusOption = {
  label: string;
  tone: 'online' | 'focus' | 'away';
};

const navItems: NavItem[] = [
  { to: '/', label: 'Today', icon: House },
  { to: '/inbox', label: 'Inbox', icon: Tray, badge: 3 },
  {
    to: '/backlog/specs',
    label: 'Backlog',
    icon: SquaresFour,
    badge: 7,
    children: [
      { href: '/backlog/specs', label: 'Specs', icon: SquaresFour },
      { href: '/backlog/actions', label: 'Actions', icon: ListBullets },
    ],
  },
  { to: '/schedule', label: 'Schedule', icon: ClockCountdown },
];

const statusOptions: StatusOption[] = [
  { label: 'Available', tone: 'online' },
  { label: 'In focus mode', tone: 'focus' },
  { label: 'Away', tone: 'away' },
];

export function AppShell() {
  const pathname = useRouterState({ select: state => state.location.pathname });
  const isSettings = pathname === '/settings';

  return (
    <div className={styles.shell}>
      {!isSettings ? (
        <header className={styles.mobileHeader}>
          <Popover
            trigger={(
              <>
                <div className={styles.scopeMark}>S</div>
                <div className={styles.scopeCopy}>
                  <Typography size="sm" weight="semibold" color="inverse">Stride</Typography>
                  <span className={styles.mobileScopeTeam}>Platform</span>
                </div>
                <CaretDown size={14} className={styles.caretIcon} aria-hidden="true" />
              </>
            )}
            triggerClassName={styles.mobileScopeTrigger}
            popupClassName={styles.menuPanel}
          >
            <div className={styles.menuSection}>
              <button className={`${styles.menuItem} ${styles.workspaceItemSelected}`} type="button">
                <span>
                  <span className={styles.menuItemTitle}>Stride</span>
                  <span className={styles.menuItemMeta}>Acme</span>
                </span>
              </button>
              <button className={`${styles.menuItem} ${styles.teamItemSelected}`} type="button">
                <span className={styles.menuItemTitle}>Platform</span>
              </button>
            </div>
          </Popover>

          <Link to="/settings" className={styles.mobileSettingsButton} aria-label="Open settings">
            <Gear size={18} weight="bold" aria-hidden="true" />
          </Link>
        </header>
      ) : null}

      {!isSettings ? (
        <aside className={styles.rail}>
        <Popover
          trigger={(
            <>
              <div className={styles.scopeMark}>S</div>
              <div className={styles.scopeCopy}>
                <Typography size="sm" weight="semibold" color="inverse">Stride</Typography>
                <div className={styles.scopeBranch}>
                  <span className={styles.scopeBranchLine} aria-hidden="true" />
                  <div className={styles.scopeTeamRow}>
                    <span className={styles.scopeBadge}>Platform</span>
                  </div>
                </div>
              </div>
              <CaretDown size={14} className={styles.caretIcon} aria-hidden="true" />
            </>
          )}
          triggerClassName={styles.scopeTrigger}
          popupClassName={styles.menuPanel}
        >
          <div className={styles.menuSection}>
            <div className={styles.scopeGroup}>
              <button className={`${styles.menuItem} ${styles.workspaceItemSelected}`} type="button">
                <span>
                  <span className={styles.menuItemTitle}>Stride</span>
                  <span className={styles.menuItemMeta}>Acme</span>
                </span>
              </button>
              <div className={styles.scopeNestedList}>
                <Typography className={styles.scopeEyebrow} size="xs" weight="semibold" color="muted">TEAMS</Typography>
                <button className={`${styles.menuItem} ${styles.scopeNestedItem} ${styles.teamItemSelected}`} type="button">
                  <span className={styles.menuItemTitle}>Platform</span>
                </button>
                <button className={`${styles.menuItem} ${styles.scopeNestedItem}`} type="button">
                  <span className={styles.menuItemTitle}>App</span>
                </button>
                <button className={`${styles.menuItem} ${styles.scopeNestedItem}`} type="button">
                  <span className={styles.menuItemTitle}>All teams</span>
                </button>
              </div>
            </div>
            <div className={styles.scopeGroup}>
              <button className={styles.menuItem} type="button">
                <span className={styles.menuItemTitle}>Orbit</span>
                <span className={styles.menuItemMeta}>Product</span>
              </button>
            </div>
          </div>
        </Popover>

        <nav className={styles.nav} aria-label="Primary">
          {navItems.map(item => {
            const Icon = item.icon;

            return (
              <div key={item.to} className={styles.navGroup}>
                <Link
                  to={item.to}
                  className={styles.navItem}
                  activeProps={item.children ? undefined : { className: `${styles.navItem} ${styles.active}` }}
                  activeOptions={{ exact: !item.children }}
                >
                  <span className={styles.navIcon}>
                    <Icon size={16} weight="bold" aria-hidden="true" />
                  </span>
                  <Typography size="sm" weight="medium" color="inverse">{item.label}</Typography>
                  {item.badge ? <span className={styles.badge}>{item.badge}</span> : null}
                </Link>
                {item.children ? (
                  <div className={styles.subNav}>
                    {item.children.map(child => {
                      const ChildIcon = child.icon;

                      return (
                        <Link
                          key={child.href}
                          to={child.href}
                          className={styles.subNavItem}
                          activeProps={{ className: `${styles.subNavItem} ${styles.subNavActive}` }}
                          activeOptions={{ exact: true }}
                        >
                          <span className={styles.subNavIcon}>
                            <ChildIcon size={14} weight="bold" aria-hidden="true" />
                          </span>
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className={styles.accountCard}>
          <Popover
            side="top"
            trigger={(
              <>
                <div className={styles.profileAvatar}>J</div>
                <div className={styles.profileCopy}>
                  <Typography size="sm" weight="semibold" color="inverse">Jaren Lee</Typography>
                  <span className={styles.statusLine}>
                    <span className={`${styles.statusDot} ${styles.online}`} aria-hidden="true" />
                    <Typography size="xs" color="muted">Available</Typography>
                  </span>
                </div>
                <CaretDown size={14} className={styles.caretIcon} aria-hidden="true" />
              </>
            )}
            triggerClassName={styles.profileCard}
            popupClassName={styles.menuPanel}
          >
            <div className={styles.menuSection}>
              {statusOptions.map(option => (
                <button key={option.label} className={styles.menuItem} type="button">
                  <span className={styles.statusLine}>
                    <span className={`${styles.statusDot} ${styles[option.tone]}`} aria-hidden="true" />
                    <span className={styles.menuItemTitle}>{option.label}</span>
                  </span>
                  {option.tone === 'online' ? <CheckCircle size={14} weight="bold" aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
          </Popover>

          <Link to="/settings" className={styles.settingsButton} aria-label="Open settings">
            <Gear size={18} weight="bold" aria-hidden="true" />
          </Link>
        </div>
        </aside>
      ) : null}

      <main className={styles.main}>
        <Outlet />
      </main>

      {!isSettings ? (
        <nav className={styles.mobileNav} aria-label="Primary">
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
                <Icon size={19} weight="bold" aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge ? <span className={styles.mobileBadge}>{item.badge}</span> : null}
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
