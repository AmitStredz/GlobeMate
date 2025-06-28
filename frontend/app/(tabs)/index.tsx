import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Image,
  Linking,
  Platform,
  Pressable,
} from 'react-native';
import { DestinationCard } from '@/components/DestinationCard';
import { SearchBar } from '@/components/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { Destination } from '@/types';
import { Bell, MapPin } from 'lucide-react-native';
import { API_BASE_URL } from '../../api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PlaceDetailsBottomSheet } from '@/components/PlaceDetailsBottomSheet';

const DUMMY_IMAGE = 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800';

const PILL_STYLE = {
  backgroundColor: '#EEF2FF',
  borderRadius: 16,
  paddingHorizontal: 14,
  paddingVertical: 6,
  marginRight: 8,
  marginBottom: 8,
};

const LABEL_STYLE = {
  fontWeight: 700,
  color: '#1E40AF',
  fontSize: 13,
  marginBottom: 2,
};

const VALUE_STYLE = {
  color: '#111827',
  fontWeight: 600,
  fontSize: 15,
};

export default function Home() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedRaw, setSelectedRaw] = useState<any>(null); // For showing all details in modal
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [rawPlaces, setRawPlaces] = useState<any[]>([]);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/user/places/getAllPlaces/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Invalid server response');
      }
      if (!res.ok) {
        if (data && typeof data === 'object' && data.detail) {
          throw new Error(data.detail);
        } else {
          throw new Error(`API error: ${res.status}`);
        }
      }
      // Map API response to Destination[]
      const places = data.places || [];
      setRawPlaces(places);
      const mapped: Destination[] = places.map((place: any, idx: number) => {
        return {
          id: place.name + idx,
          title: place.name || 'Unknown Place',
          location: place.formatted_address || 'Unknown',
          description: place.types?.join(', ') || 'No description',
          image: place.photo_url || DUMMY_IMAGE,
          price: '',
          rating: place.rating || 0,
          category: place.types?.[0] || 'General',
          tags: place.types || [],
        };
      });
      setDestinations(mapped);
    } catch (err: any) {
      setError(err.message || 'Unknown error');
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
    destination.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top || 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.username}! 👋</Text>
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
          onFilterPress={() => {}}
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
          <View style={{ alignItems: 'center', padding: 32 }}>
            <Text>Loading...</Text>
          </View>
        ) : error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Error</Text>
            <Text style={styles.emptyText}>{error}</Text>
            <TouchableOpacity onPress={fetchFeed} style={{ marginTop: 16 }}>
              <Text style={{ color: '#1E40AF', fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.destinationsContainer}>
            {filteredDestinations.map((destination, idx) => {
              // Find the index in the original destinations array
              const originalIdx = destinations.findIndex(
                d => d.title === destination.title && d.location === destination.location && d.image === destination.image
              );
              return (
                <DestinationCard
                  key={idx}
                  destination={destination}
                  onPress={() => {
                    setSelectedDestination(destination);
                    setSelectedIndex(originalIdx);
                    setSelectedRaw(originalIdx !== -1 ? (rawPlaces?.[originalIdx] || null) : null);
                    setBottomSheetVisible(true);
                  }}
                />
              );
            })}
            {filteredDestinations.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No destinations found</Text>
                <Text style={styles.emptyText}>
                  Try adjusting your search or explore our featured destinations
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
      <PlaceDetailsBottomSheet
        visible={bottomSheetVisible}
        place={selectedRaw}
        onClose={() => setBottomSheetVisible(false)}
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
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});