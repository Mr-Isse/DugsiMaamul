import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  StatusBar,
  Modal,
  Linking,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import {
  useGetMyMonthlyPaymentsQuery,
  useGetStudentPaymentMethodsQuery,
  useInitiateStudentPaymentMutation,
  useGetStudentPaymentInstructionsMutation,
  useGetStudentTransactionHistoryQuery,
  usePayMonthlyFeeMutation,
} from '../../src/store/mobileApiSlice';
import {
  ChevronLeft,
  CreditCard,
  CheckCircle2,
  XCircle,
  Wallet,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  FileText,
  Receipt,
  Info,
  ChevronRight,
  TrendingUp,
  Phone,
  RefreshCw,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// ── Colour tokens ───────────────────────────────────────────────
const C = {
  primary: '#1E3A8A',
  primaryMid: '#2D4EAA',
  primaryLight: '#EFF6FF',
  bg: '#F4F6FA',
  white: '#FFFFFF',
  text: '#1E293B',
  sub: '#64748B',
  border: '#E2E8F0',

  green: '#059669',
  greenBg: '#ECFDF5',
  greenBdr: '#A7F3D0',
  greenText: '#065F46',

  red: '#DC2626',
  redBg: '#FEF2F2',
  redBdr: '#FECACA',
  redText: '#991B1B',

  amber: '#D97706',
  amberBg: '#FFFBEB',
  amberBdr: '#FDE68A',
  amberText: '#92400E',
};

// ── Helpers ─────────────────────────────────────────────────────
const fmt = (n) => `$${Number(n || 0).toFixed(2)}`;
const fmtShort = (n) => {
  const v = Number(n || 0);
  return v >= 1000 ? `$${(v / 1000).toFixed(1)}k` : `$${v.toFixed(2)}`;
};

// ── Month Row (inside modals) ────────────────────────────────────
const MonthRow = ({ item, onPress }) => {
  const isPaid = item.status === 'PAID';
  return (
    <TouchableOpacity
      style={[rowStyles.row, isPaid ? rowStyles.rowPaid : rowStyles.rowUnpaid]}
      onPress={onPress}
      disabled={isPaid}
      activeOpacity={0.7}
    >
      <View style={[rowStyles.dot, { backgroundColor: isPaid ? C.green : C.red }]} />
      <View style={{ flex: 1 }}>
        <Text style={rowStyles.label}>{item.monthLabel || `${item.month} ${item.year}`}</Text>
        {isPaid && item.paymentDate && (
          <Text style={rowStyles.date}>
            {new Date(item.paymentDate).toLocaleDateString('en-US', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </Text>
        )}
      </View>
      <View style={[rowStyles.badge, isPaid ? rowStyles.badgePaid : rowStyles.badgeUnpaid]}>
        {isPaid
          ? <CheckCircle2 size={11} color={C.green} style={{ marginRight: 3 }} />
          : <XCircle size={11} color={C.red} style={{ marginRight: 3 }} />}
        <Text style={[rowStyles.badgeText, { color: isPaid ? C.greenText : C.redText }]}>
          {item.status}
        </Text>
      </View>
      <Text style={[rowStyles.amount, { color: isPaid ? C.green : C.red }]}>
        {fmt(item.amount)}
      </Text>
    </TouchableOpacity>
  );
};

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
    gap: 10,
  },
  rowPaid: { backgroundColor: C.greenBg, borderWidth: 1, borderColor: C.greenBdr },
  rowUnpaid: { backgroundColor: C.redBg, borderWidth: 1, borderColor: C.redBdr },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 13, fontWeight: '700', color: C.text },
  date: { fontSize: 11, color: C.sub, marginTop: 2 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  badgePaid: { backgroundColor: C.greenBg, borderWidth: 1, borderColor: C.greenBdr },
  badgeUnpaid: { backgroundColor: C.redBg, borderWidth: 1, borderColor: C.redBdr },
  badgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.4 },
  amount: { fontSize: 14, fontWeight: '800', minWidth: 60, textAlign: 'right' },
});

