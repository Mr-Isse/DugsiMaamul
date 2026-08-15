import { useState } from 'react';
import {
  XCircle,
  CreditCard,
  Smartphone,
  CheckCircle,
  Loader2,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import {
  useGetPaymentSettingsQuery,
  useInitiatePaymentMutation,
  useGetPaymentInstructionsMutation
} from '../store/apiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const PROVIDER_OPTIONS = [
  { key: 'EVC_PLUS', name: 'EVC Plus', icon: Smartphone, color: 'text-blue-600' },
  { key: 'ZAAD', name: 'Zaad', icon: Smartphone, color: 'text-green-600' },
  { key: 'SAHAL', name: 'Sahal', icon: Smartphone, color: 'text-purple-600' },
  { key: 'SALAAM_BANK', name: 'Salaam Bank', icon: CreditCard, color: 'text-amber-600' },
  { key: 'PREMIER_BANK', name: 'Premier Bank', icon: CreditCard, color: 'text-emerald-600' },
  { key: 'WAAFIPAY', name: 'WaafiPay', icon: Smartphone, color: 'text-indigo-600' }
];

const PaymentModal = ({ isOpen, onClose, student, invoice }) => {
  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [paymentType, setPaymentType] = useState('FULL_PAYMENT');
  const [amount, setAmount] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [description, setDescription] = useState('');
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentInstructions, setPaymentInstructions] = useState(null);

  const { data } = useGetPaymentSettingsQuery();
  const paymentSettings = data?.settings;
  const [initiatePayment, { isLoading: initiating }] = useInitiatePaymentMutation();
  const [getPaymentInstructions, { isLoading: loadingInstructions }] = useGetPaymentInstructionsMutation();

  const activeProviders = Array.isArray(paymentSettings) 
    ? paymentSettings.filter(s => s.isActive) 
    : [];

  // Initialize amount from invoice
  useState(() => {
    if (invoice && invoice.amount) {
      setAmount(invoice.amount.toString());
    }
  }, [invoice]);

  const handleProviderSelect = async (provider) => {
    setSelectedProvider(provider);
    
    // Get payment instructions
    try {
      const instructions = await getPaymentInstructions({
        provider: provider.key,
        paymentData: {
          amount: parseFloat(amount) || 0,
          transactionId: 'temp'
        }
      }).unwrap();
      setPaymentInstructions(instructions);
    } catch (error) {
      // Instructions not available, continue
    }
    
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedProvider || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const result = await initiatePayment({
        provider: selectedProvider.key,
        amount: parseFloat(amount),
        currency: 'USD',
        studentId: student?._id,
        invoiceId: invoice?._id,
        customerPhone,
        customerEmail,
        description: description || `Payment for ${student?.name || 'student'}`,
        paymentType
      }).unwrap();

      setPaymentResult(result);
      setStep(3);
    } catch (error) {
      toast.error(error.data?.message || 'Failed to initiate payment');
    }
  };

  const formatCurrency = (amt) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amt || 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Process Payment</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <XCircle size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s < step 
                    ? 'bg-emerald-500 text-white' 
                    : s === step 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                }`}>
                  {s < step ? <CheckCircle size={16} /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 mx-2 ${s < step ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Provider */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="p-6"
            >
              {/* Student & Invoice Info */}
              {student && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{student.name}</div>
                  <div className="text-xs text-gray-500">{student.customId}</div>
                  {invoice && (
                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div className="text-xs text-gray-500">Invoice: {invoice.month} {invoice.year}</div>
                      <div className="text-lg font-black text-indigo-600">{formatCurrency(invoice.amount)}</div>
                    </div>
                  )}
                </div>
              )}

              {/* Amount & Type */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-lg font-black text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Payment Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'FULL_PAYMENT', label: 'Full Payment' },
                      { key: 'PARTIAL_PAYMENT', label: 'Partial Payment' }
                    ].map(type => (
                      <button
                        key={type.key}
                        onClick={() => setPaymentType(type.key)}
                        className={`py-3 px-4 rounded-xl text-sm font-bold border-2 transition-all ${
                          paymentType === type.key
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400'
                            : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Phone Number</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+252..."
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Email (optional)</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Description (optional)</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add a description..."
                    rows={2}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-xl text-sm font-bold text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>
              </div>

              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4">Select Payment Method</h3>
              
              {activeProviders.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-sm text-gray-500">No payment providers configured yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeProviders.map(settings => {
                    const provider = PROVIDER_OPTIONS.find(p => p.key === settings.provider);
                    if (!provider) return null;
                    
                    const Icon = provider.icon;
                    
                    return (
                      <button
                        key={settings.provider}
                        onClick={() => handleProviderSelect({ ...provider, settings })}
                        className="w-full text-left p-4 rounded-xl border-2 border-gray-100 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex items-center gap-4"
                      >
                        <div className={`w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center ${provider.color}`}>
                          <Icon size={24} />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-bold text-gray-900 dark:text-white">{provider.name}</div>
                          <div className="text-xs text-gray-500">{settings.environment === 'SANDBOX' ? 'Sandbox Mode' : 'Production'}</div>
                        </div>
                        {settings.isDefault && (
                          <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full">
                            Default
                          </div>
                        )}
                        <ArrowRight size={20} className="text-gray-400" />
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                onClick={onClose}
                className="w-full mt-6 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
            </motion.div>
          )}

          {/* Step 2: Confirm & Pay */}
          {step === 2 && selectedProvider && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-6"
            >
              {/* Payment Summary */}
              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <div className={`w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center ${selectedProvider.color}`}>
                    <selectedProvider.icon size={24} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900 dark:text-white">{selectedProvider.name}</div>
                    <div className="text-xs text-gray-500">
                      {selectedProvider.settings?.environment === 'SANDBOX' ? 'Sandbox Mode' : 'Production'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Payment Type</span>
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      {paymentType === 'FULL_PAYMENT' ? 'Full Payment' : 'Partial Payment'}
                    </span>
                  </div>
                  {customerPhone && (
                    <div className="flex justify-between py-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500">Phone</span>
                      <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{customerPhone}</span>
                    </div>
                  )}
                </div>

                {/* Payment Instructions */}
                {paymentInstructions && (
                  <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl">
                    <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-400 mb-2">Payment Instructions</h4>
                    {paymentInstructions.instructions && (
                      <p className="text-sm text-indigo-600 dark:text-indigo-300">{paymentInstructions.instructions}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={initiating || !amount}
                  className="w-full px-4 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {initiating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Pay {formatCurrency(parseFloat(amount))}
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep(1)}
                  className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Back
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Result */}
          {step === 3 && paymentResult && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 text-center"
            >
              {paymentResult.success ? (
                <>
                  <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle size={48} className="text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {paymentResult.paymentUrl ? 'Payment Initiated' : 'Payment Request Sent'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {paymentResult.paymentUrl 
                      ? 'Complete your payment using the link below'
                      : 'Follow the payment instructions to complete your payment'
                    }
                  </p>

                  {paymentResult.paymentUrl && (
                    <a
                      href={paymentResult.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all mb-4"
                    >
                      Complete Payment
                      <ExternalLink size={18} />
                    </a>
                  )}

                  <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl text-left mb-6">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Transaction ID</div>
                    <div className="font-mono text-sm font-bold text-indigo-600">{paymentResult.transactionId}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle size={48} className="text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Payment Failed</h3>
                  <p className="text-sm text-gray-500 mb-6">{paymentResult.error || 'Something went wrong'}</p>
                </>
              )}

              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                Done
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
