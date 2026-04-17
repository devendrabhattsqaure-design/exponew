import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Colors } from '../constants/Colors';
import PremiumButton from '../components/PremiumButton';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

const LoginScreen = ({ navigation }) => {
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
            title="Sign In"
            onPress={() => navigation.replace('Main')}
            style={styles.loginBtn}
          />

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
