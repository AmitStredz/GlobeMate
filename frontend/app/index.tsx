import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { DestinationCard } from '@/components/DestinationCard';
import { destinations } from '@/constants/DummyData';

const { width } = Dimensions.get('window');

const quickLinks = [
  { icon: 'airplane', label: 'Flights' },
  { icon: 'bed', label: 'Hotels' },
  { icon: 'map-marker-radius', label: 'Near Me' },
  { icon: 'compass', label: 'Guide' },
];

const upcomingTrip = {
  destination: 'Swiss Alps',
  date: 'Feb 14 - Feb 24',
  image: 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95',
};

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, Traveler!</Text>
            <Text style={styles.subtitle}>Where to next?</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color={Colors.text.primary} />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
            <Link href="/(pages)/messages" asChild>
              <TouchableOpacity style={styles.iconButton}>
                <Ionicons name="chatbubble-outline" size={24} color={Colors.text.primary} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.quickLinks}>
          {quickLinks.map((link) => (
            <TouchableOpacity key={link.label} style={styles.quickLinkButton}>
              <MaterialCommunityIcons name={link.icon} size={24} color={Colors.secondary.main} />
              <Text style={styles.quickLinkText}>{link.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Upcoming Trip */}
        {upcomingTrip && (
          <View style={styles.upcomingTrip}>
            <Text style={styles.sectionTitle}>Upcoming Trip</Text>
            <TouchableOpacity style={styles.tripCard}>
              <Image source={{ uri: upcomingTrip.image }} style={styles.tripImage} />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={styles.tripGradient}>
                <Text style={styles.tripDestination}>{upcomingTrip.destination}</Text>
                <Text style={styles.tripDate}>{upcomingTrip.date}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Activities Section */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>Popular Activities</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.activitiesList}>
            {['Hiking', 'Kayaking', 'Biking', 'Camping', 'Photography'].map((activity, index) => (
              <TouchableOpacity 
                key={activity} 
                style={[
                  styles.activityButton,
                  index === 0 && styles.activeActivityButton
                ]}>
                <Text style={[
                  styles.activityText,
                  index === 0 && styles.activeActivityText
                ]}>{activity}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Connect with Travelers */}
        <View style={styles.connectSection}>
          <Text style={styles.sectionTitle}>Connect with Fellow Travelers</Text>
          <View style={styles.connectCard}>
            <Text style={styles.connectText}>
              Find travel buddies heading to your destination!
            </Text>
            <TouchableOpacity style={styles.connectButton}>
              <Text style={styles.connectButtonText}>Find Travelers</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Trending Destinations */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Destinations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSubtitle}>Popular places to visit this season</Text>
          {destinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onPress={() => {
                // Navigate to destination details
              }}
            />
          ))}
        </View>

        {/* Travel Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>Travel Tips & Guides</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity style={styles.tipCard}>
              <Ionicons name="snow-outline" size={24} color={Colors.secondary.main} />
              <Text style={styles.tipTitle}>Winter Travel Guide</Text>
              <Text style={styles.tipSubtitle}>Essential tips for cold weather</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tipCard}>
              <Ionicons name="wallet-outline" size={24} color={Colors.secondary.main} />
              <Text style={styles.tipTitle}>Budget Planning</Text>
              <Text style={styles.tipSubtitle}>Smart travel on any budget</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Review Section */}
        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Share Your Experience</Text>
          <TouchableOpacity style={styles.reviewCard}>
            <Text style={styles.reviewPrompt}>
              Been to any of these places? Help other travelers with your review!
            </Text>
            <TouchableOpacity style={styles.writeReviewButton}>
              <Text style={styles.writeReviewText}>Write a Review</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  greeting: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
    marginTop: 4,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickLinkButton: {
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    padding: 12,
    borderRadius: 16,
    width: (width - 64) / 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickLinkText: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.primary,
  },
  upcomingTrip: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  tripCard: {
    height: 160,
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 12,
  },
  tripImage: {
    width: '100%',
    height: '100%',
  },
  tripGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    padding: 16,
    justifyContent: 'flex-end',
  },
  tripDestination: {
    color: Colors.text.light,
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  tripDate: {
    color: Colors.text.light,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  seeAllButton: {
    color: Colors.secondary.main,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
  connectSection: {
    padding: 16,
    marginBottom: 24,
  },
  connectCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  connectText: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  connectButtonText: {
    color: Colors.text.light,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  tipsSection: {
    padding: 16,
    marginBottom: 24,
  },
  tipCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: width * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginTop: 12,
  },
  tipSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
    marginTop: 4,
  },
  reviewSection: {
    padding: 16,
    marginBottom: 24,
  },
  reviewCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 20,
    padding: 16,
    marginTop: 12,
    alignItems: 'center',
  },
  reviewPrompt: {
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  writeReviewButton: {
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  writeReviewText: {
    color: Colors.text.light,
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  activitiesSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    paddingHorizontal: 16,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
    paddingHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  activitiesList: {
    paddingHorizontal: 12,
    marginTop: 12,
  },
  activityButton: {
    backgroundColor: Colors.background.card,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activityText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.primary,
  },
  activeActivityButton: {
    backgroundColor: Colors.secondary.main,
  },
  activeActivityText: {
    fontFamily: 'Poppins-Bold',
    color: Colors.text.light,
  },
}); 