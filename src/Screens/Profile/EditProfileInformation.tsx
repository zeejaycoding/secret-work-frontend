import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Feather from "@expo/vector-icons/Feather";
import { moderateScale } from "react-native-size-matters";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { useAuthContext } from "../../context/AuthContext";
import { updateMe } from "../../services/api";
import api from "../../services/api";
import { useBranding } from "../../context/BrandingContext";

const EditProfileInformation = () => {
  const navigation = useNavigation<any>();
  const { user, signOut } = useAuthContext();
  const { primaryColor } = useBranding();

  const [name, setName] = useState(user?.firstName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [age, setAge] = useState(user?.age ? String(user.age) : "");
  const [gender, setGender] = useState(user?.gender || "");
  const [height, setHeight] = useState(user?.height ? String(user.height) : "");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updates: Record<string, any> = {};
      if (name.trim()) updates.firstName = name.trim();
      if (age.trim()) updates.age = parseInt(age.trim(), 10) || undefined;
      if (gender.trim()) updates.gender = gender.trim();
      if (height.trim()) updates.height = parseFloat(height.trim()) || undefined;
      await updateMe(updates);
      Alert.alert("Saved", "Profile updated successfully");
      navigation.goBack();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "Something went wrong";
      Alert.alert("Error", msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete account",
      "This will permanently delete your account and all data. Are you sure?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await api.delete("/users/me");
              await signOut();
              navigation.reset({ index: 0, routes: [{ name: "Signin" }] });
            } catch (err: any) {
              const msg = err?.response?.data?.error || "Delete failed";
              Alert.alert("Error", msg);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={moderateScale(22)}
              color="#fff"
            />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Information</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <Feather name="user" size={moderateScale(18)} color="#7B7B7B" />

            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Enter name"
              placeholderTextColor="#7B7B7B"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email-outline"
              size={moderateScale(18)}
              color="#7B7B7B"
            />

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              placeholderTextColor="#7B7B7B"
              keyboardType="email-address"
              editable={false}
              style={[styles.input, { color: "#555" }]}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="cake-variant-outline"
              size={moderateScale(18)}
              color="#7B7B7B"
            />

            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="Age"
              placeholderTextColor="#7B7B7B"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <Ionicons
              name="male-outline"
              size={moderateScale(18)}
              color="#7B7B7B"
            />

            <TextInput
              value={gender}
              onChangeText={setGender}
              placeholder="Gender"
              placeholderTextColor="#7B7B7B"
              style={styles.input}
            />
          </View>

          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="human-male-height"
              size={moderateScale(18)}
              color="#7B7B7B"
            />

            <TextInput
              value={height}
              onChangeText={setHeight}
              placeholder="Height (cm)"
              placeholderTextColor="#7B7B7B"
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.editButtonText}>Edit details</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: primaryColor }]}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>Delete account</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileInformation;

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

  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: responsiveHeight(1),
    marginBottom: responsiveHeight(4),
  },

  backButton: {
    width: responsiveWidth(10),
    height: responsiveWidth(10),
    borderRadius: moderateScale(50),
    backgroundColor: "#111111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: responsiveWidth(3),
  },

  headerTitle: {
    color: "#fff",
    fontSize: moderateScale(17),
    fontFamily: "Inter-Medium",
  },

  formContainer: {
    gap: responsiveHeight(1),
  },

  inputContainer: {
    width: "100%",
    height: responsiveHeight(7),
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderRadius: moderateScale(12),
    backgroundColor: "#0A0A0A",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(3.3),
  },

  input: {
    flex: 1,
    color: "#fff",
    marginLeft: responsiveWidth(2),
    fontSize: moderateScale(13),
    fontFamily: "Inter-Medium",
  },

  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: responsiveHeight(2),
  },

  editButton: {
    width: responsiveWidth(44),
    height: responsiveHeight(6.5),
    borderRadius: moderateScale(12),
    backgroundColor: "#161616",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteButton: {
    width: responsiveWidth(44),
    height: responsiveHeight(6.5),
    borderRadius: moderateScale(12),
    backgroundColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
  },

  editButtonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },

  deleteButtonText: {
    color: "#fff",
    fontSize: moderateScale(15),
    fontFamily: "Inter-Medium",
  },
});
