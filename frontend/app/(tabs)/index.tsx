import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { DestinationCard } from '@/components/DestinationCard';
import { SearchBar } from '@/components/SearchBar';
import { useAuth } from '@/hooks/useAuth';
import { Destination } from '@/types';
import { Bell, MapPin } from 'lucide-react-native';
import { API_BASE_URL } from '../../api';

const DUMMY_IMAGE = 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800';

export default function Home() {
  const { user, token } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/getPlaces/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email:"ammu@gmail.com" }),
      });
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error('Invalid server response');
      }
      if (!res.ok) {
        // If the API returns a 'detail' field, show it as the error message
        if (data && typeof data === 'object' && data.detail) {
          throw new Error(data.detail);
        } else {
          throw new Error(`API error: ${res.status}`);
        }
      }
      // Map API response to Destination[]
      const places = data.places || [];
      const mapped: Destination[] = places.map((place: any, idx: number) => {
        const props = place.properties || {};
        return {
          id: props.place_id || String(idx),
          title: props.name || 'Unknown Place',
          location: props.formatted || props.state || props.country || 'Unknown',
          description: props.historic?.type ? `${props.historic.type.replace('_', ' ')}${props.operator ? ' - ' + props.operator : ''}` : (props.categories?.join(', ') || 'No description'),
          image: DUMMY_IMAGE,
          price: '', // Not available in API
          rating: 4.5, // Static or random for now
          category: (props.categories && props.categories[props.categories.length - 1]) || 'General',
          tags: props.categories || [],
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name}! 👋</Text>
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
            {filteredDestinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                onPress={() => {}}
              />
            ))}
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