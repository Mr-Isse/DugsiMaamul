import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Calendar,
  ChevronLeft,
  RefreshCw,
  CheckCircle2,
  X,
  FileText,
  Receipt,
  Wallet,
  AlertCircle,
} from 'lucide-react-native';
import {
  useGetChildFeesQuery,
  useGetParentPaymentMethodsQuery,
  useInitiateParentPaymentMutation,
  useGetParentPaymentInstructionsMutation,
  useGetParentTransactionHistoryQuery,
  usePayChildMonthlyFeeMutation,
} from '../../../src/store/mobileApiSlice';

const ChildPayments = () => {
  const router = useRouter();
  const { studentId } = useLocalSearchParams();
  const { data: feesData, isLoading: feesLoading, error: feesError, refetch } = useGetChildFeesQuery(studentId);
  const { data: providersData } = useGetParentPaymentMethodsQuery(studentId);
  const { data: transactionsData } = useGetParentTransactionHistoryQuery(studentId);
  const [initiatePayment] = useInitiateParentPaymentMutation();
  const [getPaymentInstructions] = useGetParentPaymentInstructionsMutation();
  const [payChildMonthlyFee] = usePayChildMonthlyFeeMutation();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [paymentInstructions, setPaymentInstructions] = useState(null);

  const payments = feesData?.data || [];
  const providers = providersData?.providers || [];
  const transactions = transactionsData?.transactions || [];

  const unpaidPayments = payments.filter(p => p.status?.toLowerCase() !== 'paid');
  const paidPayments = payments.filter(p => p.status?.toLowerCase() === 'paid');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return <CheckCircle size={24} color="#34C759" />;
      case 'unpaid':
      case 'pending':
        return <XCircle size={24} color="#FF9500" />;
      case 'overdue':
        return <XCircle size={24} color="#FF3B30" />;
      default:
        return <Calendar size={24} color="#64748B" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid':
        return { backgroundColor: '#E8F5E9', color: '#34C759' };
      case 'unpaid':
      case 'pending':
        return { backgroundColor: '#FFF3E0', color: '#FF9500' };
      case 'overdue':
        return { backgroundColor: '#FFEBEE', color: '#FF3B30' };
      default:
        return { backgroundColor: '#F5F5F5', color: '#64748B' };
    }
  };

  const handleOpenPaymentModal = (payment) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
    setShowInstructions(false);
    setPaymentInstructions(null);
    setSelectedProvider(null);
  };

  const handleGetInstructions = async () => {
    if (!selectedProvider) return;

    try {
      const result = await getPaymentInstructions({
        studentId,
        providerId: selectedProvider,
        amount: (selectedPayment.amountDue || 0) - (selectedPayment.amountPaid || 0),
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

  const handleInitiatePayment = async () => {
    if (!selectedProvider || !selectedPayment) return;

    try {
      const result = await initiatePayment({
        studentId,
        monthlyPaymentId: selectedPayment._id,
        providerId: selectedProvider,
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

  const handlePayDirectly = async () => {
    if (!selectedPayment) return;

    try {
      await payChildMonthlyFee({
        studentId,
        id: selectedPayment._id,
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

  if (feesLoading) {
    return (
      <View style={[styles.container, { backgroundColor: '#F4F6FA', justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1E3A8A" />
        <Text style={{ fontSize: 14, color: '#64748B', marginTop: 12, fontWeight: '600' }}>
          Loading fees…
        </Text>
      </View>
    );
  }

  if (feesError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#F4F6FA' }]}>
        <View style={styles.errorContainer}>
          <AlertCircle size={48} color="#DC2626" />
          <Text style={[styles.errorText, { color: '#1E293B' }]}>Failed to load fees</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatAmount = (amount) => `$${(amount || 0).toFixed(2)}`;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#F4F6FA' }]}>
      {/* AppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={26} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Fees</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={refetch}>
          <RefreshCw size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <CreditCard size={18} color="#1E3A8A" />
            </View>
            <Text style={styles.summaryLabel}>Total Due</Text>
            <Text style={[styles.summaryValue, { color: '#1E3A8A' }]}>
              {formatAmount(payments.reduce((sum, p) => sum + (p.amountDue || 0) - (p.amountPaid || 0), 0))}
            </Text>
            <Text style={styles.summaryHint}>{unpaidPayments.length} unpaid</Text>
          </View>
          <View style={styles.summaryCard}>
            <View style={[styles.summaryIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <Wallet size={18} color="#059669" />
            </View>
            <Text style={styles.summaryLabel}>Total Paid</Text>
            <Text style={[styles.summaryValue, { color: '#059669' }]}>
              {formatAmount(payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0))}
            </Text>
            <Text style={styles.summaryHint}>{paidPayments.length} paid</Text>
          </View>
        </View>

        {/* Unpaid Payments */}
        {unpaidPayments.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Outstanding Payments</Text>
            {unpaidPayments.map((payment) => {
              const statusStyle = getStatusStyle(payment.status);
              return (
                <TouchableOpacity
                  key={payment._id}
                  onPress={() => handleOpenPaymentModal(payment)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.paymentCard, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
                    <View style={styles.paymentHeader}>
                      <View style={styles.paymentIconContainer}>
                        <CreditCard size={24} color="#1E3A8A" />
                      </View>
                      <View style={styles.paymentInfo}>
                        <Text style={[styles.paymentMonth, { color: '#1E293B' }]}>
                          {payment.paymentMonth?.name || 'Unknown Month'}
                        </Text>
                        <Text style={[styles.paymentDate, { color: '#64748B' }]}>
                          {payment.paymentMonth ? `${payment.paymentMonth.month} ${payment.paymentMonth.year}` : 'No date'}
                        </Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                        <Text style={[styles.statusText, { color: statusStyle.color }]}>
                          {payment.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.paymentDetails}>
                      <View style={styles.amountContainer}>
                        <Text style={[styles.amountLabel, { color: '#64748B' }]}>Amount Due</Text>
                        <Text style={[styles.amountValue, { color: '#DC2626' }]}>
                          {formatAmount((payment.amountDue || 0) - (payment.amountPaid || 0))}
                        </Text>
                      </View>

                      {payment.amountPaid > 0 && (
                        <View style={styles.paidContainer}>
                          <Text style={[styles.paidLabel, { color: '#64748B' }]}>Amount Paid</Text>
                          <Text style={[styles.paidValue, { color: '#34C759' }]}>
                            {formatAmount(payment.amountPaid)}
                          </Text>
                        </View>
                      )}
                    </View>

                    {payment.paymentDate && (
                      <View style={styles.paymentDateContainer}>
                        <Calendar size={16} color="#64748B" />
                        <Text style={[styles.paymentDateText, { color: '#64748B' }]}>
                          Paid on {formatDate(payment.paymentDate)}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Paid Payments */}
        {paidPayments.length > 0 && (
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            {paidPayments.map((payment) => {
              const statusStyle = getStatusStyle(payment.status);
              return (
                <View
                  key={payment._id}
                  style={[styles.paymentCard, { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}
                >
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentIconContainer}>
                      <CreditCard size={24} color="#1E3A8A" />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={[styles.paymentMonth, { color: '#1E293B' }]}>
                        {payment.paymentMonth?.name || 'Unknown Month'}
                      </Text>
                      <Text style={[styles.paymentDate, { color: '#64748B' }]}>
                        {payment.paymentMonth ? `${payment.paymentMonth.month} ${payment.paymentMonth.year}` : 'No date'}
                      </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                      <Text style={[styles.statusText, { color: statusStyle.color }]}>
                        {payment.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.paymentDetails}>
                    <View style={styles.amountContainer}>
                      <Text style={[styles.amountLabel, { color: '#64748B' }]}>Total Amount</Text>
                      <Text style={[styles.amountValue, { color: '#1E293B' }]}>
                        {formatAmount(payment.amountDue)}
                      </Text>
                    </View>

                    <View style={styles.paidContainer}>
                      <Text style={[styles.paidLabel, { color: '#64748B' }]}>Amount Paid</Text>
                      <Text style={[styles.paidValue, { color: '#34C759' }]}>
                        {formatAmount(payment.amountPaid)}
                      </Text>
                    </View>
                  </View>

                  {payment.paymentDate && (
                    <View style={styles.paymentDateContainer}>
                      <Calendar size={16} color="#64748B" />
                      <Text style={[styles.paymentDateText, { color: '#64748B' }]}>
                        Paid on {formatDate(payment.paymentDate)}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {payments.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: '#64748B' }]}>No payment records found</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Payment Modal */}
      {showPaymentModal && selectedPayment && (
        <Modal visible={showPaymentModal} animationType="slide" transparent onRequestClose={() => setShowPaymentModal(false)}>
          <View style={paymentModalStyles.overlay}>
            <TouchableOpacity style={paymentModalStyles.backdrop} activeOpacity={1} onPress={() => setShowPaymentModal(false)} />
            <View style={paymentModalStyles.modal}>
              <View style={paymentModalStyles.header}>
                <Text style={paymentModalStyles.title}>
                  Pay {selectedPayment.paymentMonth?.name || selectedPayment.paymentMonth?.month || 'Payment'}
                </Text>
                <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                  <X size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={paymentModalStyles.content}>
                  {/* Student ID */}
                  <View style={paymentModalStyles.section}>
                    <Text style={paymentModalStyles.sectionLabel}>STUDENT ID</Text>
                    <View style={paymentModalStyles.input}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#1E293B' }}>
                        {studentId}
                      </Text>
                    </View>
                  </View>

                  {/* Amount */}
                  <View style={paymentModalStyles.section}>
                    <Text style={paymentModalStyles.sectionLabel}>PAYMENT AMOUNT</Text>
                    <Text style={paymentModalStyles.amount}>
                      {formatAmount((selectedPayment.amountDue || 0) - (selectedPayment.amountPaid || 0))}
                    </Text>
                  </View>

                  {/* Payment Methods or Instructions */}
                  {!showInstructions ? (
                    <View style={paymentModalStyles.section}>
                      <Text style={paymentModalStyles.sectionLabel}>SELECT PAYMENT METHOD</Text>
                      {providers.length === 0 ? (
                        <View style={{ padding: 16, alignItems: 'center' }}>
                          <Text style={{ color: '#64748B' }}>No payment methods available</Text>
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
                                <CreditCard size={20} color={selectedProvider === provider.id ? '#FFFFFF' : '#1E3A8A'} />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={paymentModalStyles.providerName}>{provider.name}</Text>
                                {provider.description && (
                                  <Text style={paymentModalStyles.providerDescription}>{provider.description}</Text>
                                )}
                              </View>
                              {selectedProvider === provider.id && (
                                <CheckCircle2 size={24} color="#1E3A8A" />
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
                    disabled={!selectedProvider}
                    activeOpacity={0.7}
                  >
                    <Text style={paymentModalStyles.primaryButtonText}>Pay Now</Text>
                  </TouchableOpacity>
                )}

                {showInstructions && (
                  <TouchableOpacity
                    style={paymentModalStyles.successButton}
                    onPress={handlePayDirectly}
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
    </SafeAreaView>
  );
};

const paymentModalStyles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', padding: 20 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.45)' },
  modal: {
    backgroundColor: '#FFFFFF',
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
    borderBottomColor: '#E2E8F0',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  content: { padding: 20 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 12, fontWeight: '800', color: '#64748B', textTransform: 'uppercase', letterSpacing: 0.6,
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12,
    padding: 14,
  },
  amount: { fontSize: 32, fontWeight: '900', color: '#1E293B' },
  providerButton: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  providerButtonSelected: {
    borderColor: '#1E3A8A', backgroundColor: '#EFF6FF',
  },
  providerIcon: {
    width: 44, height: 44, borderRadius: 14, backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  providerIconSelected: {
    backgroundColor: '#1E3A8A',
  },
  providerName: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  providerDescription: { fontSize: 12, color: '#64748B', marginTop: 4 },
  instructionsContainer: {
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16,
  },
  instructionsText: { fontSize: 14, color: '#1E293B', lineHeight: 22 },
  cancelButton: {
    flex: 1, backgroundColor: '#F1F5F9', paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  cancelButtonText: { fontSize: 14, fontWeight: '800', color: '#1E293B' },
  secondaryButton: {
    flex: 1, backgroundColor: '#EFF6FF', paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  secondaryButtonText: { fontSize: 14, fontWeight: '800', color: '#1E3A8A' },
  primaryButton: {
    flex: 1, backgroundColor: '#1E3A8A', paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  primaryButtonText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
  successButton: {
    flex: 1, backgroundColor: '#059669', paddingVertical: 14, borderRadius: 14, alignItems: 'center',
  },
  successButtonText: { fontSize: 14, fontWeight: '800', color: '#FFFFFF' },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    backgroundColor: '#1E3A8A',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { padding: 4 },
  refreshBtn: { padding: 4 },
  appBarTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF', letterSpacing: 0.3 },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: '#1E293B', marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  summaryIconWrap: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  summaryLabel: { fontSize: 11, color: '#64748B', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  summaryValue: { fontSize: 22, fontWeight: '800', marginTop: 4 },
  summaryHint: { fontSize: 11, color: '#64748B', marginTop: 3 },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
  paymentCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  paymentIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentMonth: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  paymentDetails: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  amountContainer: {
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  paidContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  paidLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  paidValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  paymentDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  paymentDateText: {
    fontSize: 12,
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: '#1E3A8A',
    borderRadius: 10,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default ChildPayments;
