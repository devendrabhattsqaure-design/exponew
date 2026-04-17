import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import PremiumButton from '../components/PremiumButton';
import { Mail, Lock, Globe as Google } from 'lucide-react-native';
import { supabase } from '../config/supabase';
import { useAuth } from '../context/AuthContext';

const BACKEND_URL = 'http://192.168.18.23:5000/api/auth/sync';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // Global auth state

  const handleOAuthLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'exponew://login',
        },
      });

      if (error) throw error;
      
      // Note: In real production, the session check happens after redirect
      // For this UI mockup, we simulate the success and sync
      handleSyncUser({
        id: 'mock-uuid-123',
        email: 'player@example.com',
        name: 'Pro Player',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'
      });

    } catch (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    }
  };

  const handleSyncUser = async (userData) => {
    try {
      const response = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Backend sync failed', error);
      navigation.replace('Main'); // Fallback to main app even if sync fails in prototype
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to access your premium turf bookings</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Mail size={20} color={Colors.onSurfaceVariant} style={styles.icon} />
            <TextInput 
              placeholder="Email address"
              placeholderTextColor={Colors.onSurfaceVariant + '80'}
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Lock size={20} color={Colors.onSurfaceVariant} style={styles.icon} />
            <TextInput 
              placeholder="Password"
              placeholderTextColor={Colors.onSurfaceVariant + '80'}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PremiumButton 
            title={loading ? <ActivityIndicator color="#fff" /> : "Sign In"}
            onPress={() => navigation.replace('Main')}
            style={styles.loginBtn}
          />

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <TouchableOpacity 
            style={styles.googleBtn} 
            onPress={handleOAuthLogin}
            disabled={loading}
          >
            <Google size={20} color={Colors.onBackground} />
            <Text style={styles.googleBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.signUpText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
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
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  loginBtn: {
    width: '100%',
    height: 64,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceContainer,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '800',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 64,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceContainer,
    backgroundColor: '#fff',
  },
  googleBtnText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
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
  signUpText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 14,
  }
});

export default LoginScreen;
