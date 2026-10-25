import React from 'react';
import { FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

export const DataTable = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyTitle = 'Aucun enregistrement trouvé',
  emptyDescription = 'Modifiez vos filtres ou effectuez une nouvelle recherche.',
  page = 0,
  pageSize = 10,
  totalElements = 0,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  onRowClick,
  sortField,
  sortOrder = 'asc',
  onSort,
  className = '',
}) => {
  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className={`st-table-container ${className}`.trim()}>
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table className="st-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortField === col.key;

                return (
                  <th
                    key={col.key}
                    className={col.sortable ? 'sortable' : ''}
                    style={{
                      width: col.width,
                      textAlign: col.align || 'left',
                    }}
                    onClick={() => {
                      if (col.sortable && onSort) {
                        onSort(col.key);
                      }
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        justifyContent: col.align === 'right' ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <span>{col.header}</span>
                      {col.sortable && isSorted && (
                        <span>
                          {sortOrder === 'asc' ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              // Affichage du Skeleton au chargement
              Array.from({ length: Math.min(pageSize, 5) }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`}>
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-cell-${cIdx}`} style={{ textAlign: col.align || 'left' }}>
                      <Skeleton height={18} width={col.width ? '70%' : '85%'} />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length > 0 ? (
              data.map((row, rIdx) => (
                <tr
                  key={row.id || row.idReservation || row.idTrajet || rIdx}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        textAlign: col.align || 'left',
                        width: col.width,
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length}>
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {totalElements > 0 && (
        <div className="st-table-pagination">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>
              Affichage de <strong>{startItem}</strong> à <strong>{endItem}</strong> sur{' '}
              <strong>{totalElements}</strong> résultats
            </span>

            {onPageSizeChange && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>Par page :</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    border: '1px solid #CBD5E0',
                    fontSize: 12,
                    background: '#FFFFFF',
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              disabled={page <= 0 || isLoading}
              onClick={() => onPageChange && onPageChange(page - 1)}
              className="st-btn st-btn-outline st-btn-sm"
              title="Page précédente"
            >
              <FiChevronLeft size={14} />
              <span>Précédent</span>
            </button>

            <span style={{ margin: '0 8px', fontWeight: 500 }}>
              Page {page + 1} / {totalPages || 1}
            </span>

            <button
              type="button"
              disabled={page >= totalPages - 1 || isLoading}
              onClick={() => onPageChange && onPageChange(page + 1)}
              className="st-btn st-btn-outline st-btn-sm"
              title="Page suivante"
            >
              <span>Suivant</span>
              <FiChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
