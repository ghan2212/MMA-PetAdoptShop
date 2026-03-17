import { useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/FirebaseConfig";
import Colors from "../../constants/Colors";

const CATEGORIES = ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Other"];
const GENDERS = ["Male", "Female"];

export default function AddNewPet() {
  const router = useRouter();
  const { user } = useUser();
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    address: "",
    about: "",
    category: "",
    sex: "",
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const validate = () => {
    const required = {
      name: "Tên thú cưng",
      breed: "Giống",
      age: "Tuổi",
      category: "Danh mục",
      sex: "Giới tính",
      address: "Địa chỉ",
      about: "Mô tả",
    };
    for (const [field, label] of Object.entries(required)) {
      if (!form[field]?.trim()) {
        Alert.alert("Thiếu thông tin", `Vui lòng điền "${label}".`);
        return false;
      }
    }
    if (!form.imageUrl?.trim()) {
      Alert.alert("Thiếu ảnh", "Vui lòng nhập link ảnh thú cưng.");
      return false;
    }
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "Pets"), {
        ...form,
        imageUrl: form.imageUrl.trim(),
        user: {
          name: user?.fullName,
          email: user?.primaryEmailAddress?.emailAddress,
          imageUrl: user?.imageUrl,
        },
        createdAt: new Date().toISOString(),
        id: Date.now().toString(),
      });
      Alert.alert("Thành công! 🎉", "Thú cưng đã được đăng tải.", [
        { text: "OK", onPress: () => router.push("/(tabs)/home") },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert("Lỗi", "Không thể đăng tải. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{ title: "Đăng thú cưng mới", headerShown: true }}
      />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Đăng thú cưng để nhận nuôi</Text>

        {/* Image preview */}
        <View style={styles.imageSection}>
          {form.imageUrl?.trim() ? (
            <Image
              source={{ uri: form.imageUrl.trim() }}
              style={styles.petImage}
              onError={() =>
                Alert.alert(
                  "Ảnh lỗi",
                  "Link ảnh không hợp lệ hoặc không tải được.",
                )
              }
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderIcon}>🐾</Text>
              <Text style={styles.imagePlaceholderText}>Xem trước ảnh</Text>
            </View>
          )}
        </View>

        {/* Image URL */}
        <View style={styles.section}>
          <Text style={styles.label}>Link ảnh thú cưng *</Text>
          <TextInput
            style={styles.input}
            placeholder="https://example.com/anh-thu-cung.jpg"
            placeholderTextColor={Colors.GRAY}
            value={form.imageUrl}
            onChangeText={(v) => handleInputChange("imageUrl", v)}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Text style={styles.hint}>
            Dán link ảnh từ internet (Google Images, Unsplash, Imgur...)
          </Text>
        </View>

        {/* Category */}
        <View style={styles.section}>
          <Text style={styles.label}>Danh mục *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => handleInputChange("category", cat)}
                style={[
                  styles.chip,
                  form.category === cat && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    form.category === cat && styles.chipTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.label}>Giới tính *</Text>

          <View style={styles.genderRow}>
            {GENDERS.map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => handleInputChange("sex", g)}
                style={[
                  styles.genderBtn,
                  form.sex === g && styles.genderBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.genderBtnText,
                    form.sex === g && styles.genderBtnTextActive,
                  ]}
                >
                  {g === "Male" ? "♂ Male" : "♀ Female"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Text fields */}
        {[
          {
            label: "Tên thú cưng *",
            field: "name",
            placeholder: "VD: Miu, Bon, Lucky...",
          },
          {
            label: "Giống *",
            field: "breed",
            placeholder: "VD: Corgi, Maine Coon...",
          },
          {
            label: "Tuổi *",
            field: "age",
            placeholder: "VD: 2 tháng, 1 năm...",
          },
          {
            label: "Cân nặng (kg)",
            field: "weight",
            placeholder: "VD: 3.5",
            keyboard: "decimal-pad",
          },
          {
            label: "Địa chỉ *",
            field: "address",
            placeholder: "Quận, Thành phố...",
          },
        ].map(({ label, field, placeholder, keyboard }) => (
          <View key={field} style={styles.section}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={Colors.GRAY}
              value={form[field]}
              onChangeText={(v) => handleInputChange(field, v)}
              keyboardType={keyboard || "default"}
            />
          </View>
        ))}

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.label}>Mô tả *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Kể về tính cách, thói quen của thú cưng..."
            placeholderTextColor={Colors.GRAY}
            value={form.about}
            onChangeText={(v) => handleInputChange("about", v)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <Pressable
          style={[styles.submitBtn, loading && styles.btnDisabled]}
          onPress={onSubmit}
          disabled={loading}
        >
          {loading ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <ActivityIndicator color="#000" />
              <Text style={styles.submitBtnText}>Đang đăng...</Text>
            </View>
          ) : (
            <Text style={styles.submitBtnText}>🐾 Đăng thú cưng</Text>
          )}
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa", padding: 20 },
  pageTitle: {
    fontFamily: "outfit-bold",
    fontSize: 22,
    marginBottom: 20,
    color: "#1a1a1a",
  },
  imageSection: { alignSelf: "center", marginBottom: 24 },
  petImage: {
    width: 200,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.PRIMAEY,
  },
  imagePlaceholder: {
    width: 200,
    height: 160,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.PRIMAEY,
    borderStyle: "dashed",
    backgroundColor: Colors.LIGHT_PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderIcon: { fontSize: 40 },
  imagePlaceholderText: {
    fontFamily: "outfit",
    fontSize: 13,
    color: Colors.GRAY,
    marginTop: 8,
  },
  section: { marginBottom: 18 },
  label: {
    fontFamily: "outfit-medium",
    fontSize: 15,
    color: "#333",
    marginBottom: 8,
  },
  hint: {
    fontFamily: "outfit",
    fontSize: 12,
    color: Colors.GRAY,
    marginTop: 6,
  },
  input: {
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    padding: 14,
    fontFamily: "outfit",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "#eee",
  },
  textArea: { minHeight: 110, paddingTop: 14 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  chipActive: { backgroundColor: Colors.PRIMAEY },
  chipText: { fontFamily: "outfit", fontSize: 14, color: "#666" },
  chipTextActive: { fontFamily: "outfit-medium", color: "#1a1a1a" },
  genderRow: { flexDirection: "row", gap: 12 },
  genderBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  genderBtnActive: { backgroundColor: Colors.PRIMAEY },
  genderBtnText: { fontFamily: "outfit-medium", fontSize: 15, color: "#666" },
  genderBtnTextActive: { color: "#1a1a1a" },
  submitBtn: {
    backgroundColor: Colors.PRIMAEY,
    padding: 18,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  submitBtnText: { fontFamily: "outfit-bold", fontSize: 18, color: "#1a1a1a" },
  btnDisabled: { opacity: 0.6 },
});
