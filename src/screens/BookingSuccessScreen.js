import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  StatusBar,
  Image
} from 'react-native';
import { CheckCircle2, Calendar, Clock, MapPin, Share2 } from 'lucide-react-native';
import { Colors } from '../constants/Colors';
import PremiumButton from '../components/PremiumButton';
import PremiumCard from '../components/PremiumCard';

const BookingSuccessScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        {/* Success Icon Section */}
        <View style={styles.iconContainer}>
          <CheckCircle2 size={80} color={Colors.primaryContainer} strokeWidth={1.5} />
        </View>

        <Text style={styles.headline}>Match Ready!</Text>
        <Text style={styles.subheadline}>
          Your pitch is locked in. Time to warm up, assemble the squad, and take the turf.
        </Text>

        {/* Booking Details Card */}
        <PremiumCard style={styles.detailsCard} level="low">
          <View style={styles.header}>
            <View style={styles.arenaIcon}>
              <MapPin size={24} color={Colors.primary} />
            </View>
            <View>
              <Text style={styles.arenaName}>Emerald Arena</Text>
              <Text style={styles.pitchInfo}>Pitch 4 (Premium Turf)</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Calendar size={18} color={Colors.onSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Date</Text>
                <Text style={styles.infoValue}>Mon, July 12</Text>
              </View>
            </View>
            <View style={styles.infoBlock}>
              <Clock size={18} color={Colors.onSurfaceVariant} />
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Kick-off</Text>
                <Text style={styles.infoValue}>19:30</Text>
              </View>
            </View>
          </View>
        </PremiumCard>

        {/* Digital Pass Section */}
        <View style={styles.passSection}>
          <Text style={styles.passLabel}>DIGITAL PASS ID</Text>
          <View style={styles.passIdContainer}>
            <Text style={styles.passId}>TS-4921-99</Text>
            <Share2 size={20} color={Colors.primary} />
          </View>
        </View>

        <View style={styles.footer}>
          <PremiumButton 
            title="Return to Dashboard" 
            onPress={() => navigation.navigate('Main')} 
            style={styles.actionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 32,
    backgroundColor: Colors.primaryContainer + '10',
    padding: 20,
    borderRadius: 50,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.onBackground,
    textAlign: 'center',
    marginBottom: 16,
  },
  subheadline: {
    fontSize: 16,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  detailsCard: {
    width: '100%',
    padding: 24,
    borderRadius: 32,
    marginBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arenaIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  arenaName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onBackground,
  },
  pitchInfo: {
    fontSize: 14,
    color: Colors.onSurfaceVariant,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.surfaceContainer,
    marginVertical: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoTextContainer: {
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onBackground,
    marginTop: 2,
  },
  passSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  passLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  passIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  passId: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onBackground,
    marginRight: 12,
    letterSpacing: 1,
  },
  footer: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
  }
});

export default BookingSuccessScreen;
