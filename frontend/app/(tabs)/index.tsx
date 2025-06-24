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
import Modal from 'react-native-modal';
import { FiExternalLink } from 'react-icons/fi';

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
  const insets = useSafeAreaInsets();

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/getPlacesFromGoogleMap/`, {
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
      {/* Bottom Sheet Modal for Details */}
      <Modal
        isVisible={!!selectedDestination}
        onBackdropPress={() => { setSelectedDestination(null); setSelectedRaw(null); setSelectedIndex(null); }}
        onSwipeComplete={() => { setSelectedDestination(null); setSelectedRaw(null); setSelectedIndex(null); }}
        swipeDirection={['down']}
        style={{ justifyContent: 'flex-end', margin: 0 }}
        backdropOpacity={0.4}
      >
        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 0, minHeight: 400, overflow: 'hidden' }}>
          {/* Top close button */}
          <Pressable onPress={() => { setSelectedDestination(null); setSelectedRaw(null); setSelectedIndex(null); }} style={{ position: 'absolute', top: 18, right: 18, zIndex: 2, backgroundColor: '#F3F4F6', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', elevation: 2 }}>
            <Text style={{ fontSize: 22, color: '#374151', fontWeight: 700 }}>✕</Text>
          </Pressable>
          <View style={{ alignItems: 'center', paddingTop: 32, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }}>
            <Pressable onPress={() => setImageModalVisible(true)}>
              <Image source={{ uri: selectedDestination?.image }} style={{ width: 200, height: 200, borderRadius: 18, marginBottom: 10, borderWidth: 2, borderColor: '#F3F4F6', resizeMode: 'cover' }} />
            </Pressable>
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#111827', marginBottom: 2, textAlign: 'center' }}>{selectedDestination?.title}</Text>
            <Text style={{ fontSize: 16, color: '#6B7280', marginBottom: 4, textAlign: 'center' }}>{selectedDestination?.location}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <Text style={{ fontSize: 18, color: '#F59E0B', fontWeight: 700 }}>★ {selectedDestination?.rating}</Text>
              <Text style={{ fontSize: 15, color: '#6B7280' }}>({selectedRaw?.user_ratings_total || 0} reviews)</Text>
            </View>
          </View>
          {selectedRaw && (
            <View style={{ padding: 20, paddingTop: 12 }}>
              <Text style={{ ...LABEL_STYLE, fontSize: 16, marginBottom: 10 } as any}>Details</Text>
              <View style={{ flexDirection: 'row', marginBottom: 14 }}>
                <View style={[PILL_STYLE, { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE' }]}> 
                  <Text style={{ color: '#0369A1', fontWeight: 700, marginRight: 4 }}>Latitude:</Text>
                  <Text style={{ color: '#0369A1', fontWeight: 600 }}>{selectedRaw.geometry?.location?.lat ?? 'N/A'}</Text>
                </View>
                <View style={[PILL_STYLE, { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF9C3' }]}> 
                  <Text style={{ color: '#CA8A04', fontWeight: 700, marginRight: 4 }}>Longitude:</Text>
                  <Text style={{ color: '#CA8A04', fontWeight: 600 }}>{selectedRaw.geometry?.location?.lng ?? 'N/A'}</Text>
                </View>
              </View>
              <View style={{ backgroundColor: '#F3F4F6', borderRadius: 12, padding: 14, marginBottom: 14 }}>
                <Text style={{ ...LABEL_STYLE, marginBottom: 2 }}>Address</Text>
                <Text style={VALUE_STYLE as any}>{selectedRaw.formatted_address}</Text>
              </View>
              <View style={{ marginBottom: 14 }}>
                <Text style={LABEL_STYLE as any}>Types</Text>
                <Text style={{ ...VALUE_STYLE, fontWeight: 500, fontSize: 14 } as any}>{selectedRaw.types?.join(', ')}</Text>
              </View>
              <View style={{ marginBottom: 14 }}>
                {selectedRaw.url ? (
                  <TouchableOpacity onPress={() => { selectedRaw.url && Linking.openURL(selectedRaw.url); }} style={{ backgroundColor: '#E0E7FF', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 8, alignSelf: 'flex-start', marginTop: 4, flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ color: '#3730A3', fontWeight: 700, fontSize: 15 }}>Open in Maps</Text>
                    <FiExternalLink style={{ color: '#3730A3', fontSize: 18, marginLeft: 6 }} />
                  </TouchableOpacity>
                ) : (
                  <Text style={{ color: '#6B7280' }}>N/A</Text>
                )}
              </View>
              <View style={{ marginTop: 10, marginBottom: 4 }}>
                <Text style={{ ...LABEL_STYLE, fontSize: 15, marginBottom: 6 } as any}>Categories</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                  {selectedRaw.types?.map((type: string) => (
                    <View key={type} style={{ backgroundColor: '#E0E7FF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 }}>
                      <Text style={{ color: '#3730A3', fontWeight: 500, fontSize: 13 }}>{type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
      {/* Fullscreen image modal */}
      <Modal
        isVisible={imageModalVisible}
        onBackdropPress={() => setImageModalVisible(false)}
        style={{ justifyContent: 'center', alignItems: 'center' }}
        backdropOpacity={0.95}
      >
        <View style={{ backgroundColor: 'rgba(0,0,0,0.95)', borderRadius: 18, padding: 20 }}>
          <Pressable style={{ position: 'absolute', top: 20, right: 20, zIndex: 2 }} onPress={() => setImageModalVisible(false)}>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: 700 }}>✕</Text>
          </Pressable>
          <Image source={{ uri: selectedDestination?.image }} style={{ width: '100%', height: '100%', borderRadius: 18, resizeMode: 'contain' }} />
        </View>
      </Modal>
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