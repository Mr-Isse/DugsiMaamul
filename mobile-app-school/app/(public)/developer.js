import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { getImageUri } from '../../src/utils/imageUtils';
import { 
  ChevronLeft, 
  Github, 
  Linkedin, 
  Facebook, 
  MessageCircle, 
  Globe, 
  Mail, 
  Code2, 
  ExternalLink 
} from 'lucide-react-native';
import profile from '../../assets/profile.jpeg'
import { LinearGradient } from 'expo-linear-gradient';

const DeveloperProfile = () => {
  const router = useRouter();
  const { theme, dark } = useTheme();

  const developerInfo = {
    name: "Asad Isse Isak",
    role: "Full-Stack Software Architect",
    photo: "https://res.cloudinary.com/dwpvzsbmx/image/upload/v1717068000/profile_placeholder.jpg", // Replace with actual photo URL
    bio: "Passionate Full-Stack Developer with expertise in building enterprise-grade multi-tenant SaaS solutions. I specialize in React Native, Node.js, and Cloud Infrastructure, focused on creating innovative tools for education and business management.",
    email: "asadisse12@gmail.com",
    website: "https://mr-isse.vercel.app/",
    github: "https://github.com/Mr-Isse",
    linkedin: "https://linkedin.com/in/mohamedciise",
    facebook: "https://facebook.com/mohamedciise",
    whatsapp: "+252610729128" // Replace with actual number
  };

  const openLink = (url) => {
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  const SocialLink = ({ icon: Icon, label, onPress, color }) => (
    <TouchableOpacity 
      style={[styles.socialBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
    >
      <View style={[styles.socialIconBg, { backgroundColor: color + '15' }]}>
        <Icon size={20} color={color} />
      </View>
      <Text style={[styles.socialLabel, { color: theme.text }]}>{label}</Text>
      <ExternalLink size={14} color={theme.subText} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About Developer</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <LinearGradient
          colors={[theme.primary, '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.avatarContainer}>
            <Image 
              source={getImageUri(developerInfo.photo) ? { uri: getImageUri(developerInfo.photo) } : require('../../assets/images/icon.png')} 
              style={styles.avatar}
            />
            <View style={styles.badge}>
              <Code2 size={12} color="#FFF" />
            </View>
          </View>
          <Text style={styles.name}>{developerInfo.name}</Text>
          <Text style={styles.role}>{developerInfo.role}</Text>
        </LinearGradient>

        <View style={styles.content}>
          {/* Bio Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>BIOGRAPHY</Text>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.bioText, { color: theme.text }]}>
                {developerInfo.bio}
              </Text>
            </View>
          </View>

          {/* Connect Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>CONNECT WITH ME</Text>
            
            <SocialLink 
              icon={Linkedin} 
              label="LinkedIn Professional" 
              color="#0077B5" 
              onPress={() => openLink(developerInfo.linkedin)}
            />
            <SocialLink 
              icon={Github} 
              label="GitHub Portfolio" 
              color={dark ? "#FFF" : "#181717"} 
              onPress={() => openLink(developerInfo.github)}
            />
            <SocialLink 
              icon={MessageCircle} 
              label="WhatsApp Chat" 
              color="#25D366" 
              onPress={() => openLink(`whatsapp://send?phone=${developerInfo.whatsapp}`)}
            />
            <SocialLink 
              icon={Facebook} 
              label="Facebook Profile" 
              color="#1877F2" 
              onPress={() => openLink(developerInfo.facebook)}
            />
            <SocialLink 
              icon={Globe} 
              label="Official Website" 
              color="#EC4899" 
              onPress={() => openLink(developerInfo.website)}
            />
            <SocialLink 
              icon={Mail} 
              label="Email Address" 
              color="#F59E0B" 
              onPress={() => openLink(`mailto:${developerInfo.email}`)}
            />
          </View>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.subText }]}>
              Built with ❤️ for Educational Innovation
            </Text>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#10B981',
    padding: 6,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#6366F1',
  },
  name: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  role: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    lineHeight: 24,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    opacity: 0.9,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  socialIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  socialLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
  }
});

export default DeveloperProfile;