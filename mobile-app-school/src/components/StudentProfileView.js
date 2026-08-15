import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  StatusBar
} from 'react-native';
import { 
  User, 
  CheckCircle, 
  Bookmark, 
  Calendar, 
  LogOut, 
  School, 
  GraduationCap, 
  Clock,
  Maximize,
  ChevronLeft,
  CreditCard,
  FileText,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  Asterisk,
  Moon,
  Sun,
  MapPin,
  Home,
  Users,
  Hash,
  Shield
} from 'lucide-react-native';
import { useTheme } from '../theme';
import { SCHOOL_CONFIG } from '../../config';
import { getImageUri } from '../utils/imageUtils';

const { width } = Dimensions.get('window');

const StudentProfileView = ({ student, stats, attendance, payments, marks, onLogout, onBack, isOwnProfile = false }) => {
  const { theme, dark, toggleTheme } = useTheme();
  const T = theme;
  const [expandedSections, setExpandedSections] = React.useState({
    finance: false,
    attendance: false,
    marks: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // School data with fallbacks from config
  const schoolData = {
    name: student?.school?.name || SCHOOL_CONFIG.appName,
    subdomain: student?.school?.subdomain || SCHOOL_CONFIG.tenantId,
    code: student?.school?.code || 'N/A'
  };

  // Data mapping from the student object
  const profileData = {
    name: student?.name || stats?.fullName || 'Student Name',
    status: student?.status || 'Active',
    studentId: student?.customId || stats?.studentId || 'N/A',
    hemisId: student?.nationalId || 'N/A',
    class: student?.class?.name || stats?.className || 'N/A',
    academic: {
      campus: student?.campus || 'Main Campus',
      mode: student?.studentMode || student?.mode || 'Full-time',
      entryTime: student?.entryTime || 'N/A'
    },
    personal: {
      gender: student?.gender || 'N/A',
      placeOfBirth: student?.placeOfBirth || 'N/A',
      address: student?.address?.city || student?.address?.street || 'N/A',
      motherName: student?.motherName || 'N/A'
    },
    contact: {
      phone: student?.phone || 'N/A',
      email: student?.email || 'N/A',
      parentPhone: student?.parentPhone || 'N/A',
      emergencyContact: student?.emergencyContact || 'N/A'
    }
  };

  const InfoCard = ({ icon: Icon, label, value, color }) => (
    <View style={[styles.infoCard, { backgroundColor: T.card }]}>
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <View style={styles.infoTextContainer}>
        <Text style={[styles.infoLabel, { color: T.subText }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: T.text }]}>{value}</Text>
      </View>
    </View>
  );

  const SectionHeader = ({ icon: Icon, title, expandable, isExpanded, onToggle }) => (
    <TouchableOpacity 
      style={styles.sectionHeader} 
      onPress={expandable ? onToggle : null}
      activeOpacity={expandable ? 0.7 : 1}
    >
      <View style={[styles.sectionIconContainer, { backgroundColor: '#10B98115' }]}>
        <Icon size={18} color="#10B981" />
      </View>
      <Text style={[styles.sectionTitle, { color: T.text }]}>{title}</Text>
      {expandable && (
        <View style={styles.expandIcon}>
          {isExpanded ? <ChevronUp size={20} color={T.subText} /> : <ChevronDown size={20} color={T.subText} />}
        </View>
      )}
    </TouchableOpacity>
  );

  const ListItem = ({ icon: Icon, label, value, color }) => (
    <View style={[styles.listItem, { borderBottomColor: T.border }]}>
      <Icon size={20} color={color || T.text} style={styles.listItemIcon} />
      <View style={styles.listItemTextContainer}>
        <Text style={[styles.listItemLabel, { color: T.subText }]}>{label}</Text>
        <Text style={[styles.listItemValue, { color: T.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: T.bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={T.primary} />
      {/* App Bar */}
      <View style={[styles.appBar, { backgroundColor: T.primary }]}>
        {onBack && (
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <ChevronLeft size={26} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.appBarTitle}>Profile</Text>
        <TouchableOpacity onPress={toggleTheme} style={{ position: 'absolute', right: 18, top: 55 }}>
          {dark ? <Sun color="#FFFFFF" size={29} /> : <Moon color="#FFFFFF" size={29} />}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={[styles.header, { backgroundColor: T.primary }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              {getImageUri(student?.profileImage) ? (
                <Image 
                  source={{ uri: getImageUri(student.profileImage) }} 
                  style={styles.avatarImage} 
                />
              ) : (
                <View style={styles.placeholderAvatar}>
                  <User size={60} color="#CBD5E1" />
                </View>
              )}
            </View>
          </View>
          <Text style={styles.userName}>{profileData.name}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{profileData.status}</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <InfoCard icon={User} label="Student ID" value={profileData.studentId} color="#10B981" />
            <InfoCard icon={CheckCircle} label="Hemis ID" value={profileData.hemisId} color="#3B82F6" />
          </View>
          <View style={styles.gridRow}>
            <InfoCard icon={Bookmark} label="Class" value={profileData.class} color="#F59E0B" />
            <InfoCard icon={School} label="School" value={schoolData.subdomain} color="#6366F1" />
          </View>
        </View>

        {/* School Information */}
        <View style={styles.section}>
          <SectionHeader icon={School} title="School Information" />
          <View style={[styles.sectionCard, { backgroundColor: T.card }]}>
            <ListItem icon={School} label="School Name" value={schoolData.name} />
            <ListItem icon={Hash} label="School ID (Tenant)" value={schoolData.subdomain} />
            <ListItem icon={Shield} label="School Code" value={schoolData.code} />
          </View>
        </View>

        {/* Logout Button (Only if it's the user's own profile) */}
        {isOwnProfile && (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <LogOut size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}

        {/* Academic Information */}
        <View style={styles.section}>
          <SectionHeader icon={Bookmark} title="Academic Information" />
          <View style={[styles.sectionCard, { backgroundColor: T.card }]}>
            <ListItem icon={School} label="Campus" value={profileData.academic.campus} />
            <ListItem icon={GraduationCap} label="Mode" value={profileData.academic.mode} />
            <ListItem icon={Clock} label="Entry Time" value={profileData.academic.entryTime} />
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <SectionHeader icon={User} title="Personal Information" />
          <View style={[styles.sectionCard, { backgroundColor: T.card }]}>
            <ListItem icon={User} label="Gender" value={profileData.personal.gender} />
            <ListItem icon={MapPin} label="Place of Birth" value={profileData.personal.placeOfBirth} />
            <ListItem icon={Home} label="Address" value={profileData.personal.address} />
            <ListItem icon={Users} label="Mother's Name" value={profileData.personal.motherName} />
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <SectionHeader icon={Phone} title="Contact Information" />
          <View style={[styles.sectionCard, { backgroundColor: T.card }]}>
            <ListItem icon={Phone} label="Phone" value={profileData.contact.phone} />
            <ListItem icon={Mail} label="Email" value={profileData.contact.email} />
            <ListItem icon={Phone} label="Parent's Phone" value={profileData.contact.parentPhone} />
            <ListItem icon={Asterisk} label="Emergency Contact" value={profileData.contact.emergencyContact} />
          </View>
        </View>

        {/* Finance Section (Expandable) */}
        {/* {payments && (
          <View style={styles.section}>
            <SectionHeader 
              icon={CreditCard} 
              title="Finance Information" 
              expandable={true}
              isExpanded={expandedSections.finance}
              onToggle={() => toggleSection('finance')}
            />
            {expandedSections.finance && (
              <View style={[styles.sectionCard, { backgroundColor: T.card }]}>
                {payments.length > 0 ? payments.map((p, i) => (
                  <ListItem 
                    key={i} 
                    icon={CreditCard} 
                    label={`${p.monthLabel || p.month} ${p.year}`} 
                    value={`${p.amount} - ${p.status}`}
                    color={p.status === 'PAID' ? '#10B981' : '#EF4444'}
                  />
                )) : (
                  <Text style={[styles.emptyText, { color: T.subText }]}>No payment records</Text>
                )}
              </View>
            )}
          </View>
        )} */}

        {/* Attendance Section (Expandable) */}
        {/* {attendance && (
          <View style={styles.section}>
            <SectionHeader 
              icon={ClipboardCheck} 
              title="Attendance Records" 
              expandable={true}
              isExpanded={expandedSections.attendance}
              onToggle={() => toggleSection('attendance')}
            />
            {expandedSections.attendance && (
              <View style={[styles.sectionCard, { backgroundColor: T.card }]}>
                {attendance.length > 0 ? attendance.slice(0, 10).map((a, i) => (
                  <ListItem 
                    key={i} 
                    icon={ClipboardCheck} 
                    label={new Date(a.date).toLocaleDateString()} 
                    value={a.status}
                    color={a.status === 'present' ? '#10B981' : '#EF4444'}
                  />
                )) : (
                  <Text style={[styles.emptyText, { color: T.subText }]}>No attendance records</Text>
                )}
              </View>
            )}
          </View>
        )} */}

        {/* Marks Section (Expandable) */}
        {/* {marks && (
          <View style={styles.section}>
            <SectionHeader 
              icon={FileText} 
              title="Exam Marks" 
              expandable={true}
              isExpanded={expandedSections.marks}
              onToggle={() => toggleSection('marks')}
            />
            {expandedSections.marks && (
              <View style={[styles.sectionCard, { backgroundColor: T.card }]}>
                {marks.length > 0 ? marks.map((m, i) => (
                  <ListItem 
                    key={i} 
                    icon={FileText} 
                    label={m.subject?.name || 'Subject'} 
                    value={`Final: ${m.final || 0}`}
                  />
                )) : (
                  <Text style={[styles.emptyText, { color: T.subText }]}>No exam marks recorded</Text>
                )}
              </View>
            )}
          </View>
        )} */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* QR Button */}
      <TouchableOpacity style={[styles.qrButton, { backgroundColor: T.primary }]}>
        <Maximize size={24} color="#fff" />
        <Text style={styles.qrButtonText}>My QR</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  appBar: {
    height: 100,
    paddingTop: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    top: 55,
    zIndex: 1,
  },
  appBarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingBottom: 30,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  placeholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  gridContainer: {
    padding: 16,
    marginTop: -30,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCard: {
    width: (width - 44) / 2,
    padding: 16,
    borderRadius: 15,
    flexDirection: 'column',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 30,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  expandIcon: {
    padding: 4,
  },
  sectionCard: {
    borderRadius: 15,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  listItemIcon: {
    marginRight: 15,
  },
  listItemTextContainer: {
    flex: 1,
  },
  listItemLabel: {
    fontSize: 13,
    marginBottom: 2,
  },
  listItemValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  emptyText: {
    padding: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  qrButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  qrButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default StudentProfileView;


