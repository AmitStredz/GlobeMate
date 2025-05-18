import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { posts } from '@/constants/DummyData';

const { width } = Dimensions.get('window');

const userProfile = {
  name: 'Sarah Traveler',
  bio: 'Adventure seeker | Photography lover | World explorer 🌎',
  location: 'Currently in: Switzerland',
  stats: {
    posts: 42,
    followers: '2.5K',
    following: 384,
    countries: 15,
  },
  achievements: [
    { icon: 'airplane', label: 'Air Miles Pro', description: '50,000+ miles' },
    { icon: 'camera', label: 'Top Photographer', description: '1000+ likes' },
    { icon: 'map-marker', label: 'Explorer', description: '15 countries' },
  ],
  nextTrip: {
    destination: 'Bali, Indonesia',
    date: 'March 15-25',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
  },
  image: 'https://randomuser.me/api/portraits/women/1.jpg',
};

const tabs = ['Posts', 'Stories', 'Saved', 'Reviews'];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState('Posts');

  const renderPost = ({ item, index }) => (
    <TouchableOpacity
      style={[
        styles.postItem,
        { marginLeft: index % 2 === 0 ? 0 : 8 },
      ]}>
      <Image source={{ uri: item.images[0] }} style={styles.postImage} />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.7)']}
        style={styles.postOverlay}>
        <View style={styles.postStats}>
          <View style={styles.postStat}>
            <Ionicons name="heart" size={16} color={Colors.text.light} />
            <Text style={styles.postStatText}>{item.likes}</Text>
          </View>
          <View style={styles.postStat}>
            <Ionicons name="chatbubble" size={16} color={Colors.text.light} />
            <Text style={styles.postStatText}>{item.comments}</Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.postLocation}>{item.location}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="share-social-outline" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="settings-outline" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <View style={styles.profileImageContainer}>
            <Image source={{ uri: userProfile.image }} style={styles.profileImage} />
            <View style={styles.onlineStatus} />
          </View>
          <View style={styles.profileDetails}>
            <Text style={styles.name}>{userProfile.name}</Text>
            <Text style={styles.bio}>{userProfile.bio}</Text>
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color={Colors.secondary.main} />
              <Text style={styles.location}>{userProfile.location}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          {Object.entries(userProfile.stats).map(([key, value]) => (
            <View key={key} style={styles.statItem}>
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            </View>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <MaterialCommunityIcons name="qrcode-scan" size={20} color={Colors.text.primary} />
          </TouchableOpacity>
        </View>

        {/* Achievements */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.achievementsContainer}>
          {userProfile.achievements.map((achievement) => (
            <View key={achievement.label} style={styles.achievementCard}>
              <LinearGradient
                colors={[Colors.secondary.main, Colors.secondary.dark]}
                style={styles.achievementIcon}>
                <MaterialCommunityIcons name={achievement.icon} size={24} color={Colors.text.light} />
              </LinearGradient>
              <Text style={styles.achievementLabel}>{achievement.label}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Next Trip */}
        {userProfile.nextTrip && (
          <View style={styles.nextTripContainer}>
            <Text style={styles.sectionTitle}>Next Adventure</Text>
            <TouchableOpacity style={styles.nextTripCard}>
              <Image source={{ uri: userProfile.nextTrip.image }} style={styles.nextTripImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.nextTripOverlay}>
                <Text style={styles.nextTripDestination}>{userProfile.nextTrip.destination}</Text>
                <Text style={styles.nextTripDate}>{userProfile.nextTrip.date}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Content Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Posts Grid */}
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.postsGrid}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: Colors.secondary.main,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.status.success,
    borderWidth: 2,
    borderColor: Colors.background.main,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  name: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  bio: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
    marginTop: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  location: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.secondary.main,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: Colors.text.light,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementsContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  achievementCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: width * 0.4,
    alignItems: 'center',
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
  },
  achievementDesc: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
  nextTripContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  nextTripCard: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
  nextTripImage: {
    width: '100%',
    height: '100%',
  },
  nextTripOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: 16,
  },
  nextTripDestination: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.light,
  },
  nextTripDate: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.light,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: Colors.border.light,
  },
  activeTab: {
    borderBottomColor: Colors.secondary.main,
  },
  tabText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.secondary,
  },
  activeTabText: {
    color: Colors.secondary.main,
  },
  postsGrid: {
    padding: 16,
  },
  postItem: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postOverlay: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'space-between',
  },
  postStats: {
    flexDirection: 'row',
    gap: 12,
  },
  postStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  postStatText: {
    color: Colors.text.light,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  postLocation: {
    color: Colors.text.light,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
});