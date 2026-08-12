import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../../context/BrandingContext";
import { useAppTheme, ThemeColors } from "../../context/ThemeContext";

const options = [
  "Account",
  "Earnings",
  "Gifts",
  "Bans",
  "Payments",
  "Membership",
];

const HelpChat = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const { colors, statusBarStyle } = useAppTheme();
  const styles = createStyles(colors);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "receiver",
      text: `Hi there!
This is Bella from Secret is Work. To expedite resolutions and prioritize your request, kindly select the option below that suits your needs`,
      time: "08:20 pm",
    },
  ]);

  const handleSend = () => {
    if (message.trim() === "") return;

    const newMessage = {
      id: Date.now(),
      type: "sender",
      text: message,
      time: "08:21 pm",
    };

    setMessages([...messages, newMessage]);
    setMessage("");
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={colors.background} barStyle={statusBarStyle} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 20 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(20)}
              color={colors.text}
            />
          </TouchableOpacity>

          {messages.map((item: any) => {
            const isSender = item.type === "sender";

            return (
              <View
                key={item.id}
                style={[
                  styles.chatRow,
                  {
                    justifyContent: isSender ? "flex-end" : "flex-start",
                  },
                ]}
              >
                {!isSender && (
                  <>
                    <Image
                      source={require("../../assets/helpchat.png")}
                      style={styles.profileImage}
                    />

                    <View style={styles.receiverMessageBox}>
                      <Text style={styles.messageText}>{item.text}</Text>

                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>
                  </>
                )}

                {isSender && (
                  <>
                    <View style={styles.senderMessageBox}>
                      <Text style={styles.messageText}>{item.text}</Text>

                      <Text style={styles.timeText}>{item.time}</Text>
                    </View>

                    <Image
                      source={require("../../assets/mainprofile.png")}
                      style={styles.profileImage}
                    />
                  </>
                )}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.bottomContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsContainer}
          >
            {options.map((item, index) => (
              <TouchableOpacity key={index} style={styles.tagButton}>
                <Text style={styles.tagText}>{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Type message"
              placeholderTextColor={colors.textFaint}
              value={message}
              onChangeText={setMessage}
              style={styles.input}
            />

            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: primaryColor }]}
              onPress={handleSend}
            >
              <Ionicons name="send" size={moderateScale(18)} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default HelpChat;

const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  scrollContainer: {
    paddingTop: responsiveHeight(6),
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(18),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: moderateScale(50),
    backgroundColor: colors.backgroundElevated,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: responsiveHeight(3),
  },

  chatRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: responsiveHeight(2),
  },

  profileImage: {
    width: responsiveWidth(6.5),
    height: responsiveWidth(6.5),
    borderRadius: moderateScale(50),
  },

  receiverMessageBox: {
    maxWidth: responsiveWidth(70),
    backgroundColor: colors.backgroundElevated,
    borderRadius: moderateScale(12),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.8),
    marginLeft: responsiveWidth(2),
  },

  senderMessageBox: {
    maxWidth: responsiveWidth(70),
    backgroundColor: colors.backgroundElevated,
    borderRadius: moderateScale(12),
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(1.8),
    marginRight: responsiveWidth(2),
  },

  messageText: {
    color: colors.text,
    fontSize: moderateScale(12),
    lineHeight: moderateScale(19),
    fontFamily: "Inter-Medium",
  },

  timeText: {
    color: colors.textMuted,
    fontSize: moderateScale(10),
    marginTop: responsiveHeight(0.8),
    fontFamily: "Inter-Regular",
  },

  bottomContainer: {
    backgroundColor: colors.background,
    paddingTop: responsiveHeight(1.2),
    paddingBottom:
      Platform.OS === "ios" ? responsiveHeight(3) : responsiveHeight(2),
  },

  tagsContainer: {
    paddingHorizontal: responsiveWidth(3),
    marginBottom: responsiveHeight(1.4),
  },

  tagButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: moderateScale(20),
    paddingHorizontal: responsiveWidth(3),
    paddingVertical: responsiveHeight(1),
    marginRight: responsiveWidth(1.8),
    backgroundColor: colors.backgroundElevated,
  },

  tagText: {
    color: colors.text,
    fontSize: moderateScale(11),
    fontFamily: "Inter-Medium",
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(3),
    marginBottom: Platform.OS === "android" ? 2 : 0,
  },

  input: {
    flex: 1,
    height: responsiveHeight(5.5),
    backgroundColor: colors.backgroundInput,
    borderRadius: moderateScale(30),
    paddingHorizontal: responsiveWidth(4),
    color: colors.textMuted,
    fontSize: moderateScale(13),
    borderWidth: 1,
    borderColor: colors.borderStrong,
    fontFamily: "Inter-Medium",
  },

  sendButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: responsiveWidth(6),
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: responsiveWidth(2),
  },
});
