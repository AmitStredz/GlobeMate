import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { DestinationCard } from '@/components/DestinationCard';
import { SearchBar } from '@/components/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { Destination, Place } from '@/types';
import { Bell, MapPin } from 'lucide-react-native';
import { placesAPI } from '@/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceDetailsBottomSheet } from '@/components/PlaceDetailsBottomSheet';

const DUMMY_IMAGE = 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function Home() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedRaw, setSelectedRaw] = useState<Place | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [rawPlaces, setRawPlaces] = useState<Place[]>([]);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchFeed = useCallback(async () => {
    if (!token) {
      setError('Please log in to view places');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await placesAPI.getPlaces();
      const places = data.places || [];
      setRawPlaces(places);
      
      // Map API response to Destination[]
      const mapped: Destination[] = places.map((place: Place, idx: number) => ({
        id: place.place_id || `${place.name}-${idx}`,
        title: place.name || 'Unknown Place',
        location: place.formatted_address || 'Unknown',
        description: place.description || 'No description available',
        image: place.first_photo_url || DUMMY_IMAGE,
        price: '', // Price not available from places API
        rating: place.rating || 0,
        category: place.place_types?.[0]?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General',
        tags: place.place_types || [],
      }));
      
      setDestinations(mapped);
    } catch (err: any) {
      console.error('Error fetching places:', err);
      setError(err.message || 'Failed to load places');
      
      // Show alert for authentication errors
      if (err.message.includes('Session expired') || err.message.includes('authentication')) {
        Alert.alert(
          'Session Expired',
          'Please log in again to continue.',
          [{ text: 'OK' }]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const filteredDestinations = destinations.filter(destination =>
    destination.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    destination.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
  };

  const handleDestinationPress = useCallback((destination: Destination, idx: number) => {
    setSelectedDestination(destination);
    setSelectedIndex(idx);
    setSelectedRaw(rawPlaces[idx] || null);
    setBottomSheetVisible(true);
  }, [rawPlaces]);

  const handleBottomSheetClose = useCallback(() => {
    setBottomSheetVisible(false);
    setSelectedDestination(null);
    setSelectedRaw(null);
    setSelectedIndex(null);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.username || 'Traveler'}! 👋</Text>
            <View style={styles.locationContainer}>
              <MapPin size={16} color="#6B7280" />
              <Text style={styles.location}>Where would you like to go?</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#374151" />
          </TouchableOpacity>
        </View>
        
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFilterPress={() => {
            // TODO: Implement filter functionality
            console.log('Filter pressed');
          }}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Popular Destinations</Text>
          <Text style={styles.sectionSubtitle}>
            Discover amazing places recommended for you
          </Text>
        </View>

        {loading ? (
          <View style={styles.centerContainer}>
            <Text style={styles.loadingText}>Loading amazing places...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Oops! Something went wrong</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity onPress={fetchFeed} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : filteredDestinations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No places found' : 'No destinations available'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try adjusting your search terms or clear the search to see all places' 
                : 'Check back later for new destinations'}
            </Text>
            {searchQuery && (
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Clear Search</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.destinationsContainer}>
            {filteredDestinations.map((destination, idx) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onPress={() => handleDestinationPress(destination, destinations.indexOf(destination))}
              />
            ))}
          </View>
        )}
      </ScrollView>
      
      <PlaceDetailsBottomSheet
        visible={bottomSheetVisible}
        place={selectedRaw}
        onClose={handleBottomSheetClose}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    zIndex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 14,
    color: '#6B7280',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  destinationsContainer: {
    paddingHorizontal: 24,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});