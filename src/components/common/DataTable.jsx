import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox } from 'lucide-react';

export const DataTable = ({
  columns,
  data = [],
  pageSize = 8,
  emptyTitle = 'No records found',
  emptyMessage = 'No matching information is available right now.',
  onRowClick,
  className = '',
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(data.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  const currentData = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);

  return (
    <div className={`flex flex-col bg-white dark:bg-[#1E293B] rounded-lg border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden transition-colors ${className}`}>
      {/* Table container */}
      <div className="overflow-x-auto min-w-full">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F7F9FC] dark:bg-slate-800/90 border-b border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold text-[#64748B] dark:text-[#CBD5E1] uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  className={`px-5 py-3.5 whitespace-nowrap ${col.className || ''}`}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#334155] text-sm">
            {currentData.length > 0 ? (
              currentData.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-150 hover:bg-blue-50/25 dark:hover:bg-slate-700/40 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={col.key || colIndex}
                      className={`px-5 py-3.5 whitespace-nowrap text-[#334155] dark:text-[#F1F5F9] ${
                        col.cellClassName || ''
                      }`}
                    >
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-[#64748B] dark:text-[#CBD5E1]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-lg bg-[#F7F9FC] dark:bg-slate-800 text-[#64748B] dark:text-[#CBD5E1] flex items-center justify-center border border-[#E2E8F0] dark:border-[#334155]">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">{emptyTitle}</p>
                    <p className="text-xs text-[#64748B] dark:text-[#CBD5E1] max-w-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {data.length > 0 && (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F7F9FC] dark:bg-slate-800/80 text-xs text-[#64748B] dark:text-[#CBD5E1]">
          <div>
            Showing{' '}
            <span className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
              {(safePage - 1) * pageSize + 1}
            </span>{' '}
            to{' '}
            <span className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">
              {Math.min(safePage * pageSize, data.length)}
            </span>{' '}
            of <span className="font-semibold text-[#1E3A5F] dark:text-[#F1F5F9]">{data.length}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-[#334155] dark:text-[#F1F5F9]">
              Page {safePage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safePage === totalPages}
              className="p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] text-[#334155] dark:text-[#CBD5E1] hover:bg-white dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
