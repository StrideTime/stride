import { Trash } from '@phosphor-icons/react';
import { Button, Typography } from '@stride/ui';
import { useTranslation } from 'react-i18next';

import styles from '../../SettingsView.module.css';
import type { DataTableRow } from './types';

type DataTableProps = {
  columns: string[];
  gridClass: string;
  rows: DataTableRow[];
  confirmId: string | null;
  onConfirm: (id: string | null) => void;
  onDelete: (id: string) => void;
  emptyTitle: string;
  emptyBody: string;
};

export function DataTable({
  columns,
  gridClass,
  rows,
  confirmId,
  onConfirm,
  onDelete,
  emptyTitle,
  emptyBody,
}: DataTableProps) {
  const { t } = useTranslation();

  if (rows.length === 0) {
    return (
      <div className={styles.dataEmpty}>
        <Typography as="p" size="sm" weight="semibold">
          {emptyTitle}
        </Typography>
        <Typography as="p" size="sm" color="muted">
          {emptyBody}
        </Typography>
      </div>
    );
  }

  const gridClassName = [styles.dataGrid, styles[gridClass]].filter(Boolean).join(' ');

  return (
    <div className={styles.dataTable} role="table">
      <div className={`${styles.dataHead} ${gridClassName}`} role="row">
        {columns.map(column => (
          <Typography
            as="span"
            key={column}
            size="xs"
            weight="semibold"
            color="muted"
            className={styles.fieldLabel}
          >
            {column}
          </Typography>
        ))}
        <span aria-hidden="true" />
      </div>
      {rows.map(row =>
        confirmId === row.id ? (
          <div className={styles.dataConfirm} key={row.id} role="row">
            <Typography as="p" size="sm">
              {row.confirmText}
            </Typography>
            <div className={styles.confirmActions}>
              <Button size="sm" variant="ghost" onClick={() => onConfirm(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  onDelete(row.id);
                  onConfirm(null);
                }}
              >
                {t('common.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <div className={`${styles.dataRow} ${gridClassName}`} key={row.id} role="row">
            {row.cells.map((cell, index) => (
              <div className={styles.dataCell} key={columns[index] ?? String(index)} role="cell">
                {cell}
              </div>
            ))}
            <button
              aria-label={row.deleteLabel}
              className={styles.rowDelete}
              onClick={() => onConfirm(row.id)}
              type="button"
            >
              <Trash size={15} aria-hidden="true" />
            </button>
          </div>
        )
      )}
    </div>
  );
}
