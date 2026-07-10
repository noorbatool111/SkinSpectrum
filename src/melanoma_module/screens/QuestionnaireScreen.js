import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { BaseScreen } from '../components/common/BaseScreen';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { colors } from '../constants/color';
import { scale, scaleVertical } from '../helpers/scale';
import { useGlobalStyle } from '../hooks/useGlobalStyle';
import { PrimaryButton } from '../components/button/PrimaryButton';
import { Ionicons } from '@expo/vector-icons';
import FormContext from '../context/FormContext';
import { useContext } from 'react';

const QUESTIONS = [
  { id: 1, text: "Do you have a family history of skin cancer?", options: ["Yes", "No", "Unsure"], weight: { "Yes": 5, "No": 0, "Unsure": 2 } },
  { id: 2, text: "When was your last dermatologist check-up?", options: ["Within 1 year", "1-3 years ago", "More than 3 years", "Never"], weight: { "Within 1 year": -2, "1-3 years ago": 1, "More than 3 years": 4, "Never": 5 } },
  { id: 3, text: "Has the mole changed in size recently?", options: ["Increased", "Stayed same", "Decreased"], weight: { "Increased": 6, "Stayed same": 0, "Decreased": 2 } },
  { id: 4, text: "Has the color of the mole changed?", options: ["Yes, multi-color", "No, uniform", "Unsure"], weight: { "Yes, multi-color": 5, "No, uniform": 0, "Unsure": 2 } },
  { id: 5, text: "Has the shape of the mole become irregular?", options: ["Yes", "No", "Slightly"], weight: { "Yes": 6, "No": 0, "Slightly": 2 } },
  { id: 6, text: "Is the texture rough, scaly, or bleeding?", options: ["Yes", "No", "Itchy"], weight: { "Yes": 7, "No": 0, "Itchy": 3 } },
  { id: 7, text: "How often do you experience sunburns?", options: ["Never", "Rarely", "Frequently"], weight: { "Never": 0, "Rarely": 2, "Frequently": 5 } },
  { id: 8, text: "Do you use sunscreen daily?", options: ["Always", "Sometimes", "Never"], weight: { "Always": -3, "Sometimes": 1, "Never": 4 } },
  { id: 9, text: "What SPF level do you usually use?", options: ["SPF 50+", "SPF 30+", "Below 30", "None"], weight: { "SPF 50+": -3, "SPF 30+": 0, "Below 30": 2, "None": 4 } },
  { id: 10, text: "How much time do you spend in direct sun?", options: ["< 1 hour", "1-4 hours", "4+ hours"], weight: { "< 1 hour": 0, "1-4 hours": 2, "4+ hours": 6 } },
];

const QuestionnaireScreen = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [fadeAnim] = useState(new Animated.Value(1));
  const [isComplete, setIsComplete] = useState(false);
  const basicStyles = useGlobalStyle();
  const { questionnaireScore, setQuestionnaireScore } = useContext(FormContext);

  const handleAnswer = (option) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: option };
    setAnswers(newAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      Animated.timing(fadeAnim, { toValue: 0, duration: 100, useNativeDriver: true }).start(() => {
        setCurrentStep(currentStep + 1);
        Animated.timing(fadeAnim, { toValue: 1, duration: 100, useNativeDriver: true }).start();
      });
    } else {
      let score = 0;
      Object.keys(newAnswers).forEach((key) => {
        const question = QUESTIONS.find(q => q.id === parseInt(key));
        score += question.weight[newAnswers[key]];
      });
      // Store in context
      setQuestionnaireScore(score);
      // Show summary instead of immediate navigation
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <BaseScreen>
        <Header />
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="checkmark-circle" size={50} color={colors.primary} />
            </View>
            <Text style={styles.questionText}>Profile Complete!</Text>
            
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreLabel}>Personal Risk Score</Text>
              <Text style={styles.scoreValue}>{questionnaireScore}</Text>
            </View>

            <Text style={styles.summaryText}>
              This score is calculated based on your history and habits.
            </Text>
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>What does this mean?</Text>
              <Text style={styles.explanationText}>
                • <Text style={{fontWeight: '700'}}>15+ Score:</Text> High personal risk factors. Be extra cautious.{"\n"}
                • <Text style={{fontWeight: '700'}}>5-15 Score:</Text> Moderate risk factors. Follow sun safety.{"\n"}
                • <Text style={{fontWeight: '700'}}>{"<"} 5 Score:</Text> Low personal risk. Great skin habits!
              </Text>
            </View>
            <PrimaryButton 
              title="Select Mole Location →" 
              onPress={() => navigation.navigate('FormScreen')} 
            />
          </View>
        </View>
        <Footer />
      </BaseScreen>
    );
  }

  const currentQuestion = QUESTIONS[currentStep];

  return (
    <BaseScreen>
      <Header />
      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{currentStep + 1} / {QUESTIONS.length}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${((currentStep + 1) / QUESTIONS.length) * 100}%` }]} />
          </View>
        </View>

        <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
          <Text style={styles.questionText}>{currentQuestion.text}</Text>
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionButtonText}>{option}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {currentStep > 0 && (
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setCurrentStep(currentStep - 1)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.textSub} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}
      </View>
      <Footer />
    </BaseScreen>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: scale(20),
    paddingTop: scaleVertical(20),
  },
  progressContainer: {
    marginBottom: 30,
  },
  progressText: {
    fontSize: 14,
    color: colors.textSub,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E0D8D0',
    borderRadius: 3,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
    minHeight: 350,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 32,
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textHeading,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    alignSelf: 'center',
    gap: 5,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.textSub,
    fontWeight: '500',
  },
  iconCircle: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  summaryText: {
    fontSize: 16,
    color: colors.textSub,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  explanationBox: {
    backgroundColor: colors.background,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textHeading,
    marginBottom: 10,
  },
  explanationText: {
    fontSize: 14,
    color: colors.textSub,
    lineHeight: 22,
  },
  scoreBadge: {
    backgroundColor: colors.primary + '15',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
  },
});

export default QuestionnaireScreen;
