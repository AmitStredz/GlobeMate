import React, { useState } from 'react';
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
import { Link, router } from 'expo-router';
import { AuthInput } from '@/components/AuthInput';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { UserPlus } from 'lucide-react-native';
import { GENDERS, DISTRICTS, GEOGRAPHIES } from '@/constants';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [preferredDistricts, setPreferredDistricts] = useState<string[]>([]);
  const [preferredGeographies, setPreferredGeographies] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    username?: string;
    age?: string;
    gender?: string;
    preferredDistricts?: string;
    preferredGeographies?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { signup, isLoading } = useAuth();

  const validateForm = () => {
    const newErrors: any = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!age || isNaN(Number(age)) || Number(age) < 1) newErrors.age = 'Valid age is required';
    if (!gender) newErrors.gender = 'Gender is required';
    if (preferredDistricts.length === 0) newErrors.preferredDistricts = 'Select at least one district';
    if (preferredGeographies.length === 0) newErrors.preferredGeographies = 'Select at least one geography';
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Please enter a valid email';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;
    const payload = {
      username,
      age: Number(age),
      gender,
      preferred_districts: preferredDistricts,
      preferred_geographies: preferredGeographies,
      email,
      password,
    };
    const result = await signup(payload);
    if (result === true) {
      router.push('/(auth)/verify-otp');
    } else {
      Alert.alert('Signup Failed', result);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <UserPlus size={32} color="#FFFFFF" />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us and start exploring</Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Full Name"
              placeholder="Enter your full name"
              value={username}
              onChangeText={setUsername}
              error={errors.username}
            />

            <AuthInput
              label="Age"
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              error={errors.age}
            />

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', marginBottom: 4 }}>Gender</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {GENDERS.map((g: { code: string; label: string }) => (
                  <TouchableOpacity
                    key={g.code}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      backgroundColor: gender === g.code ? '#F97316' : '#F3F4F6',
                      marginRight: 8,
                      marginBottom: 8,
                    }}
                    onPress={() => setGender(g.code)}
                  >
                    <Text style={{ color: gender === g.code ? '#fff' : '#111827' }}>{g.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.gender && <Text style={{ color: 'red', fontSize: 12 }}>{errors.gender}</Text>}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', marginBottom: 4 }}>Preferred Districts</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {DISTRICTS.map((d: { code: string; name: string }) => {
                  const selected = preferredDistricts.includes(d.code);
                  return (
                    <TouchableOpacity
                      key={d.code}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        backgroundColor: selected ? '#F97316' : '#F3F4F6',
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                      onPress={() => {
                        setPreferredDistricts((prev) =>
                          selected ? prev.filter((c) => c !== d.code) : [...prev, d.code]
                        );
                      }}
                    >
                      <Text style={{ color: selected ? '#fff' : '#111827' }}>{d.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.preferredDistricts && <Text style={{ color: 'red', fontSize: 12 }}>{errors.preferredDistricts}</Text>}
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontWeight: '600', marginBottom: 4 }}>Preferred Geographies</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {GEOGRAPHIES.map((g: { code: string; name: string }) => {
                  const selected = preferredGeographies.includes(g.code);
                  return (
                    <TouchableOpacity
                      key={g.code}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        backgroundColor: selected ? '#F97316' : '#F3F4F6',
                        marginRight: 8,
                        marginBottom: 8,
                      }}
                      onPress={() => {
                        setPreferredGeographies((prev) =>
                          selected ? prev.filter((c) => c !== g.code) : [...prev, g.code]
                        );
                      }}
                    >
                      <Text style={{ color: selected ? '#fff' : '#111827' }}>{g.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.preferredGeographies && <Text style={{ color: 'red', fontSize: 12 }}>{errors.preferredGeographies}</Text>}
            </View>

            <AuthInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
            />

            <AuthInput
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              error={errors.password}
            />

            <AuthInput
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              error={errors.confirmPassword}
            />

            <TouchableOpacity 
              style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner color="#FFFFFF" />
              ) : (
                <Text style={styles.signupButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
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
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F97316',
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
  },
  form: {
    flex: 1,
  },
  signupButton: {
    backgroundColor: '#F97316',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonDisabled: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginText: {
    fontSize: 14,
    color: '#6B7280',
  },
  loginLink: {
    fontSize: 14,
    color: '#F97316',
    fontWeight: '600',
  },
});