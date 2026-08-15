import { useState } from 'react';
import {
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  CreditCard,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Lock,
  AlertCircle
} from 'lucide-react';
import {
  useGetMyMonthlyPaymentsQuery,
  useGetStudentPaymentMethodsQuery,
  useInitiateStudentPaymentMutation,
  useGetStudentPaymentInstructionsMutation,
  useGetStudentTransactionHistoryQuery,
  usePayMonthlyFeeMutation
} from '../store/adminApiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';

const STATUS_COLORS = {
  PAID: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
  UNPAID: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' }
};

const STATUS_ICONS = {
  PAID: CheckCircle,
  UNPAID: XCircle
};

const PROVIDER_DISPLAY_NAMES = {
  EVC_PLUS: 'EVC Plus',
  ZAAD: 'Zaad',
  SAHAL: 'Sahal',
  SALAAM_BANK: 'Salaam Bank',
  PREMIER_BANK: 'Premier Bank',
  WAAFIPAY: 'WaafiPay'
};

const StudentPayments = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('payments');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState(null);

  const { data: paymentsData, refetch: refetchPayments, isLoading: paymentsLoading } = useGetMyMonthlyPaymentsQuery();
  const { data: paymentMethods, refetch: refetchMethods, isLoading: methodsLoading } = useGetStudentPaymentMethodsQuery();
  const { data: transactionsData, refetch: refetchTransactions, isLoading: transactionsLoading } = useGetStudentTransactionHistoryQuery();
  const [initiatePayment, { isLoading: initiating }] = useInitiateStudentPaymentMutation();
  const [getPaymentInstructions, { isLoading: loadingInstructions }] = useGetStudentPaymentInstructionsMutation();
  const [payMonthlyFee, { isLoading: paying }] = usePayMonthlyFeeMutation();

  const payments = paymentsData?.payments || [];
  const summary = paymentsData?.summary || {};
  const providers = paymentMethods?.providers || [];
  const transactions = transactionsData?.transactions || [];

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
      day: 'numeric'
    });
  };

  const handleOpenPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setStudentId(userInfo?.customId || '');
    setShowPaymentModal(true);
    setShowInstructions(false);
    setPaymentInstructions(null);
    setSelectedProvider(null);
  };

  const handleGetInstructions = async () => {
    if (!selectedProvider) return;

    try {
      const instructions = await getPaymentInstructions({
        providerId: selectedProvider,
        amount: selectedPayment.amount,
        studentId: userInfo?.customId
      }).unwrap();
      setPaymentInstructions(instructions);
      setShowInstructions(true);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to get payment instructions');
    }
  };

  const handleInitiatePayment = async () => {
    if (!selectedProvider || !selectedPayment) return;

    try {
      const result = await initiatePayment({
        monthlyPaymentId: selectedPayment._id,
        providerId: selectedProvider,
        studentId
      }).unwrap();

      if (result.instructions) {
        setPaymentInstructions(result.instructions);
        setShowInstructions(true);
      } else {
        toast.success('Payment initiated successfully');
        setShowPaymentModal(false);
        refetchPayments();
        refetchTransactions();
      }
    } catch (error) {
      toast.error(error.data?.message || 'Failed to initiate payment');
    }
  };

  const handlePayDirectly = async () => {
    if (!selectedPayment) return;

    try {
      await payMonthlyFee({
        id: selectedPayment._id,
        studentId
      }).unwrap();

      toast.success('Payment marked as paid successfully');
      setShowPaymentModal(false);
      refetchPayments();
      refetchTransactions();
    } catch (error) {
      toast.error(error.data?.message || 'Failed to process payment');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and pay your outstanding fees</p>
        </div>
        <button
          onClick={() => {
            refetchPayments();
            refetchMethods();
            refetchTransactions();
          }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paid</span>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(summary.paidTotal)}</div>
          <div className="text-xs text-gray-500 mt-1">{summary.paidCount} payments</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl">
              <XCircle size={20} className="text-red-600" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Outstanding</span>
          </div>
          <div className="text-2xl font-black text-red-600">{formatCurrency(summary.unpaidTotal)}</div>
          <div className="text-xs text-gray-500 mt-1">{summary.unpaidCount} payments</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <DollarSign size={20} className="text-blue-600" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total</span>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency((summary.paidTotal || 0) + (summary.unpaidTotal || 0))}</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
              <Lock size={20} className="text-indigo-600" />
            </div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Student ID</span>
          </div>
          <div className="text-lg font-black text-indigo-600">{userInfo?.customId || 'N/A'}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'payments'
              ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Monthly Payments
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex-1 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'transactions'
              ? 'bg-white dark:bg-gray-800 text-indigo-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Transactions
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'payments' ? (
          <motion.div
            key="payments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {paymentsLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                <RefreshCw size={24} className="animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Loading payments...</p>
              </div>
            ) : payments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No payments found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">You don't have any payment records yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment, idx) => {
                  const StatusIcon = STATUS_ICONS[payment.status] || XCircle;
                  const statusColors = STATUS_COLORS[payment.status] || STATUS_COLORS.UNPAID;

                  return (
                    <motion.div
                      key={payment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${statusColors.bg}`}>
                            <Calendar size={24} className={statusColors.text} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {payment.month} {payment.year}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.paymentDate ? `Paid on ${formatDate(payment.paymentDate)}` : 'Due now'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</div>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.text}`}>
                              <StatusIcon size={12} />
                              {payment.status}
                            </div>
                          </div>

                          {payment.status === 'UNPAID' && (
                            <button
                              onClick={() => handleOpenPaymentModal(payment)}
                              className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
                            >
                              <CreditCard size={18} />
                              Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="transactions"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {transactionsLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                <RefreshCw size={24} className="animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Loading transactions...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No transactions found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">You don't have any transaction records yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction, idx) => {
                  const StatusIcon = STATUS_ICONS[transaction.status] || XCircle;
                  const statusColors = STATUS_COLORS[transaction.status] || STATUS_COLORS.UNPAID;

                  return (
                    <motion.div
                      key={transaction._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-2xl ${statusColors.bg}`}>
                            <CreditCard size={24} className={statusColors.text} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {PROVIDER_DISPLAY_NAMES[transaction.provider] || transaction.provider}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {transaction.transactionId}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(transaction.amount)}</div>
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusColors.bg} ${statusColors.text}`}>
                              <StatusIcon size={12} />
                              {transaction.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full"
          >
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pay {selectedPayment.month} {selectedPayment.year}</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <XCircle size={20} className="text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Student ID Verification */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Confirm Your Student ID
                </label>
                <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 rounded-xl mb-3">
                  <AlertCircle size={16} className="text-amber-600" />
                  <span className="text-xs text-amber-700 dark:text-amber-300">
                    Please enter your student ID to confirm this payment
                  </span>
                </div>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter your student ID"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Amount */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Payment Amount
                </label>
                <div className="text-3xl font-black text-gray-900 dark:text-white">
                  {formatCurrency(selectedPayment.amount)}
                </div>
              </div>

              {/* Payment Methods */}
              {!showInstructions ? (
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 block">
                    Select Payment Method
                  </label>
                  {methodsLoading ? (
                    <div className="text-center py-4">
                      <RefreshCw size={20} className="animate-spin mx-auto text-gray-400" />
                    </div>
                  ) : providers.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No payment methods available
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {providers.map((provider) => (
                        <button
                          key={provider.id}
                          onClick={() => setSelectedProvider(provider.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            selectedProvider === provider.id
                              ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                              : 'border-gray-100 dark:border-gray-700 hover:border-indigo-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              selectedProvider === provider.id
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700'
                            }`}>
                              <CreditCard size={20} />
                            </div>
                            <div className="text-left">
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{provider.name}</div>
                              {provider.description && (
                                <div className="text-xs text-gray-500">{provider.description}</div>
                              )}
                            </div>
                          </div>
                          {selectedProvider === provider.id && (
                            <CheckCircle size={20} className="text-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Payment Instructions</h3>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    {typeof paymentInstructions === 'string' ? (
                      <p>{paymentInstructions}</p>
                    ) : (
                      <pre className="whitespace-pre-wrap">{JSON.stringify(paymentInstructions, null, 2)}</pre>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>

                {!showInstructions && selectedProvider && (
                  <button
                    onClick={handleGetInstructions}
                    disabled={loadingInstructions || !studentId}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingInstructions ? 'Loading...' : 'Get Instructions'}
                  </button>
                )}

                {!showInstructions && (
                  <button
                    onClick={handleInitiatePayment}
                    disabled={initiating || !selectedProvider || !studentId}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {initiating ? 'Processing...' : 'Pay Now'}
                  </button>
                )}

                {showInstructions && (
                  <button
                    onClick={handlePayDirectly}
                    disabled={paying || !studentId}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paying ? 'Processing...' : 'I Have Paid'}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StudentPayments;
