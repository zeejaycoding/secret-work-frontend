import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  TouchableWithoutFeedback,
  ScrollView,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";
import { useLanguage } from "../../i18n";

interface FilterState {
  skill: string;
  difficulty: string;
  duration: string;
  goal: string;
}

const OPTION_KEYS: Record<string, string> = {
  Dribbling: "catDribbling",
  Shooting: "catShooting",
  Passing: "catPassing",
  Finishing: "catFinishing",
  Conditioning: "catConditioning",
  Beginner: "levelBeginner",
  Intermediate: "levelIntermediate",
  Advanced: "levelAdvanced",
  All: "all",
  "Under 5 mins": "durUnder5",
  "5–10 mins": "dur5to10",
  "10–20 mins": "dur10to20",
  "20+ mins": "dur20plus",
  "Improve Handles": "goalHandles",
  "Increase Speed": "goalSpeed",
  "Shooting Accuracy": "goalShooting",
  Stamina: "goalStamina",
  "Court Awareness": "goalAwareness",
};

const optionKey = (value: string) => OPTION_KEYS[value] || value;

interface Props {
  visible: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
}

const skillTypes = [
  "Dribbling",
  "Shooting",
  "Passing",
  "Finishing",
  "Conditioning",
];

const difficultyLevels = ["Beginner", "Intermediate", "Advanced", "All"];
const durations = ["Under 5 mins", "5–10 mins", "10–20 mins", "20+ mins"];

const goalFocus = [
  "Improve Handles",
  "Increase Speed",
  "Shooting Accuracy",
  "Stamina",
  "Court Awareness",
];

