import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  FileText,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import {
  useGetTransactionHistoryQuery,
  useRefundPaymentMutation,
  useVerifyPaymentMutation
} from '../store/apiSlice';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const STATUS_COLORS = {
  COMPLETED: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  PENDING: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400' },
  PROCESSING: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  FAILED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  REFUNDED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
  CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' },
  EXPIRED: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-400' }
};

const STATUS_ICONS = {
  COMPLETED: CheckCircle,
  PENDING: Clock,
  PROCESSING: Clock,
  FAILED: XCircle,
  REFUNDED: RotateCcw,
  CANCELLED: XCircle,
  EXPIRED: XCircle
};

const PROVIDER_DISPLAY_NAMES = {
  EVC_PLUS: 'EVC Plus',
  ZAAD: 'Zaad',
  SAHAL: 'Sahal',
  SALAAM_BANK: 'Salaam Bank',
  PREMIER_BANK: 'Premier Bank',
  WAAFIPAY: 'WaafiPay',
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer'
};

const TransactionHistory = () => {
  const [filters, setFilters] = useState({
    status: '',
    provider: '',
    page: 1,
    limit: 20
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  const { data: result, refetch, isLoading } = useGetTransactionHistoryQuery(filters);
  const [refundPayment, { isLoading: refunding }] = useRefundPaymentMutation();
  const [verifyPayment, { isLoading: verifying }] = useVerifyPaymentMutation();

  const transactions = result?.transactions || [];
  const pagination = result?.pagination || {};

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const query = searchQuery.toLowerCase();
    return transactions.filter(t => 
      t.transactionId?.toLowerCase().includes(query) ||
      t.providerTransactionId?.toLowerCase().includes(query) ||
      t.student?.name?.toLowerCase().includes(query) ||
      t.customerName?.toLowerCase().includes(query) ||
      t.customerPhone?.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRefund = async () => {
    if (!showRefundModal) return;
    
    try {
      await refundPayment({
        transactionId: showRefundModal.transactionId,
        amount: parseFloat(refundAmount),
        reason: refundReason
      }).unwrap();
      
      toast.success('Refund processed successfully');
      setShowRefundModal(null);
      setRefundAmount('');
      setRefundReason('');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to process refund');
    }
  };

  const handleVerify = async (transaction) => {
    try {
      await verifyPayment(transaction.transactionId).unwrap();
      toast.success('Payment verified');
      refetch();
    } catch (error) {
      toast.error(error.data?.message || 'Verification failed');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Transaction History</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage all payment transactions</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction ID, student name, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="FAILED">Failed</option>
              <option value="REFUNDED">Refunded</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div className="lg:w-48">
            <select
              value={filters.provider}
              onChange={(e) => setFilters(prev => ({ ...prev, provider: e.target.value }))}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">All Providers</option>
              <option value="EVC_PLUS">EVC Plus</option>
              <option value="ZAAD">Zaad</option>
              <option value="SAHAL">Sahal</option>
              <option value="SALAAM_BANK">Salaam Bank</option>
              <option value="PREMIER_BANK">Premier Bank</option>
              <option value="WAAFIPAY">WaafiPay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-gray-500">
              <RefreshCw size={20} className="animate-spin" />
              <span className="font-bold">Loading transactions...</span>
            </div>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No transactions found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {filteredTransactions.map((transaction, idx) => {
                    const StatusIcon = STATUS_ICONS[transaction.status] || Clock;
                    const statusColors = STATUS_COLORS[transaction.status] || STATUS_COLORS.PENDING;
                    
                    return (
                      <motion.tr
                        key={transaction._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="font-mono text-xs font-bold text-indigo-600">{transaction.transactionId}</div>
                            {transaction.providerTransactionId && (
                              <div className="text-xs text-gray-400">/{transaction.providerTransactionId.slice(0, 8)}...</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {transaction.student ? (
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{transaction.student.name}</div>
                              <div className="text-xs text-gray-500">{transaction.student.customId}</div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">{transaction.customerName || 'N/A'}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                            {PROVIDER_DISPLAY_NAMES[transaction.provider] || transaction.provider}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</div>
                          {transaction.fee > 0 && (
                            <div className="text-xs text-gray-500">Fee: {formatCurrency(transaction.fee)}</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.text}`}>
                            <StatusIcon size={12} />
                            {transaction.status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600 dark:text-gray-400">{formatDate(transaction.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedTransaction(transaction)}
                              className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                              title="View details"
                            >
                              <Eye size={16} />
                            </button>
                            {transaction.status === 'PENDING' && (
                              <button
                                onClick={() => handleVerify(transaction)}
                                disabled={verifying}
                                className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all"
                                title="Verify payment"
                              >
                                <CheckCircle size={16} className={verifying ? 'animate-spin' : ''} />
                              </button>
                            )}
                            {transaction.status === 'COMPLETED' && transaction.isRefundable && (
                              <button
                                onClick={() => setShowRefundModal(transaction)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                title="Refund"
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={pagination.page <= 1}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-xs font-bold text-gray-500">{pagination.page} / {pagination.pages}</span>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page + 1) }))}
                    disabled={pagination.page >= pagination.pages}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <XCircle size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</label>
                  <p className="font-mono text-sm font-bold text-indigo-600 mt-1">{selectedTransaction.transactionId}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedTransaction.status]?.bg || 'bg-gray-100'} ${STATUS_COLORS[selectedTransaction.status]?.text || 'text-gray-700'}`}>
                      <CheckCircle size={12} />
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</label>
                  <p className="text-xl font-black text-gray-900 dark:text-white mt-1">{formatCurrency(selectedTransaction.amount)}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</label>
                  <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mt-1">{PROVIDER_DISPLAY_NAMES[selectedTransaction.provider]}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{formatDate(selectedTransaction.createdAt)}</p>
                </div>
                {selectedTransaction.receiptNumber && (
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt Number</label>
                    <p className="font-mono text-sm font-bold text-indigo-600 mt-1">{selectedTransaction.receiptNumber}</p>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="w-full px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Refund Payment</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Transaction: {showRefundModal.transactionId}
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Refund Amount</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  placeholder={showRefundModal.amount}
                  max={showRefundModal.amount}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Maximum: {formatCurrency(showRefundModal.amount)}</p>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="Enter refund reason..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowRefundModal(null)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefund}
                  disabled={refunding || !refundAmount || !refundReason}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {refunding ? 'Processing...' : 'Refund'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
