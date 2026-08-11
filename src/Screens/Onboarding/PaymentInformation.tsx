import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  ScrollView,
} from "react-native";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useBranding } from "../../context/BrandingContext";

const PaymentInformation = () => {
  const navigation = useNavigation<any>();
  const { primaryColor } = useBranding();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("Credit card");
  const [saveCard, setSaveCard] = useState(true);

  const paymentMethods = ["Credit card", "Debit card", "Paypal", "Apple Pay"];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(18)}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Process payment</Text>
        </View>

        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionLeft}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../../assets/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <View>
              <Text style={styles.subscriptionTitle}>Subscriptions</Text>
              <Text style={styles.subscriptionSubTitle}>Monthly</Text>
            </View>
          </View>

          <Text style={styles.price}>$23</Text>
        </View>

        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdownContainer}
            activeOpacity={0.8}
            onPress={() => setDropdownOpen(!dropdownOpen)}
          >
            <View style={styles.dropdownLeft}>
              <MaterialIcons
                name="credit-card"
                size={moderateScale(18)}
                color="#FF0000"
              />

              <Text style={styles.dropdownText}>{selectedMethod}</Text>
            </View>

            <Ionicons
              name={dropdownOpen ? "chevron-up" : "chevron-down"}
              size={moderateScale(18)}
              color="#8A8A8A"
            />
          </TouchableOpacity>

          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              {paymentMethods.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedMethod(item);
                    setDropdownOpen(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Card number</Text>

          <TextInput
            placeholder="1234 5679 5689 5638"
            placeholderTextColor="#8A8A8A"
            style={styles.input}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Name on card</Text>

          <TextInput
            placeholder="Bustin"
            placeholderTextColor="#8A8A8A"
            style={styles.input}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>Expiry</Text>

            <TextInput
              placeholder="MM/YY"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
            />
          </View>

          <View style={styles.halfInputContainer}>
            <Text style={styles.label}>CVV</Text>

            <TextInput
              placeholder="123"
              placeholderTextColor="#8A8A8A"
              style={styles.input}
              keyboardType="number-pad"
              secureTextEntry
            />
          </View>
        </View>

        <TouchableOpacity
          style={styles.saveCardContainer}
          activeOpacity={0.8}
          onPress={() => setSaveCard(!saveCard)}
        >
          <View
            style={[styles.radioOuter, saveCard && styles.radioOuterActive]}
          >
            {saveCard && <View style={styles.radioInner} />}
          </View>

          <Text style={styles.saveCardText}>Save card for future use</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={() => navigation.navigate("PaymentSuccess")}
        >
          <Text style={styles.buttonText}>Make payment</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default PaymentInformation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  scrollContainer: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(6),
    paddingBottom: responsiveHeight(4),
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: responsiveHeight(3),
  },

  backButton: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },

  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(16),
    fontFamily: "Inter-Medium",
  },

  subscriptionCard: {
    width: "100%",
    backgroundColor: "#0A0A0A",
    borderRadius: moderateScale(14),
    paddingVertical: responsiveHeight(1.7),
    paddingHorizontal: responsiveWidth(4),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: responsiveHeight(1),
  },

  subscriptionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(50),
    backgroundColor: "#161616",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },

  logo: {
    width: moderateScale(24),
    height: moderateScale(24),
    resizeMode: "contain",
  },

  subscriptionTitle: {
    color: "#fff",
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
  },

  subscriptionSubTitle: {
    color: "#8A9095",
    fontSize: moderateScale(10),
    marginTop: responsiveHeight(0.2),
    fontFamily: "Inter-Medium",
  },

  price: {
    color: "#fff",
    fontSize: moderateScale(18),
    fontFamily: "Poppins-Medium",
  },

  dropdownWrapper: {
    position: "relative",
    zIndex: 999,
  },

  dropdownContainer: {
    width: "100%",
    backgroundColor: "#0A0A0A",
    borderRadius: moderateScale(14),
    paddingVertical: responsiveHeight(2),
    paddingHorizontal: responsiveWidth(4),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  dropdownText: {
    color: "#fff",
    fontSize: moderateScale(14),
    marginLeft: responsiveWidth(2.5),
    fontFamily: "Inter-Medium",
  },

  dropdownMenu: {
    position: "absolute",
    top: responsiveHeight(7),
    left: 0,
    right: 0,
    backgroundColor: "#111",
    borderRadius: moderateScale(14),
    overflow: "hidden",
    zIndex: 9999,
    elevation: 20,
  },

  dropdownItem: {
    paddingVertical: responsiveHeight(1.8),
    paddingHorizontal: responsiveWidth(4),
    borderBottomWidth: 1,
    borderBottomColor: "#1F1F1F",
  },

  dropdownItemText: {
    color: "#fff",
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
  },

  inputWrapper: {
    marginTop: responsiveHeight(1),
  },

  label: {
    color: "#7A7A7A",
    fontSize: moderateScale(11.5),
    marginBottom: responsiveHeight(1),
    fontFamily: "Inter-Medium",
  },

  input: {
    width: "100%",
    height: responsiveHeight(7),
    backgroundColor: "#111111",
    borderRadius: moderateScale(12),
    paddingHorizontal: responsiveWidth(4),
    color: "#fff",
    fontSize: moderateScale(14),
    borderWidth: 1,
    borderColor: "#2A2A2A",
    fontFamily: "Inter-Medium",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  halfInputContainer: {
    width: "48%",
    marginTop: responsiveHeight(1.5),
  },

  saveCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(2.5),
  },

  radioOuter: {
    width: moderateScale(16),
    height: moderateScale(16),
    borderRadius: moderateScale(8),
    borderWidth: 1.5,
    borderColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
  },

  radioOuterActive: {
    backgroundColor: "#FF0000",
  },

  radioInner: {
    width: moderateScale(5),
    height: moderateScale(5),
    borderRadius: moderateScale(2.5),
    backgroundColor: "#fff",
  },

  saveCardText: {
    color: "#fff",
    fontSize: moderateScale(12),
    marginLeft: responsiveWidth(2.5),
    fontFamily: "Inter-Medium",
  },

  button: {
    width: "100%",
    height: responsiveHeight(6.5),
    backgroundColor: "#E50914",
    borderRadius: moderateScale(14),
    justifyContent: "center",
    alignItems: "center",
    marginTop: responsiveHeight(2.5),
  },

  buttonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },
});
