import React from 'react';
import { theme } from '../../theme/theme';

export interface Column<T> {
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  width?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyMessage?: string;
  isLoading?: boolean;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found.',
  isLoading = false,
}: TableProps<T>) {
  return (
    <div style={{ width: '100%', overflowX: 'auto', borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: theme.typography.fontSize.sm }}>
        <thead>
          <tr style={{ backgroundColor: theme.colors.surface, borderBottom: `1px solid ${theme.colors.border}` }}>
            {columns.map((col, index) => (
              <th
                key={index}
                style={{
                  padding: '12px 16px',
                  fontWeight: theme.typography.fontWeight.semibold,
                  color: theme.colors.textMuted,
                  width: col.width,
                }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: theme.colors.textDim }}>
                Loading data...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '40px', textAlign: 'center', color: theme.colors.textDim }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr
                key={keyExtractor(item)}
                style={{
                  borderBottom: `1px solid ${theme.colors.border}`,
                  transition: 'background-color 0.15s ease',
                }}
              >
                {columns.map((col, cIdx) => (
                  <td key={cIdx} style={{ padding: '14px 16px', color: theme.colors.text }}>
                    {typeof col.accessor === 'function'
                      ? col.accessor(item)
                      : col.accessor
                      ? (item[col.accessor] as any)
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
