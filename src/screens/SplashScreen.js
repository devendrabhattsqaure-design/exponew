import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { Colors } from '../constants/Colors';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        useNativeDriver: true,
      })
    ]).start(() => {
      setTimeout(() => {
        navigation.replace('Onboarding');
      }, 1500);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>TS</Text>
        </View>
        <Text style={styles.appName}>TURF SCORE</Text>
        <Text style={styles.tagline}>PREMIUM SPORTS BOOKING</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.onBackground,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    marginTop: 8,
    letterSpacing: 2,
    fontWeight: '600',
  }
});

export default SplashScreen;
