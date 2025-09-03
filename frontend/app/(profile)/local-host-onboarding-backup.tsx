import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Home, User, FileText, CheckCircle, Shield } from 'lucide-react-native';
import { AuthInput } from '@/components/AuthInput';
import { LOCAL_HOST_SERVICES } from '@/constants';
import { localHostAPI } from '@/api';
import { useAuth } from '@/hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LocalHostData {
  // Personal Details (pre-filled from user profile)
  fullName: string;
  age: string;
  email: string;
  phone: string;
  
  // Additional details user can edit
  address: string;
  
  // Service Details
  services: string[];
  customService: string;
  description: string;
  pricePerDay: string;
  availability: string[];
  
  // KYC Status
  kycCompleted: boolean;
}

// Availability options
const AVAILABILITY_OPTIONS = [
  { code: 'WEEKDAYS', name: 'Weekdays' },
  { code: 'WEEKENDS', name: 'Weekends' },
  { code: 'ALL_DAYS', name: 'All Days' },
  { code: 'SEASONAL', name: 'Seasonal' },
  { code: 'ON_DEMAND', name: 'On Demand' },
];

export default function LocalHostOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycVerifying, setKycVerifying] = useState(false);
  
  const [localHostData, setLocalHostData] = useState<LocalHostData>({
    fullName: '',
    age: '',
    email: '',
    phone: '',
    address: '',
    services: [],
    customService: '',
    description: '',
    pricePerDay: '',
    availability: [],
    kycCompleted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill user data on component mount
  useEffect(() => {
    if (user) {
      setLocalHostData(prev => ({
        ...prev,
        fullName: user.username || '',
        age: user.profile?.age?.toString() || '',
        email: user.email || '',
        phone: '9876543210', // Placeholder - will get from user profile when available
      }));
    }
  }, [user]);

  // Load any saved data from AsyncStorage
  useEffect(() => {
    loadSavedData();
  }, []);

  const loadSavedData = async () => {
    try {
      const savedData = await AsyncStorage.getItem('localHostDraftData');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        setLocalHostData(prev => ({ ...prev, ...parsedData }));
      }
    } catch (error) {
      console.log('No saved data found');
    }
  };

  const saveDataToStorage = async () => {
    try {
      await AsyncStorage.setItem('localHostDraftData', JSON.stringify(localHostData));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const validateCurrentStep = () => {
    const newErrors: Record<string, string> = {};
    
    if (currentStep === 1) {
      if (!localHostData.address.trim()) newErrors.address = 'Address is required';
      if (!localHostData.phone.trim()) newErrors.phone = 'Phone number is required';
    } else if (currentStep === 2) {
      if (localHostData.services.length === 0) newErrors.services = 'Select at least one service';
      if (!localHostData.description.trim()) newErrors.description = 'Service description is required';
      if (!localHostData.pricePerDay.trim()) newErrors.pricePerDay = 'Price per day is required';
      if (localHostData.availability.length === 0) newErrors.availability = 'Select your availability';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateCurrentStep()) return;
    
    // Save data to local storage after each step
    await saveDataToStorage();
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleKYCVerification = async () => {
    setKycVerifying(true);
    
    // Simulate KYC verification process
    setTimeout(async () => {
      setKycVerifying(false);
      
      Alert.alert(
        'KYC Verification',
        'KYC verification completed successfully!',
        [
          {
            text: 'Continue',
            onPress: () => {
              setLocalHostData(prev => ({ ...prev, kycCompleted: true }));
              handleFinalSubmission();
            }
          }
        ]
      );
    }, 3000); // 3 second simulation
  };

  const handleFinalSubmission = async () => {
    if (!localHostData.kycCompleted) {
      Alert.alert('Error', 'Please complete KYC verification first.');
      return;
    }

    setIsSubmitting(true);
    try {
      const applicationData = {
        fullName: localHostData.fullName,
        age: parseInt(localHostData.age),
        address: localHostData.address,
        phoneNumber: localHostData.phone,
        aadhaarNumber: '999999999999', // Dummy - will be from KYC
        panNumber: 'ABCDE1234F', // Dummy - will be from KYC
        services: localHostData.services,
        customService: localHostData.customService,
        description: localHostData.description,
        priceRange: `₹${localHostData.pricePerDay}/day`,
        availability: localHostData.availability.join(', '),
        documentsProvided: ['AADHAAR', 'PAN'], // From KYC
      };
      
      const result = await localHostAPI.submitApplication(applicationData);
      
      // Clear saved data after successful submission
      await AsyncStorage.removeItem('localHostDraftData');
      
      Alert.alert(
        'Success!', 
        'Congratulations! You are now registered as a Local Host. Your profile has been updated.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert(
        'Submission Failed', 
        error instanceof Error ? error.message : 'Failed to submit application. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <View key={index} style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar,
              index < currentStep ? styles.progressBarActive : styles.progressBarInactive
            ]} 
          />
        </View>
      ))}
    </View>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Personal Information';
      case 2: return 'Service Details';
      case 3: return 'Identity Verification';
      default: return 'Personal Information';
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalDetailsStep data={localHostData} setData={setLocalHostData} errors={errors} />;
      case 2:
        return <ServiceDetailsStep data={localHostData} setData={setLocalHostData} errors={errors} />;
      case 3:
        return <KYCVerificationStep data={localHostData} onVerify={handleKYCVerification} isVerifying={kycVerifying} />;
      default:
        return <PersonalDetailsStep data={localHostData} setData={setLocalHostData} errors={errors} />;
    }
  };

  const renderFooter = () => {
    if (currentStep === 3) {
      return (
        <View style={styles.footer}>
          {!localHostData.kycCompleted ? (
            <TouchableOpacity 
              style={[styles.nextButton, kycVerifying && styles.nextButtonDisabled]}
              onPress={handleKYCVerification}
              disabled={kycVerifying}
            >
              <Text style={styles.nextButtonText}>
                {kycVerifying ? 'Verifying...' : 'Start KYC Verification'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
              onPress={handleFinalSubmission}
              disabled={isSubmitting}
            >
              <Text style={styles.nextButtonText}>
                {isSubmitting ? 'Submitting...' : 'Complete Registration'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      );
    }

    return (
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.nextButton}
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Home size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Become a Local Host</Text>
            <Text style={styles.subtitle}>
              {getStepTitle()} - Step {currentStep} of {totalSteps}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        {renderProgressBar()}

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderStepContent()}
        </ScrollView>

        {/* Footer */}
        {renderFooter()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Personal Details Step Component
function PersonalDetailsStep({ 
  data, 
  setData, 
  errors 
}: { 
  data: LocalHostData; 
  setData: React.Dispatch<React.SetStateAction<LocalHostData>>; 
  errors: Record<string, string>; 
}) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <User size={32} color="#F97316" />
        <Text style={styles.stepTitle}>Personal Information</Text>
        <Text style={styles.stepDescription}>
          Your basic information from your profile. You can update your address and phone number.
        </Text>
      </View>

      <View style={styles.form}>
        <AuthInput
          label="Full Name"
          placeholder="Your full name"
          value={data.fullName}
          editable={false}
          style={styles.disabledInput}
        />

        <AuthInput
          label="Age"
          placeholder="Your age"
          value={data.age}
          editable={false}
          style={styles.disabledInput}
        />

        <AuthInput
          label="Email"
          placeholder="Your email"
          value={data.email}
          editable={false}
          style={styles.disabledInput}
        />

        <AuthInput
          label="Phone Number *"
          placeholder="Enter your phone number"
          value={data.phone}
          onChangeText={(text) => setData(prev => ({ ...prev, phone: text }))}
          keyboardType="phone-pad"
          error={errors.phone}
        />

        <AuthInput
          label="Full Address *"
          placeholder="Enter your complete address"
          value={data.address}
          onChangeText={(text) => setData(prev => ({ ...prev, address: text }))}
          multiline
          numberOfLines={3}
          error={errors.address}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Your name, age, and email are taken from your profile and cannot be changed here.
          </Text>
        </View>
      </View>
    </View>
  );
}

// Service Details Step Component
function ServiceDetailsStep({ 
  data, 
  setData, 
  errors 
}: { 
  data: LocalHostData; 
  setData: React.Dispatch<React.SetStateAction<LocalHostData>>; 
  errors: Record<string, string>; 
}) {
  const toggleService = (serviceCode: string) => {
    setData(prev => ({
      ...prev,
      services: prev.services.includes(serviceCode)
        ? prev.services.filter(s => s !== serviceCode)
        : [...prev.services, serviceCode]
    }));
  };

  const toggleAvailability = (availabilityCode: string) => {
    setData(prev => ({
      ...prev,
      availability: prev.availability.includes(availabilityCode)
        ? prev.availability.filter(a => a !== availabilityCode)
        : [...prev.availability, availabilityCode]
    }));
  };

  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <FileText size={32} color="#F97316" />
        <Text style={styles.stepTitle}>Service Details</Text>
        <Text style={styles.stepDescription}>
          Tell us about the services you'd like to provide to travelers.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Services Offered *</Text>
          <View style={styles.optionsGrid}>
            {LOCAL_HOST_SERVICES.map((service) => {
              const isSelected = data.services.includes(service.code);
              return (
                <TouchableOpacity
                  key={service.code}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => toggleService(service.code)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {service.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.services && <Text style={styles.errorText}>{errors.services}</Text>}
        </View>

        {data.services.includes('OTHER') && (
          <AuthInput
            label="Custom Service"
            placeholder="Describe your custom service"
            value={data.customService}
            onChangeText={(text) => setData(prev => ({ ...prev, customService: text }))}
          />
        )}

        <AuthInput
          label="Service Description *"
          placeholder="Describe your services in detail..."
          value={data.description}
          onChangeText={(text) => setData(prev => ({ ...prev, description: text }))}
          multiline
          numberOfLines={4}
          error={errors.description}
        />

        <AuthInput
          label="Price Per Day (₹) *"
          placeholder="e.g., 1500"
          value={data.pricePerDay}
          onChangeText={(text) => setData(prev => ({ ...prev, pricePerDay: text }))}
          keyboardType="numeric"
          error={errors.pricePerDay}
        />

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Availability *</Text>
          <View style={styles.optionsGrid}>
            {AVAILABILITY_OPTIONS.map((option) => {
              const isSelected = data.availability.includes(option.code);
              return (
                <TouchableOpacity
                  key={option.code}
                  style={[styles.optionButton, isSelected && styles.optionButtonSelected]}
                  onPress={() => toggleAvailability(option.code)}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {option.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {errors.availability && <Text style={styles.errorText}>{errors.availability}</Text>}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Be specific about your services and pricing. This helps travelers understand what you offer.
          </Text>
        </View>
      </View>
    </View>
  );
}

// KYC Verification Step Component
function KYCVerificationStep({ 
  data, 
  onVerify, 
  isVerifying 
}: { 
  data: LocalHostData; 
  onVerify: () => void; 
  isVerifying: boolean; 
}) {
  return (
    <View style={styles.stepContainer}>
      <View style={styles.stepHeader}>
        <Shield size={32} color="#F97316" />
        <Text style={styles.stepTitle}>Identity Verification</Text>
        <Text style={styles.stepDescription}>
          Complete KYC verification to become a verified local host.
        </Text>
      </View>

      <View style={styles.form}>
        {!data.kycCompleted ? (
          <>
            <View style={styles.kycBox}>
              <Shield size={48} color="#F97316" />
              <Text style={styles.kycTitle}>KYC Verification Required</Text>
              <Text style={styles.kycDescription}>
                To ensure the safety and security of our platform, we need to verify your identity using government-approved documents.
              </Text>
              
              <View style={styles.kycFeatures}>
                <Text style={styles.kycFeature}>✓ Secure document verification</Text>
                <Text style={styles.kycFeature}>✓ Instant verification process</Text>
                <Text style={styles.kycFeature}>✓ Government-approved documents</Text>
                <Text style={styles.kycFeature}>✓ Safe and encrypted</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                🔒 Your documents are processed securely and are not stored on our servers after verification.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.kycSuccessBox}>
            <CheckCircle size={48} color="#10B981" />
            <Text style={styles.kycSuccessTitle}>KYC Verification Complete!</Text>
            <Text style={styles.kycSuccessDescription}>
              Your identity has been successfully verified. You can now complete your local host registration.
            </Text>
          </View>
        )}
      </View>
    </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#F97316',
  },
  progressBarInactive: {
    backgroundColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  stepContainer: {
    paddingVertical: 24,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  form: {
    gap: 20,
  },
  disabledInput: {
    backgroundColor: '#F9FAFB',
    color: '#9CA3AF',
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  optionButtonSelected: {
    backgroundColor: '#FEF3E2',
    borderColor: '#F97316',
  },
  optionText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#F97316',
    fontWeight: '600',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 8,
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoText: {
    fontSize: 14,
    color: '#1E40AF',
    lineHeight: 20,
  },
  kycBox: {
    backgroundColor: '#FEF3E2',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F97316',
    marginBottom: 24,
  },
  kycTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  kycDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 24,
  },
  kycFeatures: {
    alignSelf: 'stretch',
  },
  kycFeature: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    paddingLeft: 8,
  },
  kycSuccessBox: {
    backgroundColor: '#F0FDF4',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  kycSuccessTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  kycSuccessDescription: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  nextButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
