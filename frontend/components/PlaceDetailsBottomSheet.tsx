import React, {
  useMemo,
  useRef,
  useEffect,
  useCallback,
  useState,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import {
  Star,
  MapPin,
  Globe,
  Link as LinkIcon,
  Users,
  Tag,
  Compass,
  Navigation,
  Phone,
  Clock,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface PlaceDetailsBottomSheetProps {
  visible: boolean;
  place: any | null;
  onClose: () => void;
}

export const PlaceDetailsBottomSheet: React.FC<
  PlaceDetailsBottomSheetProps
> = ({ visible, place, onClose }) => {
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['60%', '95%'], []);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

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

  const handleSheetChanges = useCallback(
    (index: number) => {
      if (index === -1) {
        onClose();
      }
    },
    [onClose]
  );

  const formatPlaceType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTypeColor = (type: string) => {
    const colors = {
      tourist_attraction: '#FF6B6B',
      restaurant: '#4ECDC4',
      lodging: '#45B7D1',
      park: '#96CEB4',
      shopping_mall: '#FFEAA7',
      hospital: '#FF7675',
      school: '#A29BFE',
      bank: '#6C5CE7',
      gas_station: '#FD79A8',
      point_of_interest: '#00B894',
      establishment: '#2D3436',
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

  // Fetch weather from OpenWeather API
  useEffect(() => {
    const fetchWeather = async (lat: number, lon: number) => {
      setWeather(null);
      setWeatherError(null);
      setWeatherLoading(true);
      try {
        const apiKey =
          process.env.REACT_NATIVE_OPEN_WEATHER_API_KEY ||
          process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY ||
          '8ca38e8254b471d2f2bc34637d090fa4';
        if (!apiKey) throw new Error('No OpenWeather API key found in env');
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&exclude=alerts,hourly,minutely`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch weather');
        const data = await res.json();
        setWeather(data);
      } catch (err: any) {
        setWeatherError(err.message || 'Error fetching weather');
      } finally {
        setWeatherLoading(false);
      }
    };
    if (visible && place?.geometry?.location) {
      fetchWeather(place.geometry.location.lat, place.geometry.location.lng);
    }
  }, [visible, place]);

  if (!place) return null;

  // Dummy local hosts data
  const localHosts = [
    {
      id: 'host1',
      name: 'Amit Sharma',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      phone: '+91 98765 43210',
      location: place.formatted_address || 'Current Location',
      type: 'Guide',
      services: ['City Tours', 'Food Walks'],
      messagingOptIn: true,
    },
    {
      id: 'host2',
      name: 'Priya Verma',
      photo: 'https://randomuser.me/api/portraits/women/44.jpg',
      phone: '+91 91234 56789',
      location: place.formatted_address || 'Current Location',
      type: 'Local Friend',
      services: ['Shopping Help', 'Cultural Exchange'],
      messagingOptIn: true,
    },
    {
      id: 'host3',
      name: 'John Lee',
      photo: 'https://randomuser.me/api/portraits/men/65.jpg',
      phone: '+91 99887 77665',
      location: place.formatted_address || 'Current Location',
      type: 'Transport',
      services: ['Airport Pickup', 'Local Rides'],
      messagingOptIn: false,
    },
    {
      id: 'host4',
      name: 'Sara Ali',
      photo: 'https://randomuser.me/api/portraits/women/68.jpg',
      phone: '+91 90000 12345',
      location: place.formatted_address || 'Current Location',
      type: 'Foodie',
      services: ['Home Meals', 'Cooking Classes'],
      messagingOptIn: true,
    },
    {
      id: 'host5',
      name: 'Carlos Mendes',
      photo: 'https://randomuser.me/api/portraits/men/80.jpg',
      phone: '+91 91111 22222',
      location: place.formatted_address || 'Current Location',
      type: 'Adventure',
      services: ['Trekking', 'Outdoor Activities'],
      messagingOptIn: true,
    },
  ];

  const handleCallHost = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
  };

  const handleMessageHost = (host: any) => {
    // Dummy action: In real app, navigate to chat or open messaging
    alert(`Messaging ${host.name}`);
  };

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
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.title} numberOfLines={2}>
            {place.name}
          </Text>
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
              {place.geometry.location.lat.toFixed(6)},{' '}
              {place.geometry.location.lng.toFixed(6)}
            </Text>
          )}
        </View>

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
            <Text style={[styles.actionText, styles.actionTextSecondary]}>
              View in Maps
            </Text>
          </TouchableOpacity>
        </View>

        {/* Weather Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={20} color="#00B894" />
            <Text style={styles.cardTitle}>Weather</Text>
          </View>
          {weatherLoading && (
            <View style={{ alignItems: 'center', paddingVertical: 10 }}>
              <ActivityIndicator size="small" color="#00B894" />
              <Text style={{ color: '#7F8C8D', marginTop: 6 }}>
                Loading weather...
              </Text>
            </View>
          )}
          {weatherError && (
            <Text style={{ color: 'red', paddingVertical: 10 }}>
              {weatherError}
            </Text>
          )}
          {weather && weather.current && (
            <View style={{ gap: 8 }}>
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}
              >
                {weather.current.weather?.[0]?.icon && (
                  <Image
                    source={{
                      uri: `https://openweathermap.org/img/wn/${weather.current.weather[0].icon}@2x.png`,
                    }}
                    style={{ width: 48, height: 48 }}
                  />
                )}
                <View>
                  <Text style={styles.weatherText}>
                    <Text style={styles.weatherValue}>
                      {weather.current.weather?.[0]?.main}
                    </Text>{' '}
                    - {weather.current.weather?.[0]?.description}
                  </Text>
                  <Text style={styles.weatherText}>
                    Now:{' '}
                    <Text style={styles.weatherValue}>
                      {weather.current.temp}°C
                    </Text>{' '}
                    (Feels like {weather.current.feels_like}°C)
                  </Text>
                </View>
              </View>
              <Text style={styles.weatherText}>
                Humidity:{' '}
                <Text style={styles.weatherValue}>
                  {weather.current.humidity}%
                </Text>
              </Text>
              <Text style={styles.weatherText}>
                Pressure:{' '}
                <Text style={styles.weatherValue}>
                  {weather.current.pressure} hPa
                </Text>
              </Text>
              <Text style={styles.weatherText}>
                Dew Point:{' '}
                <Text style={styles.weatherValue}>
                  {weather.current.dew_point}°C
                </Text>
              </Text>
              <Text style={styles.weatherText}>
                UV Index:{' '}
                <Text style={styles.weatherValue}>{weather.current.uvi}</Text>
              </Text>
              <Text style={styles.weatherText}>
                Clouds:{' '}
                <Text style={styles.weatherValue}>
                  {weather.current.clouds}%
                </Text>
              </Text>
              <Text style={styles.weatherText}>
                Visibility:{' '}
                <Text style={styles.weatherValue}>
                  {weather.current.visibility / 1000} km
                </Text>
              </Text>
              <Text style={styles.weatherText}>
                Wind:{' '}
                <Text style={styles.weatherValue}>
                  {weather.current.wind_speed} m/s
                </Text>{' '}
                at{' '}
                <Text style={styles.weatherValue}>
                  {weather.current.wind_deg}°
                </Text>
              </Text>
              {/* 3-day forecast */}
              {weather.daily && (
                <View style={{ marginTop: 12 }}>
                  <Text style={[styles.weatherText, { marginBottom: 4 }]}>
                    3-Day Forecast:
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{
                      flexDirection: 'row',
                      paddingHorizontal: 4,
                    }}
                    nestedScrollEnabled={true}
                  >
                    {weather.daily.slice(0, 3).map((day: any, idx: number) => {
                      const date = new Date(day.dt * 1000);
                      return (
                        <View key={idx} style={styles.forecastCard}>
                          <Text style={styles.forecastDate}>
                            {date.toLocaleDateString(undefined, {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </Text>
                          {day.weather?.[0]?.icon && (
                            <Image
                              source={{
                                uri: `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`,
                              }}
                              style={{ width: 36, height: 36 }}
                            />
                          )}
                          <Text style={styles.forecastMain}>
                            {day.weather?.[0]?.main}
                          </Text>
                          <Text style={styles.forecastDesc}>
                            {day.weather?.[0]?.description}
                          </Text>
                          <Text style={styles.forecastTemp}>
                            {Math.round(day.temp.min)}° /{' '}
                            {Math.round(day.temp.max)}°C
                          </Text>
                          {day.rain !== undefined && (
                            <Text style={styles.forecastRain}>
                              Rain: {day.rain} mm
                            </Text>
                          )}
                          <Text style={styles.forecastSummary}>
                            {day.summary}
                          </Text>
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Local Hosts Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Users size={20} color="#1E90FF" />
            <Text style={styles.cardTitle}>Local Hosts</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            nestedScrollEnabled={true}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 4 }}
          >
            {localHosts.map((host) => (
              <View key={host.id} style={styles.hostCard}>
                <Image source={{ uri: host.photo }} style={styles.hostPhoto} />
                <Text style={styles.hostName} numberOfLines={1}>{host.name}</Text>
                <Text style={styles.hostType}>{host.type}</Text>
                <Text style={styles.hostLocation} numberOfLines={1}>{host.location}</Text>
                <View style={styles.hostServicesContainer}>
                  {host.services.map((srv: string, idx: number) => (
                    <Text key={idx} style={styles.hostService}>{srv}</Text>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.hostPhoneRow}
                  onPress={() => handleCallHost(host.phone)}
                  activeOpacity={0.7}
                >
                  <Phone size={16} color="#27AE60" />
                  <Text style={styles.hostPhone}>{host.phone}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.hostMessageBtn,
                    !host.messagingOptIn && { backgroundColor: '#E0E0E0' },
                  ]}
                  onPress={() => host.messagingOptIn && handleMessageHost(host)}
                  activeOpacity={host.messagingOptIn ? 0.8 : 1}
                  disabled={!host.messagingOptIn}
                >
                  <Text style={[
                    styles.hostMessageText,
                    !host.messagingOptIn && { color: '#888' },
                  ]}>
                    {host.messagingOptIn ? 'Message' : 'No Messaging'}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
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
                  style={[
                    styles.tag,
                    { backgroundColor: getTypeColor(type) + '20' },
                  ]}
                >
                  <Text style={[styles.tagText, { color: getTypeColor(type) }]}>
                    {formatPlaceType(type)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

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
                  {place.geometry.viewport.northeast.lat.toFixed(4)},{' '}
                  {place.geometry.viewport.northeast.lng.toFixed(4)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Southwest:</Text>
                <Text style={styles.detailValue}>
                  {place.geometry.viewport.southwest.lat.toFixed(4)},{' '}
                  {place.geometry.viewport.southwest.lng.toFixed(4)}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </BottomSheetScrollView>
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
  weatherText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7F8C8D',
  },
  weatherValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  forecastCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  forecastDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 2,
  },
  forecastMain: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2C3E50',
  },
  forecastDesc: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 2,
    textAlign: 'center',
  },
  forecastTemp: {
    fontSize: 13,
    fontWeight: '500',
    color: '#E67E22',
    marginBottom: 2,
  },
  forecastRain: {
    fontSize: 12,
    color: '#3498DB',
    marginBottom: 2,
  },
  forecastSummary: {
    fontSize: 11,
    color: '#636e72',
    textAlign: 'center',
    marginTop: 2,
  },
  hostCard: {
    width: 180,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  hostPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    backgroundColor: '#E0E0E0',
  },
  hostName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 2,
    textAlign: 'center',
  },
  hostType: {
    fontSize: 13,
    color: '#1E90FF',
    fontWeight: '600',
    marginBottom: 2,
  },
  hostLocation: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
    textAlign: 'center',
  },
  hostServicesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
    justifyContent: 'center',
  },
  hostService: {
    backgroundColor: '#E3F2FD',
    color: '#1976D2',
    fontSize: 11,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 2,
    marginBottom: 2,
  },
  hostPhoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  hostPhone: {
    fontSize: 12,
    color: '#27AE60',
    fontWeight: '600',
  },
  hostMessageBtn: {
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 2,
  },
  hostMessageText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
});
