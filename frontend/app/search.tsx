import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';
import { DestinationCard } from '@/components/DestinationCard';
import { destinations } from '@/constants/DummyData';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'all', label: 'All', icon: 'earth' },
  { id: 'mountains', label: 'Mountains', icon: 'mountain' },
  { id: 'beaches', label: 'Beaches', icon: 'beach' },
  { id: 'cities', label: 'Cities', icon: 'city' },
  { id: 'countryside', label: 'Countryside', icon: 'tree' },
  { id: 'historical', label: 'Historical', icon: 'landmark' },
  { id: 'adventure', label: 'Adventure', icon: 'compass' },
];

const popularSearches = [
  'Swiss Alps',
  'Bali Beaches',
  'Tokyo City',
  'Northern Lights',
  'Safari Adventure',
];

const filters = [
  { label: 'Price Range', icon: 'cash' },
  { label: 'Rating 4.5+', icon: 'star' },
  { label: 'Season', icon: 'thermometer' },
  { label: 'Activities', icon: 'bicycle' },
];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      destination.country.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'all') {
      return matchesSearch;
    }
    return matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView stickyHeaderIndices={[0]}>
        {/* Search Header */}
        <View style={styles.searchHeader}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={20} color={Colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Where do you want to go?"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.text.secondary}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {searchQuery.length === 0 ? (
          <>
            {/* Popular Searches */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popular Searches</Text>
              <View style={styles.popularSearches}>
                {popularSearches.map((search) => (
                  <TouchableOpacity
                    key={search}
                    style={styles.popularSearchButton}
                    onPress={() => setSearchQuery(search)}>
                    <Ionicons name="trending-up" size={16} color={Colors.secondary.main} />
                    <Text style={styles.popularSearchText}>{search}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryCard,
                      selectedCategory === category.id && styles.selectedCategoryCard,
                    ]}
                    onPress={() => setSelectedCategory(category.id)}>
                    <MaterialCommunityIcons
                      name={category.icon}
                      size={24}
                      color={selectedCategory === category.id ? Colors.text.light : Colors.secondary.main}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        selectedCategory === category.id && styles.selectedCategoryText,
                      ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Featured Destinations */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Destinations</Text>
                <TouchableOpacity>
                  <Text style={styles.seeAllButton}>See All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.featuredList}>
                {destinations.slice(0, 3).map((destination) => (
                  <TouchableOpacity key={destination.id} style={styles.featuredCard}>
                    <Image source={{ uri: destination.image }} style={styles.featuredImage} />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.8)']}
                      style={styles.featuredGradient}>
                      <Text style={styles.featuredName}>{destination.name}</Text>
                      <View style={styles.featuredLocation}>
                        <Ionicons name="location" size={14} color={Colors.text.light} />
                        <Text style={styles.featuredLocationText}>{destination.location}</Text>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        ) : (
          <>
            {/* Active Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersContainer}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter.label}
                  style={[
                    styles.filterButton,
                    activeFilters.includes(filter.label) && styles.activeFilterButton,
                  ]}
                  onPress={() => toggleFilter(filter.label)}>
                  <MaterialCommunityIcons
                    name={filter.icon}
                    size={18}
                    color={activeFilters.includes(filter.label) ? Colors.text.light : Colors.text.primary}
                  />
                  <Text
                    style={[
                      styles.filterText,
                      activeFilters.includes(filter.label) && styles.activeFilterText,
                    ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Search Results */}
            <View style={styles.resultsContainer}>
              <Text style={styles.resultsText}>
                {filteredDestinations.length} destinations found
              </Text>
              {filteredDestinations.map((destination) => (
                <DestinationCard
                  key={destination.id}
                  destination={destination}
                  onPress={() => {
                    // Navigate to destination details
                  }}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.main,
  },
  searchHeader: {
    backgroundColor: Colors.background.main,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: Colors.text.primary,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  popularSearches: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  popularSearchText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: (width - 64) / 3,
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  selectedCategoryCard: {
    backgroundColor: Colors.secondary.main,
  },
  categoryText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 12,
    color: Colors.text.primary,
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: Colors.text.light,
  },
  featuredList: {
    marginTop: 12,
  },
  featuredCard: {
    width: width * 0.7,
    height: 200,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
  featuredGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    height: '50%',
  },
  featuredName: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.light,
  },
  featuredLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  featuredLocationText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.light,
    marginLeft: 4,
  },
  filtersContainer: {
    padding: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
  },
  activeFilterButton: {
    backgroundColor: Colors.secondary.main,
  },
  filterText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },
  activeFilterText: {
    color: Colors.text.light,
  },
  resultsContainer: {
    padding: 16,
  },
  resultsText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  seeAllButton: {
    color: Colors.secondary.main,
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
  },
}); 