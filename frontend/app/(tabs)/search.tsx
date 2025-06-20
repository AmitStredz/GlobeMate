import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
} from 'react-native';
import { DestinationCard } from '@/components/DestinationCard';
import { SearchBar } from '@/components/SearchBar';
import { Destination } from '@/types';

const MOCK_DESTINATIONS: Destination[] = [
  {
    id: '1',
    title: 'Tropical Paradise Beach',
    location: 'Maldives',
    description: 'Crystal clear waters and pristine white sand beaches.',
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '$2,499',
    rating: 4.8,
    category: 'Beach',
    tags: ['tropical', 'luxury', 'romantic'],
  },
  {
    id: '2',
    title: 'Mountain Adventure Trek',
    location: 'Swiss Alps, Switzerland',
    description: 'Breathtaking mountain views and thrilling hiking trails.',
    image: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '$1,899',
    rating: 4.9,
    category: 'Adventure',
    tags: ['mountains', 'hiking', 'nature'],
  },
  {
    id: '3',
    title: 'Historic City Explorer',
    location: 'Rome, Italy',
    description: 'Discover ancient history and incredible architecture.',
    image: 'https://images.pexels.com/photos/2064827/pexels-photo-2064827.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '$1,299',
    rating: 4.7,
    category: 'Cultural',
    tags: ['history', 'culture', 'food'],
  },
  {
    id: '4',
    title: 'Desert Oasis Adventure',
    location: 'Sahara Desert, Morocco',
    description: 'Experience the magic of desert landscapes and starlit nights.',
    image: 'https://images.pexels.com/photos/2876511/pexels-photo-2876511.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '$1,599',
    rating: 4.6,
    category: 'Adventure',
    tags: ['desert', 'camping', 'unique'],
  },
  {
    id: '5',
    title: 'Island Paradise',
    location: 'Santorini, Greece',
    description: 'Beautiful sunsets and traditional Greek island charm.',
    image: 'https://images.pexels.com/photos/2171008/pexels-photo-2171008.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '$1,799',
    rating: 4.8,
    category: 'Beach',
    tags: ['islands', 'sunset', 'romantic'],
  },
];

const CATEGORIES = ['All', 'Beach', 'Adventure', 'Cultural', 'Wildlife', 'Urban'];

export default function Search() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [destinations] = useState<Destination[]>(MOCK_DESTINATIONS);

  const filteredDestinations = destinations.filter(destination => {
    const matchesQuery = destination.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || destination.category === selectedCategory;
    
    return matchesQuery && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Find your perfect destination</Text>
        
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredDestinations.length} destinations found
          </Text>
        </View>

        <View style={styles.destinationsContainer}>
          {filteredDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onPress={() => {}}
            />
          ))}
        </View>

        {filteredDestinations.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No destinations found</Text>
            <Text style={styles.emptyText}>
              Try different keywords or browse other categories
            </Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  categoriesContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingRight: 24,
  },
  categoryButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#1E40AF',
    borderColor: '#1E40AF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  resultsHeader: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
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