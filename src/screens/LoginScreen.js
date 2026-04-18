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

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, syncSso } = useAuth(); // Global auth state

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigation.replace('Main');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async () => {
    setLoading(true);
    try {
      const { data, popup, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'exponew://login', // Will open deep link setup in app.json
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
         await syncSso(
           session.user.id, 
           session.user.email, 
           session.user.user_metadata?.full_name || session.user.email.split('@')[0], 
           session.user.user_metadata?.avatar_url
         );
         navigation.replace('Main');
      } else {
         throw new Error("Unable to capture SSO session. Please verify Google OAuth login.");
      }

    } catch (error) {
      Alert.alert('Error', error.message);
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
              placeholder="Password"
              placeholderTextColor={Colors.onSurfaceVariant + '80'}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={styles.input}
            />
          </View>

          <TouchableOpacity style={styles.forgotBtn}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <PremiumButton 
            title={loading ? <ActivityIndicator color="#fff" /> : "Sign In"}
            onPress={handleLogin}
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