const FilterModal: React.FC<Props> = ({
  visible,
  onClose,
  filters,
  onApply,
}) => {
  const { primaryColor } = useBranding();
  const { colors } = useAppTheme();
  const { t } = useLanguage();
  const styles = createStyles(colors);
  const slideAnim = useRef(new Animated.Value(responsiveHeight(100))).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const [selectedSkill, setSelectedSkill] = useState("Dribbling");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Beginner");
  const [selectedDuration, setSelectedDuration] = useState("Under 5 mins");
  const [selectedGoal, setSelectedGoal] = useState("Improve Handles");

  useEffect(() => {
    if (visible) {
      setSelectedSkill(filters.skill === "All" ? "Dribbling" : filters.skill);
      setSelectedDifficulty(
        filters.difficulty === "All" ? "Beginner" : filters.difficulty,
      );
      setSelectedDuration(
        filters.duration === "All" ? "Under 5 mins" : filters.duration,
      );
      setSelectedGoal(filters.goal === "All" ? "Improve Handles" : filters.goal);

      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 420,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: responsiveHeight(100),
          duration: 280,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),

        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const renderCheckItem = (
    item: string,
    selected: string,
    onPress: (value: string) => void,
  ) => {
    const active = selected === item;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.radioItem}
        onPress={() => onPress(item)}
      >
        <View style={[styles.checkBox, active && styles.activeCheckBox]}>
          <Ionicons
            name="checkmark"
            size={moderateScale(10)}
            color={active ? colors.white : colors.textSecondary}
          />
        </View>

        <Text style={[styles.radioText, active && styles.radioTextActive]}>
          {t(optionKey(item))}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderChip = (
    item: string,
    selected: string,
    onPress: (value: string) => void,
  ) => {
    const active = selected === item;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onPress(item)}
        style={[styles.chip, active && styles.activeChip]}
      >
        <Text style={[styles.chipText, active && styles.activeChipText]}>
          {t(optionKey(item))}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
            },
          ]}
        >
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.modalContainer,
                {
                  transform: [
                    {
                      translateY: slideAnim,
                    },
                  ],
                },
              ]}
            >
              <View style={styles.headerRow}>
                <Text style={styles.title}>{t("filter")}</Text>

                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={moderateScale(20)}
                    color={colors.text}
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingBottom: responsiveHeight(3),
                }}
              >
                <Text style={styles.sectionTitle}>{t("skillType")}</Text>

                {skillTypes.map((item, index) => (
                  <View key={index}>
                    {renderCheckItem(item, selectedSkill, (value) =>
                      setSelectedSkill((prev) => (prev === value ? "All" : value)),
                    )}
                  </View>
                ))}

                <Text style={styles.sectionTitle}>{t("difficultyLevel")}</Text>

                <View style={styles.chipWrapper}>
                  {difficultyLevels.map((item, index) => (
                    <View key={index}>
                      {renderChip(
                        item,
                        selectedDifficulty,
                        setSelectedDifficulty,
                      )}
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>{t("durationWord")}</Text>

                <View style={styles.chipWrapper}>
                  {durations.map((item, index) => (
                    <View key={index}>
                      {renderChip(item, selectedDuration, (value) =>
                        setSelectedDuration((prev) =>
                          prev === value ? "All" : value,
                        ),
                      )}
                    </View>
                  ))}
                </View>

                <Text style={styles.sectionTitle}>{t("goalFocus")}</Text>

                {goalFocus.map((item, index) => (
                  <View key={index}>
                    {renderCheckItem(item, selectedGoal, (value) =>
                      setSelectedGoal((prev) => (prev === value ? "All" : value)),
                    )}
                  </View>
                ))}
              </ScrollView>

              <View style={styles.bottomRow}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.cancelBtn}
                  onPress={onClose}
                >
                   <Text style={styles.cancelText}>{t("cancel")}</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.8} style={[styles.applyBtn, { backgroundColor: primaryColor }]} onPress={() => {
                  onApply({
                    skill: selectedSkill,
                    difficulty: selectedDifficulty,
                    duration: selectedDuration,
                    goal: selectedGoal,
                  });
                  onClose();
                }}>
                   <Text style={styles.applyText}>{t("applyFilter")}</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default FilterModal;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    width: "100%",
    height: responsiveHeight(70),
    backgroundColor: colors.background,
    borderTopLeftRadius: moderateScale(24),
    borderTopRightRadius: moderateScale(24),
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },

  title: {
    color: colors.text,
    fontSize: moderateScale(20),
    fontFamily: "Inter-Medium",
  },

  sectionTitle: {
    color: colors.text,
    fontSize: moderateScale(14),
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(1.2),
    fontFamily: "Inter-Medium",
  },

  radioItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: responsiveHeight(1),
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundElevated,
  },

  checkBox: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(50),
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },

  activeCheckBox: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },

  radioText: {
    color: colors.textMuted,
    fontSize: moderateScale(12),
    fontFamily: "Inter-Medium",
  },

  radioTextActive: {
    color: colors.textMuted,
  },

  chipWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: moderateScale(6),
  },

  chip: {
    backgroundColor: colors.backgroundElevated,
    paddingHorizontal: responsiveWidth(3.6),
    paddingVertical: responsiveHeight(1),
    borderRadius: moderateScale(6),
    marginBottom: responsiveHeight(0.5),
  },

  activeChip: {
    backgroundColor: "#E50914",
  },

  chipText: {
    color: colors.textMuted,
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
  },

  activeChipText: {
    color: colors.white,
  },

  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: responsiveHeight(0),
    marginBottom: responsiveHeight(3),
  },

  cancelBtn: {
    width: "48%",
    height: responsiveHeight(6.5),
    backgroundColor: colors.backgroundInput,
    borderRadius: moderateScale(14),
    justifyContent: "center",
    alignItems: "center",
  },

  applyBtn: {
    width: "48%",
    height: responsiveHeight(6.5),
    backgroundColor: "#E50914",
    borderRadius: moderateScale(14),
    justifyContent: "center",
    alignItems: "center",
  },

  cancelText: {
    color: colors.text,
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },

  applyText: {
    color: colors.white,
    fontSize: moderateScale(14),
    fontFamily: "Inter-Medium",
  },
});
