import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Colors } from '../constants/Colors';
import PremiumButton from '../components/PremiumButton';
import { User, Mail, Lock, Phone } from 'lucide-react-native';

const SignUpScreen = ({ navigation }) => {
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
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="Email address"
                placeholderTextColor={Colors.onSurfaceVariant + '80'}
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Phone size={20} color={Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="Phone Number"
                placeholderTextColor={Colors.onSurfaceVariant + '80'}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color={Colors.onSurfaceVariant} style={styles.icon} />
              <TextInput 
                placeholder="Create Password"
                placeholderTextColor={Colors.onSurfaceVariant + '80'}
                secureTextEntry
                style={styles.input}
              />
            </View>

            <PremiumButton 
              title="Create Account"
              onPress={() => navigation.replace('Main')}
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