// ── Bottom Sheet Modal ───────────────────────────────────────────
const BottomSheet = ({ visible, title, onClose, children }) => (
  <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
    <View style={bs.overlay}>
      <TouchableOpacity style={bs.backdrop} activeOpacity={1} onPress={onClose} />
      <View style={bs.sheet}>
        <View style={bs.handle} />
        <View style={bs.header}>
          <Text style={bs.title}>{title}</Text>
          <TouchableOpacity onPress={onClose} style={bs.closeBtn}>
            <X size={20} color={C.sub} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {children}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const bs = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '80%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: '800', color: C.text },
  closeBtn: { padding: 4 },
});

// ── Main Screen ──────────────────────────────────────────────────
const StudentPayments = () => {
  const router = useRouter();
  const { userInfo } = useSelector((state) => state.auth);

  const { data, isLoading, isError, refetch } = useGetMyMonthlyPaymentsQuery();
  const { data: providersData } = useGetStudentPaymentMethodsQuery();
  const { data: transactionsData } = useGetStudentTransactionHistoryQuery();
  const [initiatePayment] = useInitiateStudentPaymentMutation();
  const [getPaymentInstructions] = useGetStudentPaymentInstructionsMutation();
  const [payMonthlyFee] = usePayMonthlyFeeMutation();

  const [showStatement, setShowStatement] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState(null);

  const payments = data?.payments || [];
  const summary = data?.summary || {};
  const merchantNumber = data?.merchantNumber || '';
  const tuitionFee = data?.tuitionFee || 0;
  const studentCustomId = data?.studentCustomId || userInfo?.customId || '';
  const providers = providersData?.providers || [];
  const transactions = transactionsData?.transactions || [];

  const outstandingBalance = summary.totalDue || 0;
  const paidPayments = payments.filter(p => p.status === 'PAID');
  const unpaidPayments = payments.filter(p => p.status === 'UNPAID');

  // Initialize studentId from user info
  useEffect(() => {
    if (studentCustomId && !studentId) {
      setStudentId(studentCustomId);
    }
  }, [studentCustomId]);

  // ── Handle opening payment modal for a specific payment ─────────
  const handleOpenPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setStudentId(studentCustomId || '');
    setShowPaymentModal(true);
    setShowInstructions(false);
    setPaymentInstructions(null);
    setSelectedProvider(null);
  };

  // ── Get payment instructions ────────────────────────────────────
  const handleGetInstructions = async () => {
    if (!selectedProvider) return;

    try {
      const result = await getPaymentInstructions({
        providerId: selectedProvider,
        amount: selectedPayment.amount,
        studentId,
      }).unwrap();
      setPaymentInstructions(result);
      setShowInstructions(true);
    } catch (error) {
      Alert.alert(
        'Error',
        error.data?.message || 'Failed to get payment instructions',
      );
    }
  };

  // ── Initiate payment ────────────────────────────────────────────
  const handleInitiatePayment = async () => {
    if (!selectedProvider || !selectedPayment) return;

    try {
      const result = await initiatePayment({
        monthlyPaymentId: selectedPayment._id,
        providerId: selectedProvider,
        studentId,
      }).unwrap();

      if (result.instructions) {
        setPaymentInstructions(result.instructions);
        setShowInstructions(true);
      } else {
        Alert.alert('Success', 'Payment initiated successfully');
        setShowPaymentModal(false);
        refetch();
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.data?.message || 'Failed to initiate payment',
      );
    }
  };

  // ── Mark as paid directly ───────────────────────────────────────
  const handlePayDirectly = async () => {
    if (!selectedPayment) return;

    try {
      await payMonthlyFee({
        id: selectedPayment._id,
        studentId,
      }).unwrap();

      Alert.alert('Success', 'Payment marked as paid successfully');
      setShowPaymentModal(false);
      refetch();
    } catch (error) {
      Alert.alert(
        'Error',
        error.data?.message || 'Failed to process payment',
      );
    }
  };

  // ── Loading state ─────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading finance info…</Text>
      </View>
    );
  }

  // ── Error state ───────────────────────────────────────────────
  if (isError) {
    return (
      <View style={styles.centered}>
        <AlertCircle size={48} color={C.red} />
        <Text style={styles.errorTitle}>Failed to load finance data</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.primary} />

      {/* ── AppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color={C.white} />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Finance</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={refetch}>
          <RefreshCw size={20} color={C.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Finance Information hero card */}
        <View style={styles.heroCard}>
          <View style={styles.heroIconWrap}>
            <CreditCard size={22} color={C.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroTitle}>Finance Information</Text>
            <Text style={styles.heroSub}>Manage your financial records</Text>
          </View>
        </View>

        {/* ── Financial Summary */}
        <Text style={styles.sectionTitle}>Financial Summary</Text>
        <View style={styles.summaryRow}>
          {/* Tuition Fee */}
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: C.primaryLight }]}>
              <CreditCard size={18} color={C.primary} />
            </View>
            <Text style={styles.summaryLabel}>Tuition Fee</Text>
            <Text style={[styles.summaryValue, { color: C.primary }]}>{fmt(tuitionFee)}</Text>
            <Text style={styles.summaryHint}>per month</Text>
          </View>

          {/* Balance */}
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: C.amberBg }]}>
              <Wallet size={18} color={C.amber} />
            </View>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[styles.summaryValue, { color: C.amber }]}>{fmt(outstandingBalance)}</Text>
            <Text style={styles.summaryHint}>{unpaidPayments.length} month(s) due</Text>
          </View>
        </View>

        {/* ── All Paid Banner */}
        {outstandingBalance <= 0 && payments.length > 0 && (
          <View style={styles.allPaidBanner}>
            <CheckCircle2 size={20} color={C.green} style={{ marginRight: 10 }} />
            <Text style={styles.allPaidText}>
              All fees are up to date — no outstanding balance!
            </Text>
          </View>
        )}

        {/* ── Financial Services */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Financial Services</Text>
        <View style={styles.servicesCard}>
          {/* Financial Statement */}
          <TouchableOpacity
            style={styles.serviceRow}
            onPress={() => setShowStatement(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: '#EDE9FE' }]}>
              <FileText size={20} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>Financial Statement</Text>
              <Text style={styles.serviceSub}>View detailed balance, charges, and tuition fee breakdown</Text>
            </View>
            <ChevronRight size={18} color={C.sub} />
          </TouchableOpacity>

          <View style={styles.serviceDivider} />

          {/* All Receipts */}
          <TouchableOpacity
            style={styles.serviceRow}
            onPress={() => setShowReceipts(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.serviceIconWrap, { backgroundColor: C.greenBg }]}>
              <Receipt size={20} color={C.green} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceTitle}>All Receipts</Text>
              <Text style={styles.serviceSub}>Access all your payment receipts and transaction history</Text>
            </View>
            <ChevronRight size={18} color={C.sub} />
          </TouchableOpacity>
        </View>

        {/* ── Unpaid Payments */}
        {unpaidPayments.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Outstanding Payments</Text>
            <View style={{ gap: 10 }}>
              {unpaidPayments.map(payment => (
                <MonthRow
                  key={payment._id}
                  item={payment}
                  onPress={() => handleOpenPaymentModal(payment)}
                />
              ))}
            </View>
          </>
        )}

        {/* ── Financial Support */}
        <View style={styles.supportCard}>
          <View style={styles.supportIconWrap}>
            <Info size={16} color={C.green} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.supportTitle}>Financial Support</Text>
            <Text style={styles.supportText}>
              For payment inquiries or financial assistance, please contact the school finance office during business hours.
            </Text>
          </View>
        </View>

        <View style={{ height: 48 }} />
      </ScrollView>

      {/* ── Financial Statement Bottom Sheet */}
      <BottomSheet
        visible={showStatement}
        title={`Statement  (${payments.length} month${payments.length !== 1 ? 's' : ''})`}
        onClose={() => setShowStatement(false)}
      >
        {payments.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Calendar size={44} color={C.border} />
            <Text style={{ fontSize: 15, color: C.sub, marginTop: 12, fontWeight: '600' }}>
              No payment records yet
            </Text>
          </View>
        ) : (
          <>
            {/* Summary pills */}
            <View style={sheetStyles.pillRow}>
              <View style={[sheetStyles.pill, { backgroundColor: C.greenBg, borderColor: C.greenBdr }]}>
                <TrendingUp size={13} color={C.green} style={{ marginRight: 4 }} />
                <Text style={[sheetStyles.pillText, { color: C.greenText }]}>
                  Paid — {fmt(summary.paidTotal)} ({summary.paidCount})
                </Text>
              </View>
              <View style={[sheetStyles.pill, { backgroundColor: C.redBg, borderColor: C.redBdr }]}>
                <XCircle size={13} color={C.red} style={{ marginRight: 4 }} />
                <Text style={[sheetStyles.pillText, { color: C.redText }]}>
                  Due — {fmt(summary.totalDue)} ({summary.unpaidCount})
                </Text>
              </View>
            </View>

            {/* Unpaid first */}
            {unpaidPayments.length > 0 && (
              <>
                <Text style={sheetStyles.subhead}>Unpaid</Text>
                {unpaidPayments.map(p => <MonthRow key={p._id} item={p} onPress={() => handleOpenPaymentModal(p)} />)}
              </>
            )}
            {paidPayments.length > 0 && (
              <>
                <Text style={[sheetStyles.subhead, { marginTop: 16 }]}>Paid</Text>
                {paidPayments.map(p => <MonthRow key={p._id} item={p} />)}
              </>
            )}
          </>
        )}
      </BottomSheet>

      {/* ── All Receipts Bottom Sheet */}
      <BottomSheet
        visible={showReceipts}
        title={`Receipts  (${transactions.length})`}
        onClose={() => setShowReceipts(false)}
      >
        {transactions.length === 0 ? (
          <View style={{ alignItems: 'center', paddingVertical: 40 }}>
            <Receipt size={44} color={C.border} />
            <Text style={{ fontSize: 15, color: C.sub, marginTop: 12, fontWeight: '600' }}>
              No transaction records yet
            </Text>
          </View>
        ) : (
          <>
            {transactions.map(transaction => (
              <View
                key={transaction._id}
                style={[
                  rowStyles.row,
                  transaction.status === 'COMPLETED' ? rowStyles.rowPaid : rowStyles.rowUnpaid
                ]}
              >
                <View style={[
                  rowStyles.dot,
                  { backgroundColor: transaction.status === 'COMPLETED' ? C.green : C.red }
                ]} />
                <View style={{ flex: 1 }}>
                  <Text style={rowStyles.label}>
                    {transaction.provider || 'Payment'}
                  </Text>
                  <Text style={rowStyles.date}>{transaction.transactionId}</Text>
                </View>
                <Text style={[
                  rowStyles.amount,
                  { color: transaction.status === 'COMPLETED' ? C.green : C.red }
                ]}>
                  {fmt(transaction.amount)}
                </Text>
              </View>
            ))}
          </>
        )}
      </BottomSheet>

      {/* ── Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <Modal visible={showPaymentModal} animationType="slide" transparent onRequestClose={() => setShowPaymentModal(false)}>
          <View style={paymentModalStyles.overlay}>
            <TouchableOpacity style={paymentModalStyles.backdrop} activeOpacity={1} onPress={() => setShowPaymentModal(false)} />
            <View style={paymentModalStyles.modal}>
              <View style={paymentModalStyles.header}>
                <Text style={paymentModalStyles.title}>
                  Pay {selectedPayment.month} {selectedPayment.year}
                </Text>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <X size={24} color={C.sub} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={paymentModalStyles.content}>
                  {/* Student ID */}
                  <View style={paymentModalStyles.section}>
                    <Text style={paymentModalStyles.sectionLabel}>CONFIRM YOUR STUDENT ID</Text>
                    <View style={[paymentModalStyles.warningContainer, { marginBottom: 12 }]}>
                      <AlertCircle size={16} color="#D97706" />
                      <Text style={paymentModalStyles.warningText}>
                        Please enter your student ID to confirm this payment
                      </Text>
                    </View>
                    <TextInput
                      style={paymentModalStyles.input}
                      value={studentId}
                      onChangeText={setStudentId}
                      placeholder="Enter your student ID"
                      placeholderTextColor={C.sub}
                    />
                  </View>

                  {/* Amount */}
                  <View style={paymentModalStyles.section}>
                    <Text style={paymentModalStyles.sectionLabel}>PAYMENT AMOUNT</Text>
                    <Text style={paymentModalStyles.amount}>{fmt(selectedPayment.amount)}</Text>
                  </View>

                  {/* Payment Methods or Instructions */}
                  {!showInstructions ? (
                    <View style={paymentModalStyles.section}>
                      <Text style={paymentModalStyles.sectionLabel}>SELECT PAYMENT METHOD</Text>
                      {providers.length === 0 ? (
                        <View style={{ padding: 16, alignItems: 'center' }}>
                          <Text style={{ color: C.sub }}>No payment methods available</Text>
                        </View>
                      ) : (
                        <View style={{ gap: 12 }}>
                          {providers.map(provider => (
                            <TouchableOpacity
                              key={provider.id}
                              style={[
                                paymentModalStyles.providerButton,
                                selectedProvider === provider.id && paymentModalStyles.providerButtonSelected,
                              ]}
                              onPress={() => setSelectedProvider(provider.id)}
                              activeOpacity={0.7}
                            >
                              <View style={[
                                paymentModalStyles.providerIcon,
                                selectedProvider === provider.id && paymentModalStyles.providerIconSelected,
                              ]}>
                                <CreditCard size={20} color={selectedProvider === provider.id ? C.white : C.primary} />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={paymentModalStyles.providerName}>{provider.name}</Text>
                                {provider.description && (
                                  <Text style={paymentModalStyles.providerDescription}>{provider.description}</Text>
                                )}
                              </View>
                              {selectedProvider === provider.id && (
                                <CheckCircle2 size={24} color={C.primary} />
                              )}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={paymentModalStyles.section}>
                      <Text style={paymentModalStyles.sectionLabel}>PAYMENT INSTRUCTIONS</Text>
                      <View style={paymentModalStyles.instructionsContainer}>
                        {typeof paymentInstructions === 'string' ? (
                          <Text style={paymentModalStyles.instructionsText}>{paymentInstructions}</Text>
                        ) : (
                          <Text style={paymentModalStyles.instructionsText}>
                            {JSON.stringify(paymentInstructions, null, 2)}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
              </ScrollView>

              <View style={paymentModalStyles.footer}>
                <TouchableOpacity
                  style={paymentModalStyles.cancelButton}
                  onPress={() => setShowPaymentModal(false)}
                  activeOpacity={0.7}
                >
                  <Text style={paymentModalStyles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                {!showInstructions && selectedProvider && (
                  <TouchableOpacity
                    style={paymentModalStyles.secondaryButton}
                    onPress={handleGetInstructions}
                    activeOpacity={0.7}
                  >
                    <Text style={paymentModalStyles.secondaryButtonText}>Get Instructions</Text>
                  </TouchableOpacity>
                )}

                {!showInstructions && (
                  <TouchableOpacity
                    style={[paymentModalStyles.primaryButton, !selectedProvider && { opacity: 0.5 }]}
                    onPress={handleInitiatePayment}
                    disabled={!selectedProvider || !studentId}
                    activeOpacity={0.7}
                  >
                    <Text style={paymentModalStyles.primaryButtonText}>Pay Now</Text>
                  </TouchableOpacity>
                )}

                {showInstructions && (
                  <TouchableOpacity
                    style={[paymentModalStyles.successButton, !studentId && { opacity: 0.5 }]}
                    onPress={handlePayDirectly}
                    disabled={!studentId}
                    activeOpacity={0.7}
                  >
                    <Text style={paymentModalStyles.successButtonText}>I Have Paid</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const paymentModalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 20 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  modal: {
    backgroundColor: C.white,
    borderRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  title: { fontSize: 20, fontWeight: '800', color: C.text },
  content: { padding: 20 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: C.sub, textTransform: 'uppercase', letterSpacing: 0.6,
    marginBottom: 12,
  },
  warningContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFFBEB',
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.amberBdr,
  },
  warningText: { flex: 1, fontSize: 12, color: C.amberText, fontWeight: '600' },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: C.border, borderRadius: 12,
    padding: 14, fontSize: 16, fontWeight: '700', color: C.text,
  },
  amount: { fontSize: 32, fontWeight: '900', color: C.text },
  providerButton: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 2,
    borderColor: C.border,
  },
  providerButtonSelected: {
    borderColor: C.primary, backgroundColor: C.primaryLight,
  },
  providerIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: C.primaryLight,
    justifyContent: 'center', alignItems: 'center',
  },
  providerIconSelected: {
    backgroundColor: C.primary,
  },
  providerName: { fontSize: 14, fontWeight: '800', color: C.text },
  providerDescription: { fontSize: 12, color: C.sub, marginTop: 4 },
  instructionsContainer: {
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16,
  },
  instructionsText: { fontSize: 14, color: C.text, lineHeight: 22 },
  cancelButton: {
    flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  cancelButtonText: { fontSize: 14, fontWeight: '800', color: C.text },
  secondaryButton: {
    flex: 1, backgroundColor: C.primaryLight, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '800', color: C.primary },
  primaryButton: {
    flex: 1, backgroundColor: C.primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  primaryButtonText: { fontSize: 14, fontWeight: '800', color: C.white },
  successButton: {
    flex: 1, backgroundColor: C.green, paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  successButtonText: { fontSize: 14, fontWeight: '800', color: C.white },
});

const sheetStyles = StyleSheet.create({
  pillRow: { flexDirection: 'row', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  pill: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 20, borderWidth: 1,
  },
  pillText: { fontSize: 12, fontWeight: '700' },
  subhead: { fontSize: 13, fontWeight: '700', color: C.sub, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 10 },
});

// ── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: C.bg, gap: 12 },
  loadingText: { fontSize: 14, color: C.sub, marginTop: 8 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  retryBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: C.primary, borderRadius: 10 },
  retryText: { color: C.white, fontWeight: '700' },

  /* AppBar */
  appBar: {
    backgroundColor: C.primary,
    paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  backBtn: { padding: 4 },
  refreshBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontWeight: '800', color: C.white, letterSpacing: 0.3 },

  scroll: { padding: 20 },

  /* Hero card */
  heroCard: {
    backgroundColor: C.primary,
    borderRadius: 18, padding: 18,
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginBottom: 24,
    elevation: 4,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12,
  },
  heroIconWrap: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroTitle: { fontSize: 16, fontWeight: '800', color: C.white },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  /* Section title */
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 14 },

  /* Summary */
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1, backgroundColor: C.white, borderRadius: 18, padding: 16,
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
    borderWidth: 1, borderColor: C.border,
  },
  summaryIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  summaryLabel: { fontSize: 11, color: C.sub, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  summaryHint: { fontSize: 11, color: C.sub, marginTop: 3 },

  /* All-paid banner */
  allPaidBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.greenBg, borderRadius: 14,
    padding: 14, borderWidth: 1, borderColor: C.greenBdr, marginBottom: 8,
  },
  allPaidText: { fontSize: 13, color: C.greenText, flex: 1, fontWeight: '600', lineHeight: 19 },

  /* Services card */
  servicesCard: {
    backgroundColor: C.white, borderRadius: 18,
    borderWidth: 1, borderColor: C.border,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8,
  },
  serviceRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 18, gap: 14,
  },
  serviceIconWrap: {
    width: 44, height: 44, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  serviceTitle: { fontSize: 14, fontWeight: '700', color: C.text },
  serviceSub: { fontSize: 12, color: C.sub, marginTop: 3, lineHeight: 17 },
  serviceDivider: { height: 1, backgroundColor: C.border, marginHorizontal: 18 },

  /* Support card */
  supportCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: C.greenBg, borderRadius: 16,
    borderWidth: 1, borderColor: C.greenBdr,
    padding: 16, marginTop: 20,
  },
  supportIconWrap: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.greenBg,
    justifyContent: 'center', alignItems: 'center',
    marginTop: 2,
  },
  supportTitle: { fontSize: 13, fontWeight: '800', color: C.greenText, marginBottom: 4 },
  supportText: { fontSize: 12, color: C.greenText, lineHeight: 18 },
});

export default StudentPayments;
