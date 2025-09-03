import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, Heart, MapPin, LogOut, CreditCard as Edit, Bell, Shield, CircleHelp as HelpCircle, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface MenuItem {
  icon: any;
  title: string;
  onPress: () => void;
  isSpecial?: boolean;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/(profile)/edit-profile')
  };

  const handleLocalHostRegistration = () => {
    router.push('/(profile)/local-host-onboarding');
  };

  const handleMenuPress = (title: string) => {
    Alert.alert(title, `${title} feature coming soon!`);
  };

  // Filter menu items based on local host status
  const getMenuItems = (): MenuItem[] => {
    const baseMenuItems: MenuItem[] = [
      { icon: Edit, title: 'Edit Profile', onPress: handleEditProfile },
      { icon: Settings, title: 'Settings', onPress: () => handleMenuPress('Settings') },
      { icon: Bell, title: 'Notifications', onPress: () => handleMenuPress('Notifications') },
      { icon: Heart, title: 'Saved Destinations', onPress: () => handleMenuPress('Saved Destinations') },
      { icon: MapPin, title: 'My Trips', onPress: () => handleMenuPress('My Trips') },
      { icon: Shield, title: 'Privacy', onPress: () => handleMenuPress('Privacy') },
      { icon: HelpCircle, title: 'Help & Support', onPress: () => handleMenuPress('Help & Support') },
    ];

    // Add local host registration option only if user is not already a local host
    if (!user?.profile?.is_local_host) {
      baseMenuItems.splice(1, 0, { 
        icon: Home, 
        title: 'Register as Local Host', 
        onPress: handleLocalHostRegistration, 
        isSpecial: true 
      });
    }

    return baseMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <User size={40} color="#FFFFFF" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.username}</Text>
              <Text style={styles.email}>{user?.email}</Text>
              <Text style={styles.email}>
                {user?.profile?.gender === 'M' ? 'Male' : user?.profile?.gender === 'F' ? 'Female' : 'Other'}
              </Text>
              {user?.profile?.is_local_host && (
                <View style={styles.localHostBadge}>
                  <Home size={14} color="#F97316" />
                  <Text style={styles.localHostText}>Verified Local Host</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Trips Taken</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Posts Shared</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Destinations</Text>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, item.isSpecial && styles.specialMenuItem]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIconContainer, item.isSpecial && styles.specialMenuIconContainer]}>
                  <item.icon size={20} color={item.isSpecial ? "#FFFFFF" : "#6B7280"} />
                </View>
                <Text style={[styles.menuItemText, item.isSpecial && styles.specialMenuItemText]}>{item.title}</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#EF4444" />
          <Text style={styles.logoutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity onPress={() => router.push('/(profile)/edit-profile')} style={{ backgroundColor: '#1E40AF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>Edit Preferences</Text>
        </TouchableOpacity> */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>TravelApp v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  header: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  localHostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  localHostText: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '600',
    marginLeft: 4,
  },
  preferencesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  preferenceTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  preferenceText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginTop: -16,
    borderRadius: 16,
    paddingVertical: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  menuContainer: {
    marginTop: 32,
    marginHorizontal: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  specialMenuItem: {
    backgroundColor: '#FEF3E2',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  specialMenuIconContainer: {
    backgroundColor: '#F97316',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '600',
  },
  specialMenuItemText: {
    color: '#F97316',
    fontWeight: '700',
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: '300',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginLeft: 8,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});