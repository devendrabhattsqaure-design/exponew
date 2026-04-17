import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import PremiumButton from '../components/PremiumButton';
import { User, Mail, Lock, Phone } from 'lucide-react-native';
import { supabase } from '../config/supabase';

const BACKEND_URL = 'http://192.168.18.23:5000/api/auth/sync';

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      // 1. Sign up on Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name }
        }
      });

      if (error) throw error;

      if (data.user) {
        // 2. Sync with Backend Database
        await syncWithBackend(data.user.id, email, name);
        Alert.alert('Success', 'Account created successfully!');
        navigation.replace('Main');
      }
    } catch (error) {
      Alert.alert('Sign Up Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const syncWithBackend = async (id, email, name) => {
    try {
      await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, email, name })
      });
    } catch (error) {
      console.error('Backend sync failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the elite community of turf players</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <User size={20} color={Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="Full Name"
                placeholderTextColor={Colors.onSurfaceVariant + '80'}
                value={name}
                onChangeText={setName}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="Email address"
                placeholderTextColor={Colors.onSurfaceVariant + '80'}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="Create Password"
                placeholderTextColor={Colors.onSurfaceVariant + '80'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <PremiumButton 
              title={loading ? <ActivityIndicator color="#fff" /> : "Create Account"}
              onPress={handleSignUp}
              style={styles.signUpBtn}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginText}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 48,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.onBackground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    height: 64,
  },
  icon: {
    marginRight: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.onBackground,
    fontWeight: '600',
  },
  signUpBtn: {
    width: '100%',
    height: 64,
    marginTop: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: Colors.onSurfaceVariant,
    fontSize: 14,
  },
  loginText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  }
});

export default SignUpScreen;
