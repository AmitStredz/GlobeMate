import React, { useMemo, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView, Dimensions, Image } from 'react-native';
import { BottomSheetModal, BottomSheetView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Star, MapPin, Globe, Link as LinkIcon, Users, Tag, Compass, Navigation, Phone, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface PlaceDetailsBottomSheetProps {
  visible: boolean;
  place: any | null;
  onClose: () => void;
}

export const PlaceDetailsBottomSheet: React.FC<PlaceDetailsBottomSheetProps> = ({ 
  visible, 
  place, 
  onClose 
}) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%', '95%'], []);

  // Backdrop component
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  useEffect(() => {
    if (visible && place) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible, place]);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      onClose();
    }
  }, [onClose]);

  const formatPlaceType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'tourist_attraction': '#FF6B6B',
      'restaurant': '#4ECDC4',
      'lodging': '#45B7D1',
      'park': '#96CEB4',
      'shopping_mall': '#FFEAA7',
      'hospital': '#FF7675',
      'school': '#A29BFE',
      'bank': '#6C5CE7',
      'gas_station': '#FD79A8',
      'point_of_interest': '#00B894',
      'establishment': '#2D3436'
    };
    return colors[type as keyof typeof colors] || '#74B9FF';
  };

  const openInMaps = () => {
    if (place?.url) {
      Linking.openURL(place.url);
    } else if (place?.geometry?.location) {
      const { lat, lng } = place.geometry.location;
      const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  const openDirections = () => {
    if (place?.geometry?.location) {
      const { lat, lng } = place.geometry.location;
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      Linking.openURL(url);
    }
  };

  if (!place) return null;

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      snapPoints={snapPoints}
      enablePanDownToClose
      onDismiss={onClose}
      onChange={handleSheetChanges}
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetView style={styles.container}>
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Photo Section */}
          {place.photo_url && (
            <Image
              source={{ uri: place.photo_url }}
              style={styles.placePhoto}
              resizeMode="cover"
            />
          )}
          {/* Header Section */}
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{place.name}</Text>
            {place.rating && (
              <View style={styles.ratingContainer}>
                <View style={styles.ratingBadge}>
                  <Star size={16} color="#FFD700" fill="#FFD700" />
                  <Text style={styles.ratingText}>{place.rating}</Text>
                </View>
                <Text style={styles.reviewCount}>
                  ({place.user_ratings_total?.toLocaleString() || 0} reviews)
                </Text>
              </View>
            )}
          </View>

          {/* Address Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MapPin size={20} color="#4A90E2" />
              <Text style={styles.cardTitle}>Location</Text>
            </View>
            <Text style={styles.address}>{place.formatted_address}</Text>
            {place.geometry?.location && (
              <Text style={styles.coordinates}>
                {place.geometry.location.lat.toFixed(6)}, {place.geometry.location.lng.toFixed(6)}
              </Text>
            )}
          </View>

          {/* Place Types */}
          {place.types && place.types.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Tag size={20} color="#9B59B6" />
                <Text style={styles.cardTitle}>Categories</Text>
              </View>
              <View style={styles.tagsContainer}>
                {place.types.slice(0, 6).map((type: string, index: number) => (
                  <View 
                    key={index} 
                    style={[styles.tag, { backgroundColor: getTypeColor(type) + '20' }]}
                  >
                    <Text style={[styles.tagText, { color: getTypeColor(type) }]}>
                      {formatPlaceType(type)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={openDirections}
              activeOpacity={0.8}
            >
              <View style={styles.actionIcon}>
                <Navigation size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.actionText}>Directions</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={openInMaps}
              activeOpacity={0.8}
            >
              <View style={[styles.actionIcon, styles.actionIconSecondary]}>
                <Globe size={20} color="#4A90E2" />
              </View>
              <Text style={[styles.actionText, styles.actionTextSecondary]}>View in Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Details Section */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Compass size={20} color="#E74C3C" />
              <Text style={styles.cardTitle}>Details</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Place ID:</Text>
              <Text style={styles.detailValue}>{place.id}</Text>
            </View>
            {place.geometry?.viewport && (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Northeast:</Text>
                  <Text style={styles.detailValue}>
                    {place.geometry.viewport.northeast.lat.toFixed(4)}, {place.geometry.viewport.northeast.lng.toFixed(4)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Southwest:</Text>
                  <Text style={styles.detailValue}>
                    {place.geometry.viewport.southwest.lat.toFixed(4)}, {place.geometry.viewport.southwest.lng.toFixed(4)}
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* Bottom Spacing */}
          <View style={styles.bottomSpacing} />
        </ScrollView>
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sheetBg: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handle: {
    backgroundColor: '#E0E0E0',
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
    lineHeight: 30,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F57C00',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginLeft: 8,
  },
  address: {
    fontSize: 15,
    color: '#34495E',
    lineHeight: 22,
    marginBottom: 6,
  },
  coordinates: {
    fontSize: 13,
    color: '#7F8C8D',
    fontFamily: 'monospace',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#4A90E2',
  },
  actionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionIconSecondary: {
    backgroundColor: '#F0F8FF',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionTextSecondary: {
    color: '#4A90E2',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#2C3E50',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  bottomSpacing: {
    height: 20,
  },
  placePhoto: {
    width: width,
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 0,
    backgroundColor: '#F0F0F0',
  },
});