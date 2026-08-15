import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DataTable = ({
  columns,
  data = [],
  loading = false,
  title,
  onAdd,
  addText = 'Add New',
  onEdit,
  onDelete,
  onView,
  searchPlaceholder = 'Search...',
  actions = true,
  extraActions,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = data.filter((row) =>
    Object.values(row).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(page * rowsPerPage, (page + 1) * rowsPerPage);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Table Header */}
      <div className="p-6 border-b border-gray-50 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {title}
            <span className="text-xs font-bold text-gray-400 bg-gray-50 dark:bg-gray-700 px-2 py-0.5 rounded-lg">
              {filteredData.length}
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-transparent focus:bg-white dark:focus:bg-gray-800 focus:border-indigo-500/50 rounded-xl text-sm transition-all outline-none"
            />
          </div>
          
          {onAdd && (
            <button 
              onClick={onAdd}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all text-sm whitespace-nowrap"
            >
              <Plus size={16} />
              {addText}
            </button>
          )}
          {extraActions}
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              {columns.map((column) => (
                <th 
                  key={column.id} 
                  className={`px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest ${column.align === 'right' ? 'text-right' : ''}`}
                >
                  {column.label}
                </th>
              ))}
              {actions && (
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-4">
                    <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-lg w-full"></div>
                  </td>
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-gray-300">
                      <Filter size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-400">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr key={row._id || idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                  {columns.map((column) => (
                    <td 
                      key={column.id} 
                      className={`px-6 py-4 text-sm text-gray-600 dark:text-gray-300 ${column.align === 'right' ? 'text-right' : ''}`}
                    >
                      {column.render ? column.render(row[column.id], row) : row[column.id]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button 
                            onClick={() => onView(row)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button 
                            onClick={() => onEdit(row)}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button 
                            onClick={() => onDelete(row)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold text-gray-500">
            Showing {Math.min(filteredData.length, page * rowsPerPage + 1)} to {Math.min(filteredData.length, (page + 1) * rowsPerPage)} of {filteredData.length} entries
          </span>
          <select 
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(0); }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-xs font-bold px-2 py-1 outline-none"
          >
            {[5, 10, 25, 50].map(v => (
              <option key={v} value={v}>{v} per page</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button 
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-lg text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-1 mx-2">
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              const pageNum = totalPages <= 5 ? i : (page <= 2 ? i : (page >= totalPages - 3 ? totalPages - 5 + i : page - 2 + i));
              return (
                <button 
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${page === pageNum ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'text-gray-500 hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-600 shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700'}`}
                >
                  {pageNum + 1}
                </button>
              );
            })}
          </div>

          <button 
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-lg text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:text-indigo-600 disabled:opacity-30 transition-all shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
