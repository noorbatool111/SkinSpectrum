import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { BaseScreen } from '../components/common/BaseScreen';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors } from '../constants/color';
import { Ionicons } from '@expo/vector-icons';

const AboutMelanomaScreen = ({ navigation }) => {
  return (
    <BaseScreen>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textHeading} />
          <Text style={{ marginLeft: 8, fontSize: 16, color: colors.textHeading, fontWeight: '600' }}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerSection}>
          <Ionicons name="shield-checkmark-outline" size={50} color={colors.primary} />
          <Text style={styles.title}>Your Guide to Skin Health</Text>
          <Text style={styles.subtitle}>Knowledge is the first step in prevention.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What is Melanoma?</Text>
          <Text style={styles.text}>
            Melanoma is the most serious type of skin cancer. It starts in cells called melanocytes, which produce the pigment that colors your skin. While less common than other skin cancers, it is more likely to spread if not caught early.
          </Text>
        </View>

        <View style={styles.comparisonCard}>
          <Text style={styles.cardTitle}>Benign vs. Malignant</Text>
          <View style={styles.comparisonRow}>
            <View style={styles.comparisonCol}>
              <View style={[styles.dot, { backgroundColor: colors.accentSafe }]} />
              <Text style={styles.bold}>Benign</Text>
              <Text style={styles.smallText}>Non-cancerous. Usually harmless moles with smooth edges and uniform color.</Text>
            </View>
            <View style={styles.comparisonDivider} />
            <View style={styles.comparisonCol}>
              <View style={[styles.dot, { backgroundColor: colors.accentDanger }]} />
              <Text style={styles.bold}>Malignant</Text>
              <Text style={styles.smallText}>Cancerous. These spots can grow and spread. They often have irregular borders and multiple colors.</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>The ABCDE Rule of Melanoma</Text>
          <Text style={styles.text}>
            Dermatologists use the ABCDE method to identify suspicious moles:
          </Text>

          <View style={styles.abcdeList}>
            <View style={styles.abcdeCard}>
              <Text style={styles.abcdeLetter}>A</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.abcdeLabel}>Asymmetry</Text>
                <Text style={styles.abcdeDesc}>One half of the mole doesn't match the other.</Text>
              </View>
            </View>
            <View style={styles.abcdeCard}>
              <Text style={styles.abcdeLetter}>B</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.abcdeLabel}>Border</Text>
                <Text style={styles.abcdeDesc}>Edges are irregular, ragged, notched, or blurred.</Text>
              </View>
            </View>
            <View style={styles.abcdeCard}>
              <Text style={styles.abcdeLetter}>C</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.abcdeLabel}>Color</Text>
                <Text style={styles.abcdeDesc}>The color is not the same all over (shades of brown/black).</Text>
              </View>
            </View>
            <View style={styles.abcdeCard}>
              <Text style={styles.abcdeLetter}>D</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.abcdeLabel}>Diameter</Text>
                <Text style={styles.abcdeDesc}>The spot is larger than 6mm (size of a pencil eraser).</Text>
              </View>
            </View>
            <View style={styles.abcdeCard}>
              <Text style={styles.abcdeLetter}>E</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.abcdeLabel}>Evolving</Text>
                <Text style={styles.abcdeDesc}>The mole is changing in size, shape, or color.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Early Detection Saves Lives</Text>
          <Text style={styles.infoText}>
            When caught in its earliest stage, the survival rate for melanoma is nearly 99%. Regular monitoring with tools like SkinSpectrum helps you stay proactive about your skin health.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>I Understand</Text>
        </TouchableOpacity>
      </ScrollView>
      <Footer />
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textHeading,
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSub,
    marginTop: 4,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 10,
  },
  text: {
    fontSize: 15,
    color: colors.textSub,
    lineHeight: 22,
  },
  comparisonCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textHeading,
    textAlign: 'center',
    marginBottom: 20,
  },
  comparisonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  comparisonCol: {
    flex: 0.45,
    alignItems: 'center',
  },
  comparisonDivider: {
    width: 1,
    backgroundColor: '#eee',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
    fontSize: 16,
    color: colors.textHeading,
    marginBottom: 5,
  },
  smallText: {
    fontSize: 12,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 18,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    color: colors.textSub,
    flex: 1,
  },
  infoBox: {
    backgroundColor: colors.primary + '10',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 20,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  abcdeList: {
    marginTop: 15,
    gap: 12,
  },
  abcdeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    gap: 15,
  },
  abcdeLetter: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    width: 30,
  },
  abcdeLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textHeading,
  },
  abcdeDesc: {
    fontSize: 13,
    color: colors.textSub,
    marginTop: 2,
    flexShrink: 1,
  }
});

export default AboutMelanomaScreen;
