import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const QUESTIONS = [
  {
    statement: "Anyone can get wrinkles at any age 🤔",
    answer: "fact",
    explanation:
      "Wrinkles can start early due to sun exposure, stress, and lifestyle habits like smoking or poor sleep.",
  },
  {
    statement: "Dark spots and hyperpigmentation always fade on their own 🧐",
    answer: "myth",
    explanation:
      "Some may fade slowly, but many need treatment like serums, peels, or sunscreen to improve.",
  },
  {
    statement: "Sunscreen is only needed on sunny days ☀️",
    answer: "myth",
    explanation:
      "UV rays penetrate clouds and can damage skin even on overcast days, worsening pigmentation and aging.",
  },
  {
    statement: "Melanoma can affect people of all skin tones 🌍",
    answer: "fact",
    explanation:
      "Melanoma can occur in anyone regardless of skin color — not just fair-skinned people.",
  },
  {
    statement: "Popping pimples makes them heal faster 👀",
    answer: "myth",
    explanation:
      "Popping pimples pushes bacteria deeper, causing more inflammation, infection, and potential scarring.",
  },
];

const MythOrFactGame = ({ visible, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null); // 'myth' | 'fact' | null
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Animations
  const cardScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  const resultSlide = useRef(new Animated.Value(30)).current;
  const resultOpacity = useRef(new Animated.Value(0)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const scoreScale = useRef(new Animated.Value(0.5)).current;
  const scoreFade = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const currentQ = QUESTIONS[currentIndex];
  const isCorrect = selected === currentQ?.answer;
  const total = QUESTIONS.length;

  const handleAnswer = (answer) => {
    setSelected(answer);
    const correct = answer === currentQ.answer;
    if (correct) setScore((s) => s + 1);

    // Animate card feedback
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    // Show result explanation
    setShowResult(true);
    resultSlide.setValue(30);
    resultOpacity.setValue(0);
    Animated.parallel([
      Animated.timing(resultSlide, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(resultOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    // Fade out current card
    Animated.parallel([
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (currentIndex + 1 >= total) {
        // Game over — show score
        setGameOver(true);
        scoreScale.setValue(0.5);
        scoreFade.setValue(0);
        Animated.parallel([
          Animated.spring(scoreScale, {
            toValue: 1,
            friction: 6,
            tension: 50,
            useNativeDriver: true,
          }),
          Animated.timing(scoreFade, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start();
      } else {
        setCurrentIndex((i) => i + 1);
        setSelected(null);
        setShowResult(false);
      }

      // Fade in new card
      cardOpacity.setValue(0);
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleReplay = () => {
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setShowResult(false);
    setGameOver(false);
    cardOpacity.setValue(1);
  };

  const handleClose = () => {
    Animated.timing(overlayOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      handleReplay();
      onClose();
    });
  };

  const getScoreEmoji = () => {
    if (score === total) return "🏆";
    if (score >= 4) return "🎉";
    if (score >= 3) return "😊";
    if (score >= 2) return "🤔";
    return "💪";
  };

  const getScoreMessage = () => {
    if (score === total) return "Perfect! You're a skincare expert!";
    if (score >= 4) return "Amazing! You really know your skin!";
    if (score >= 3) return "Nice work! Keep learning!";
    if (score >= 2) return "Not bad! Room to grow!";
    return "Keep exploring — knowledge is power!";
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        {/* Close button */}
        <TouchableOpacity style={styles.closeBtn} onPress={handleClose}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>

        {!gameOver ? (
          <Animated.View
            style={[
              styles.card,
              {
                opacity: cardOpacity,
                transform: [{ scale: cardScale }],
              },
            ]}
          >
            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>
                Question {currentIndex + 1} of {total}
              </Text>
              <View style={styles.progressDots}>
                {QUESTIONS.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      i === currentIndex && styles.dotActive,
                      i < currentIndex && styles.dotDone,
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Progress bar */}
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${((currentIndex + 1) / total) * 100}%` },
                ]}
              />
            </View>

            {/* Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Myth or Fact?</Text>
            </View>

            {/* Statement */}
            <Text style={styles.statement}>{currentQ.statement}</Text>

            {/* Result feedback */}
            {showResult && (
              <Animated.View
                style={[
                  styles.resultBox,
                  {
                    backgroundColor: isCorrect
                      ? "rgba(76, 175, 80, 0.08)"
                      : "rgba(211, 47, 47, 0.08)",
                    borderColor: isCorrect
                      ? "rgba(76, 175, 80, 0.2)"
                      : "rgba(211, 47, 47, 0.2)",
                    opacity: resultOpacity,
                    transform: [{ translateY: resultSlide }],
                  },
                ]}
              >
                <View style={styles.resultHeader}>
                  <Ionicons
                    name={isCorrect ? "checkmark-circle" : "close-circle"}
                    size={22}
                    color={isCorrect ? "#4CAF50" : "#D32F2F"}
                  />
                  <Text
                    style={[
                      styles.resultTitle,
                      { color: isCorrect ? "#2E7D32" : "#C62828" },
                    ]}
                  >
                    {isCorrect ? "Correct! 🎉" : "Oops, not really! 😅"}
                  </Text>
                </View>
                <Text style={styles.resultExplanation}>
                  {currentQ.explanation}
                </Text>
              </Animated.View>
            )}

            {/* Answer buttons / Next button */}
            {!showResult ? (
              <View style={styles.answersRow}>
                <TouchableOpacity
                  style={[styles.answerBtn, styles.mythBtn]}
                  onPress={() => handleAnswer("myth")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.answerEmoji}>❌</Text>
                  <Text style={[styles.answerLabel, styles.mythLabel]}>
                    Myth
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.answerBtn, styles.factBtn]}
                  onPress={() => handleAnswer("fact")}
                  activeOpacity={0.8}
                >
                  <Text style={styles.answerEmoji}>✅</Text>
                  <Text style={[styles.answerLabel, styles.factLabel]}>
                    Fact
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={handleNext}
                activeOpacity={0.85}
              >
                <Text style={styles.nextBtnText}>
                  {currentIndex + 1 >= total ? "See Results" : "Next Question"}
                </Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            )}
          </Animated.View>
        ) : (
          /* ── SCORE SCREEN ── */
          <Animated.View
            style={[
              styles.card,
              styles.scoreCard,
              {
                opacity: scoreFade,
                transform: [{ scale: scoreScale }],
              },
            ]}
          >
            <Text style={styles.scoreEmoji}>{getScoreEmoji()}</Text>
            <Text style={styles.scoreTitle}>Quiz Complete!</Text>
            <Text style={styles.scoreValue}>
              {score}/{total}
            </Text>
            <Text style={styles.scoreSubtext}>correct answers</Text>

            {/* Score bar */}
            <View style={styles.scoreBarBg}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${(score / total) * 100}%`,
                    backgroundColor:
                      score >= 4 ? "#4CAF50" : score >= 3 ? "#FF9800" : "#D32F2F",
                  },
                ]}
              />
            </View>

            <Text style={styles.scoreMessage}>{getScoreMessage()}</Text>

            {/* Stars */}
            <View style={styles.starsRow}>
              {[...Array(total)].map((_, i) => (
                <Ionicons
                  key={i}
                  name={i < score ? "star" : "star-outline"}
                  size={28}
                  color={i < score ? "#FFB300" : "#E0D5C8"}
                  style={{ marginHorizontal: 3 }}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.replayBtn}
              onPress={handleReplay}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={18} color="#FFF" />
              <Text style={styles.replayBtnText}>Play Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={handleClose}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </Animated.View>
    </Modal>
  );
};

export default MythOrFactGame;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(40, 25, 15, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeBtn: {
    position: "absolute",
    top: 55,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  // Card
  card: {
    width: width - 40,
    backgroundColor: "#FFF",
    borderRadius: 28,
    padding: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },

  // Progress
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressText: {
    fontSize: 13,
    color: "#9B8A76",
    fontWeight: "700",
  },
  progressDots: {
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E8DFD4",
  },
  dotActive: {
    backgroundColor: "#825A3B",
    width: 20,
    borderRadius: 4,
  },
  dotDone: {
    backgroundColor: "#C4A882",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#F0EBE4",
    borderRadius: 2,
    marginBottom: 24,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#825A3B",
    borderRadius: 2,
  },

  // Badge
  badge: {
    alignSelf: "center",
    backgroundColor: "rgba(130, 90, 59, 0.08)",
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  badgeText: {
    fontSize: 13,
    color: "#825A3B",
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },

  // Statement
  statement: {
    fontSize: 20,
    color: "#3A2415",
    fontWeight: "700",
    textAlign: "center",
    lineHeight: 30,
    marginBottom: 28,
    paddingHorizontal: 4,
  },

  // Result
  resultBox: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 24,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  resultExplanation: {
    fontSize: 14,
    color: "#5A4A3A",
    lineHeight: 22,
    fontWeight: "500",
  },

  // Answer buttons
  answersRow: {
    flexDirection: "row",
    gap: 14,
  },
  answerBtn: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  mythBtn: {
    backgroundColor: "rgba(211, 47, 47, 0.04)",
    borderColor: "rgba(211, 47, 47, 0.15)",
  },
  factBtn: {
    backgroundColor: "rgba(76, 175, 80, 0.04)",
    borderColor: "rgba(76, 175, 80, 0.15)",
  },
  answerEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  answerLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  mythLabel: {
    color: "#D32F2F",
  },
  factLabel: {
    color: "#388E3C",
  },

  // Next button
  nextBtn: {
    backgroundColor: "#5C3318",
    paddingVertical: 17,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#3A1E0A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  nextBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },

  // Score screen
  scoreCard: {
    alignItems: "center",
    paddingVertical: 40,
  },
  scoreEmoji: {
    fontSize: 56,
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 22,
    color: "#4A2E12",
    fontWeight: "800",
    marginBottom: 12,
  },
  scoreValue: {
    fontSize: 56,
    color: "#825A3B",
    fontWeight: "900",
    marginBottom: 4,
  },
  scoreSubtext: {
    fontSize: 15,
    color: "#9B8A76",
    fontWeight: "600",
    marginBottom: 20,
  },
  scoreBarBg: {
    width: "80%",
    height: 8,
    backgroundColor: "#F0EBE4",
    borderRadius: 4,
    marginBottom: 16,
    overflow: "hidden",
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreMessage: {
    fontSize: 16,
    color: "#5A4A3A",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  starsRow: {
    flexDirection: "row",
    marginBottom: 30,
  },
  replayBtn: {
    backgroundColor: "#825A3B",
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 14,
    width: "80%",
    shadowColor: "#825A3B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  replayBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
  },
  doneBtn: {
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#825A3B",
    width: "80%",
    alignItems: "center",
  },
  doneBtnText: {
    color: "#825A3B",
    fontSize: 16,
    fontWeight: "700",
  },
});
