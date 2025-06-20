import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthInput } from '@/components/AuthInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Camera, Image as ImageIcon, MapPin } from 'lucide-react-native';

export default function AddPost() {
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; location?: string; description?: string }>({});

  const validateForm = () => {
    const newErrors: { title?: string; location?: string; description?: string } = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!location.trim()) {
      newErrors.location = 'Location is required';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    } else if (description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: () => console.log('Camera selected') },
        { text: 'Gallery', onPress: () => console.log('Gallery selected') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Success!',
        'Your travel post has been published successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setTitle('');
              setLocation('');
              setDescription('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to publish your post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Share Your Journey</Text>
          <Text style={styles.subtitle}>Tell others about your amazing travel experience</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <AuthInput
              label="Post Title"
              placeholder="Give your post a catchy title"
              value={title}
              onChangeText={setTitle}
              error={errors.title}
            />

            <AuthInput
              label="Location"
              placeholder="Where did you go?"
              value={location}
              onChangeText={setLocation}
              error={errors.location}
            />

            <View style={styles.descriptionContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.descriptionInput, errors.description && styles.inputError]}
                placeholder="Share your experience, tips, and memories..."
                placeholderTextColor="#9CA3AF"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              {errors.description && <Text style={styles.error}>{errors.description}</Text>}
            </View>

            <View style={styles.photoSection}>
              <Text style={styles.label}>Add Photos</Text>
              <TouchableOpacity style={styles.photoButton} onPress={handleAddPhoto}>
                <View style={styles.photoButtonContent}>
                  <View style={styles.photoIconContainer}>
                    <Camera size={24} color="#6B7280" />
                  </View>
                  <Text style={styles.photoButtonText}>Add photos to your post</Text>
                  <Text style={styles.photoButtonSubtext}>Tap to select from camera or gallery</Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={[styles.publishButton, isLoading && styles.publishButtonDisabled]}
              onPress={handlePublish}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner color="#FFFFFF" />
              ) : (
                <Text style={styles.publishButtonText}>Publish Post</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 24,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  descriptionInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    height: 120,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
  },
  photoSection: {
    marginBottom: 32,
  },
  photoButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  photoButtonContent: {
    alignItems: 'center',
  },
  photoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  photoButtonSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  publishButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    opacity: 0.7,
  },
  publishButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});