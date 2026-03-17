import { useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/FirebaseConfig";
import Colors from "../../constants/Colors";

export default function ManagePosts() {
  const { user } = useUser();
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    const q = query(collection(db, "Pets"), where("user.email", "==", email));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
      setPets(data);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const onDelete = (pet) => {
    Alert.alert("Xóa bài đăng", `Bạn chắc muốn xóa "${pet.name}"?`, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "Pets", pet.docId));
          } catch (e) {
            Alert.alert("Lỗi", "Không thể xóa bài đăng.");
          }
        },
      },
    ]);
  };

  const renderPet = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/images/placeholder.png")}
        style={styles.petImg}
      />
      <View style={styles.cardInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed} · {item.category}</Text>
        <Text style={styles.petAge}>🎂 {item.age}  ·  📍 {item.address}</Text>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => Alert.alert("Sắp có", "Tính năng chỉnh sửa đang phát triển.")}
          >
            <Text style={styles.editBtnText}>✏️ Sửa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item)}>
            <Text style={styles.deleteBtnText}>🗑 Xóa</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Quản lý bài đăng", headerShown: true }} />
      <View style={styles.container}>
        <FlatList
          data={pets}
          keyExtractor={(item) => item.docId}
          renderItem={renderPet}
          contentContainerStyle={pets.length === 0 ? { flex: 1 } : { padding: 16 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Chưa có bài đăng nào</Text>
              <Text style={styles.emptySubText}>Hãy đăng thú cưng đầu tiên của bạn!</Text>
              <Pressable style={styles.addBtn} onPress={() => router.push("/add-new-pet")}>
                <Text style={styles.addBtnText}>+ Đăng thú cưng</Text>
              </Pressable>
            </View>
          }
        />
        {pets.length > 0 && (
          <Pressable style={styles.floatingBtn} onPress={() => router.push("/add-new-pet")}>
            <Text style={styles.floatingBtnText}>+</Text>
          </Pressable>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  card: { flexDirection: "row", backgroundColor: Colors.WHITE, borderRadius: 16, padding: 12, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  petImg: { width: 90, height: 90, borderRadius: 12 },
  cardInfo: { flex: 1, paddingLeft: 12, justifyContent: "space-between" },
  petName: { fontFamily: "outfit-bold", fontSize: 17, color: "#1a1a1a" },
  petBreed: { fontFamily: "outfit", fontSize: 13, color: Colors.GRAY, marginTop: 2 },
  petAge: { fontFamily: "outfit", fontSize: 13, color: Colors.GRAY, marginTop: 2 },
  cardActions: { flexDirection: "row", gap: 8, marginTop: 8 },
  editBtn: { flex: 1, paddingVertical: 7, backgroundColor: Colors.LIGHT_PRIMARY, borderRadius: 8, alignItems: "center" },
  editBtnText: { fontFamily: "outfit-medium", fontSize: 13, color: "#795548" },
  deleteBtn: { flex: 1, paddingVertical: 7, backgroundColor: "#fff0f0", borderRadius: 8, alignItems: "center" },
  deleteBtnText: { fontFamily: "outfit-medium", fontSize: 13, color: "#d32f2f" },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontFamily: "outfit-bold", fontSize: 20, color: "#333", textAlign: "center" },
  emptySubText: { fontFamily: "outfit", fontSize: 15, color: Colors.GRAY, textAlign: "center", marginTop: 8 },
  addBtn: { marginTop: 20, backgroundColor: Colors.PRIMAEY, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  addBtnText: { fontFamily: "outfit-bold", fontSize: 16, color: "#1a1a1a" },
  floatingBtn: { position: "absolute", bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.PRIMAEY, alignItems: "center", justifyContent: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  floatingBtnText: { fontSize: 28, color: "#1a1a1a", fontWeight: "bold" },
});
