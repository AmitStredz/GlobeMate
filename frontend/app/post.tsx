import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/Colors';

const { width } = Dimensions.get('window');

const categories = [
  { id: 'adventure', icon: 'compass', label: 'Adventure' },
  { id: 'nature', icon: 'tree', label: 'Nature' },
  { id: 'city', icon: 'city', label: 'City' },
  { id: 'food', icon: 'food', label: 'Food' },
  { id: 'culture', icon: 'bank', label: 'Culture' },
  { id: 'beach', icon: 'beach', label: 'Beach' },
  { id: 'mountains', icon: 'mountain', label: 'Mountains' },
  { id: 'wildlife', icon: 'paw', label: 'Wildlife' },
];

const tips = [
  'Add multiple photos for better engagement',
  'Tag your location to help others find it',
  'Use relevant hashtags for more visibility',
  'Share your honest experience',
];

export default function PostScreen() {
  const [images, setImages] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showTips, setShowTips] = useState(true);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Create Post</Text>
          <TouchableOpacity 
            style={[
              styles.postButton,
              !(images.length && location && caption) && styles.postButtonDisabled
            ]}>
            <Text style={styles.postButtonText}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Tips Card */}
        {showTips && (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsTitle}>Tips for Better Posts</Text>
              <TouchableOpacity onPress={() => setShowTips(false)}>
                <Ionicons name="close-circle" size={24} color={Colors.text.secondary} />
              </TouchableOpacity>
            </View>
            {tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.secondary.main} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Image Picker */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagePickerContainer}>
          <TouchableOpacity style={styles.addImageButton} onPress={pickImage}>
            <LinearGradient
              colors={[Colors.secondary.main, Colors.secondary.dark]}
              style={styles.addImageGradient}>
              <Ionicons name="camera" size={32} color={Colors.text.light} />
              <Text style={styles.addImageText}>Add Photos</Text>
            </LinearGradient>
          </TouchableOpacity>
          {images.map((uri, index) => (
            <View key={index} style={styles.imagePreviewContainer}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => {
                  setImages(images.filter((_, i) => i !== index));
                }}>
                <LinearGradient
                  colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)']}
                  style={styles.removeImageGradient}>
                  <Ionicons name="close" size={20} color={Colors.text.light} />
                </LinearGradient>
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>Cover</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Location Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Location</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location" size={24} color={Colors.secondary.main} />
            <TextInput
              style={styles.input}
              placeholder="Add location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={Colors.text.secondary}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.inputLabel}>Categories</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  selectedCategories.includes(category.id) && styles.selectedCategoryButton,
                ]}
                onPress={() => toggleCategory(category.id)}>
                <MaterialCommunityIcons
                  name={category.icon}
                  size={24}
                  color={selectedCategories.includes(category.id) ? Colors.text.light : Colors.text.primary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategories.includes(category.id) && styles.selectedCategoryText,
                  ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Caption Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Share your experience</Text>
          <View style={styles.captionContainer}>
            <TextInput
              style={styles.captionInput}
              placeholder="Write about your journey..."
              value={caption}
              onChangeText={setCaption}
              multiline
              placeholderTextColor={Colors.text.secondary}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.additionalOptions}>
          <TouchableOpacity style={styles.optionButton}>
            <Ionicons name="people-outline" size={24} color={Colors.text.primary} />
            <Text style={styles.optionText}>Tag Travel Buddies</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.optionButton}>
            <Ionicons name="map-outline" size={24} color={Colors.text.primary} />
            <Text style={styles.optionText}>Add to Trip</Text>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
  },
  postButton: {
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: Colors.text.secondary,
    opacity: 0.5,
  },
  postButtonText: {
    color: Colors.text.light,
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
  },
  tipsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  tipText: {
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.secondary,
  },
  imagePickerContainer: {
    padding: 16,
  },
  addImageButton: {
    width: width * 0.4,
    height: width * 0.4,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 12,
  },
  addImageGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addImageText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.light,
  },
  imagePreviewContainer: {
    width: width * 0.4,
    height: width * 0.4,
    marginRight: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  removeImageGradient: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: Colors.secondary.main,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coverBadgeText: {
    color: Colors.text.light,
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  inputSection: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.primary,
  },
  categoriesSection: {
    padding: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  selectedCategoryButton: {
    backgroundColor: Colors.secondary.main,
  },
  categoryText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.primary,
  },
  selectedCategoryText: {
    color: Colors.text.light,
  },
  captionContainer: {
    backgroundColor: Colors.background.card,
    borderRadius: 12,
    padding: 12,
  },
  captionInput: {
    minHeight: 120,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: Colors.text.primary,
  },
  additionalOptions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  optionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: Colors.text.primary,
  },
}); 