import { useMemo, useState } from 'react';
import { CaretLeft, CaretRight, CheckCircle, MagnifyingGlass } from '@phosphor-icons/react';
import { Badge, Button, Typography } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import { ToggleRow } from './ToggleRow';
import {
  CATEGORY_LABEL_KEY,
  DATA_CATEGORIES,
  DataTable,
  FeelingTag,
  GuaranteeNote,
  PAGE_SIZE,
  formatDuration,
  formatWhen,
  type DataCategory,
  type DataTableRow,
} from './yourData';
import styles from '../SettingsView.module.css';
import { captureRecords, checkInRecords, sessionRecords } from '../yourData.mock';

export function YourDataSection() {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState(sessionRecords);
  const [checkins, setCheckins] = useState(checkInRecords);
  const [captures, setCaptures] = useState(captureRecords);
  const [category, setCategory] = useState<DataCategory>('sessions');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [exportState, setExportState] = useState<'idle' | 'working' | 'done'>('idle');

  const counts: Record<DataCategory, number> = {
    sessions: sessions.length,
    checkins: checkins.length,
    captures: captures.length,
  };
  const normalizedQuery = query.trim().toLowerCase();

  const allRows = useMemo<DataTableRow[]>(() => {
    if (category === 'sessions') {
      return sessions
        .filter(record =>
          normalizedQuery === '' ||
          record.actionTitle.toLowerCase().includes(normalizedQuery) ||
          (record.specKey?.toLowerCase().includes(normalizedQuery) ?? false)
        )
        .map(record => ({
          id: record.id,
          deleteLabel: t('settings.yourData.delete.sessionAria', { title: record.actionTitle }),
          confirmText: t('settings.yourData.delete.sessionConfirm'),
          cells: [
            <Typography key="when" as="span" size="sm" color="muted">
              {formatWhen(record.at)}
            </Typography>,
            <span key="action" className={styles.titleCell}>
              <Typography as="span" size="sm" weight="semibold" className={styles.truncate}>
                {record.actionTitle}
              </Typography>
              {record.specKey ? (
                <span className={styles.specKey}>{record.specKey}</span>
              ) : (
                <Typography as="span" size="xs" color="muted">
                  {t('settings.yourData.personal')}
                </Typography>
              )}
            </span>,
            <Typography key="duration" as="span" size="sm">
              {formatDuration(record.durationMin)}
            </Typography>,
            <FeelingTag key="felt" feeling={record.feeling} />,
          ],
        }));
    }
    if (category === 'checkins') {
      return checkins
        .filter(record =>
          normalizedQuery === '' ||
          record.note.toLowerCase().includes(normalizedQuery) ||
          record.onAction.toLowerCase().includes(normalizedQuery)
        )
        .map(record => ({
          id: record.id,
          deleteLabel: t('settings.yourData.delete.checkinAria', { when: formatWhen(record.at) }),
          confirmText: t('settings.yourData.delete.checkinConfirm'),
          cells: [
            <Typography key="when" as="span" size="sm" color="muted">
              {formatWhen(record.at)}
            </Typography>,
            <FeelingTag key="felt" feeling={record.feeling} />,
            <span key="note" className={styles.noteCell}>
              <Typography as="span" size="sm" className={styles.truncate}>
                {record.note === '' ? t('settings.yourData.noNote') : record.note}
              </Typography>
              <Typography as="span" size="xs" color="muted" className={styles.truncate}>
                {t('settings.yourData.onAction', { action: record.onAction })}
              </Typography>
            </span>,
          ],
        }));
    }
    return captures
      .filter(record =>
        normalizedQuery === '' ||
        record.text.toLowerCase().includes(normalizedQuery) ||
        record.kind.toLowerCase().includes(normalizedQuery)
      )
      .map(record => ({
        id: record.id,
        deleteLabel: t('settings.yourData.delete.captureAria', { when: formatWhen(record.at) }),
        confirmText: t('settings.yourData.delete.captureConfirm'),
        cells: [
          <Typography key="when" as="span" size="sm" color="muted">
            {formatWhen(record.at)}
          </Typography>,
          <Badge key="kind" variant={record.kind === 'Insight' ? 'accent' : 'neutral'}>
            {record.kind}
          </Badge>,
          <Typography key="text" as="span" size="sm" className={styles.truncate}>
            {record.text}
          </Typography>,
        ],
      }));
  }, [category, sessions, checkins, captures, normalizedQuery, t]);

  const pageCount = Math.max(1, Math.ceil(allRows.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const visibleRows = allRows.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = allRows.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = safePage * PAGE_SIZE + visibleRows.length;

  const selectCategory = (next: DataCategory) => {
    setCategory(next);
    setQuery('');
    setPage(0);
    setConfirmId(null);
  };

  const updateQuery = (next: string) => {
    setQuery(next);
    setPage(0);
    setConfirmId(null);
  };

  const deleteRow = (id: string) => {
    if (category === 'sessions') setSessions(rows => rows.filter(record => record.id !== id));
    else if (category === 'checkins') setCheckins(rows => rows.filter(record => record.id !== id));
    else setCaptures(rows => rows.filter(record => record.id !== id));
  };

  const exportData = () => {
    if (exportState === 'working') return;
    setExportState('working');
    window.setTimeout(() => {
      const payload = JSON.stringify({ sessions, checkins, captures }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'stride-privacy-and-data.json';
      link.click();
      URL.revokeObjectURL(url);
      setExportState('done');
    }, 850);
  };

  const columnsByCategory: Record<DataCategory, string[]> = {
    sessions: [
      t('settings.yourData.columns.when'),
      t('settings.yourData.columns.action'),
      t('settings.yourData.columns.duration'),
      t('settings.yourData.columns.felt'),
    ],
    checkins: [
      t('settings.yourData.columns.when'),
      t('settings.yourData.columns.felt'),
      t('settings.yourData.columns.note'),
    ],
    captures: [
      t('settings.yourData.columns.when'),
      t('settings.yourData.columns.kind'),
      t('settings.yourData.columns.note'),
    ],
  };
  const emptyByCategory: Record<DataCategory, [string, string]> = {
    sessions: [t('settings.yourData.empty.sessions.title'), t('settings.yourData.empty.sessions.body')],
    checkins: [t('settings.yourData.empty.checkins.title'), t('settings.yourData.empty.checkins.body')],
    captures: [t('settings.yourData.empty.captures.title'), t('settings.yourData.empty.captures.body')],
  };
  const gridByCategory: Record<DataCategory, string> = {
    sessions: 'gridSessions',
    checkins: 'gridCheckins',
    captures: 'gridCaptures',
  };
  const filteredEmpty = normalizedQuery !== '' && allRows.length === 0;

  return (
    <div className={styles.plainStack}>
      <section className={styles.plainSection}>
        <div className={styles.toggleList}>
          <ToggleRow
            title={t('settings.yourData.privacy.shareFocusStatus.title')}
            detail={t('settings.yourData.privacy.shareFocusStatus.detail')}
          />
          <ToggleRow
            title={t('settings.yourData.privacy.liveSessionIndicator.title')}
            detail={t('settings.yourData.privacy.liveSessionIndicator.detail')}
          />
        </div>
        <GuaranteeNote body={t('settings.yourData.privacy.guarantee')} />
      </section>

      <section className={styles.plainSection}>
        <div className={styles.dataHeader}>
          <div className={styles.panelHeader}>
            <Typography as="h3" size="lg" weight="semibold">
              {t('settings.yourData.recordsTitle')}
            </Typography>
          </div>
          <div className={styles.dataExport}>
            {exportState === 'done' ? (
              <span className={styles.exportDone}>
                <CheckCircle size={16} weight="fill" aria-hidden="true" />
                <Typography as="span" size="xs" color="muted">
                  {t('settings.yourData.export.downloaded')}
                </Typography>
              </span>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              onClick={exportData}
              disabled={exportState === 'working'}
            >
              {exportState === 'working'
                ? t('settings.yourData.export.exporting')
                : t('settings.yourData.export.exportJson')}
            </Button>
          </div>
        </div>

        <div className={styles.dataToolbar}>
          <div className={styles.dataTabs}>
            {DATA_CATEGORIES.map(value => (
              <button
                aria-pressed={value === category}
                className={
                  value === category ? `${styles.dataTab} ${styles.dataTabActive}` : styles.dataTab
                }
                key={value}
                onClick={() => selectCategory(value)}
                type="button"
              >
                {t(CATEGORY_LABEL_KEY[value])}
                <span className={styles.dataTabCount}>{counts[value]}</span>
              </button>
            ))}
          </div>
          <label className={styles.dataSearch}>
            <MagnifyingGlass size={15} aria-hidden="true" />
            <input
              aria-label={t('settings.yourData.search.aria', { category: t(CATEGORY_LABEL_KEY[category]).toLowerCase() })}
              onChange={event => updateQuery(event.target.value)}
              placeholder={t('settings.yourData.search.placeholder', { category: t(CATEGORY_LABEL_KEY[category]).toLowerCase() })}
              value={query}
            />
          </label>
        </div>

        <DataTable
          columns={columnsByCategory[category]}
          gridClass={gridByCategory[category]}
          rows={visibleRows}
          confirmId={confirmId}
          onConfirm={setConfirmId}
          onDelete={deleteRow}
          emptyTitle={
            filteredEmpty ? t('settings.yourData.empty.filteredTitle', { query: query.trim() }) : emptyByCategory[category][0]
          }
          emptyBody={filteredEmpty ? t('settings.yourData.empty.filteredBody') : emptyByCategory[category][1]}
        />

        {allRows.length > 0 ? (
          <div className={styles.dataFooter}>
            <Typography as="span" size="xs" color="muted">
              {t('settings.yourData.pagination.range', { start: rangeStart, end: rangeEnd, total: allRows.length })}
            </Typography>
            {pageCount > 1 ? (
              <div className={styles.pager}>
                <button
                  aria-label={t('settings.yourData.pagination.previousAria')}
                  className={styles.pagerButton}
                  disabled={safePage === 0}
                  onClick={() => setPage(value => Math.max(0, value - 1))}
                  type="button"
                >
                  <CaretLeft size={14} aria-hidden="true" />
                </button>
                <Typography
                  as="span"
                  size="xs"
                  color="muted"
                >{`${safePage + 1} / ${pageCount}`}</Typography>
                <button
                  aria-label={t('settings.yourData.pagination.nextAria')}
                  className={styles.pagerButton}
                  disabled={safePage >= pageCount - 1}
                  onClick={() => setPage(value => Math.min(pageCount - 1, value + 1))}
                  type="button"
                >
                  <CaretRight size={14} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
