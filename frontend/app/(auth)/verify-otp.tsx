import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Alert,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { Shield } from 'lucide-react-native';

export default function VerifyOTP() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  
  const { verifyOTP, isLoading, pendingEmail } = useAuth();

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter the verification code');
      return;
    }
    
    if (otp.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }
    
    setError('');
    const result = await verifyOTP(otp);
    if (result === true) {
      router.replace('/(tabs)');
    } else {
      setError(result);
    }
  };

  const handleResendCode = () => {
    Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Shield size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.title}>Verify Your Email</Text>
          <Text style={styles.subtitle}>
            We've sent a 6-digit code to {pendingEmail}
          </Text>
          <Text style={styles.hint}>
            Enter the code below to verify your account
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.otpContainer}>
            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={[styles.otpInput, error && styles.otpInputError, {
                textAlign: "center",
                fontSize: 24,
                letterSpacing: 8,
              }]}
              placeholder="123456"
              placeholderTextColor="#9CA3AF"
              value={otp}
              onChangeText={(text) => {
                setOtp(text.replace(/[^0-9]/g, ''));
                setError('');
              }}
              keyboardType="numeric"
              maxLength={6}
            />
            {error && <Text style={styles.error}>{error}</Text>}
          </View>

          <TouchableOpacity 
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerifyOTP}
            disabled={isLoading}
          >
            {isLoading ? (
              <LoadingSpinner color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify Account</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code? </Text>
            <TouchableOpacity onPress={handleResendCode}>
              <Text style={styles.resendLink}>Resend Code</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.tipText}>
            💡 Tip: Use code "123456" for demo purposes
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 48,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#14B8A6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  otpContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  otpInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: 8,
  },
  otpInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  error: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 8,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#14B8A6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#6B7280',
  },
  resendLink: {
    fontSize: 14,
    color: '#14B8A6',
    fontWeight: '600',
  },
  tipText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});