import { useUser } from "@clerk/clerk-expo";
import { Stack, useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
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

export default function MyPets() {
  const { user } = useUser();
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;
    const q = query(collection(db, "Pets"), where("user.email", "==", email));
    const unsub = onSnapshot(q, (snap) => {
      setPets(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const renderPet = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        router.push({ pathname: "/pet-details", params: { pet: JSON.stringify(item) } })
      }
    >
      <Image
        source={
          item.imageUrl
            ? { uri: item.imageUrl }
            : require("../../assets/images/placeholder.png")
        }
        style={styles.petImg}
      />
      <View style={styles.cardInfo}>
        <View style={styles.badgeRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>{item.category}</Text></View>
          <View style={[styles.badge, { backgroundColor: item.gender === "Đực" ? "#e3f2fd" : "#fce4ec" }]}>
            <Text style={[styles.badgeText, { color: item.gender === "Đực" ? "#1565c0" : "#c62828" }]}>
              {item.gender === "Đực" ? "♂" : "♀"} {item.gender}
            </Text>
          </View>
        </View>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
        <Text style={styles.petMeta}>🎂 {item.age}  ·  📍 {item.address}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ title: "Thú cưng của tôi", headerShown: true }} />
      <View style={styles.container}>
        <FlatList
          data={pets}
          keyExtractor={(item) => item.docId}
          renderItem={renderPet}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={pets.length === 0 ? { flex: 1 } : { padding: 16, gap: 12 }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🐾</Text>
              <Text style={styles.emptyText}>Bạn chưa đăng thú cưng nào</Text>
              <Pressable style={styles.addBtn} onPress={() => router.push("/add-new-pet")}>
                <Text style={styles.addBtnText}>+ Đăng thú cưng</Text>
              </Pressable>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  card: { flex: 1, backgroundColor: Colors.WHITE, borderRadius: 16, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  petImg: { width: "100%", height: 130 },
  cardInfo: { padding: 10 },
  badgeRow: { flexDirection: "row", gap: 6, marginBottom: 6 },
  badge: { backgroundColor: Colors.LIGHT_PRIMARY, borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: "outfit", fontSize: 11, color: "#795548" },
  petName: { fontFamily: "outfit-bold", fontSize: 15, color: "#1a1a1a" },
  petBreed: { fontFamily: "outfit", fontSize: 12, color: Colors.GRAY },
  petMeta: { fontFamily: "outfit", fontSize: 12, color: Colors.GRAY, marginTop: 4 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontFamily: "outfit-bold", fontSize: 18, color: "#333", textAlign: "center" },
  addBtn: { marginTop: 20, backgroundColor: Colors.PRIMAEY, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14 },
  addBtnText: { fontFamily: "outfit-bold", fontSize: 16, color: "#1a1a1a" },
});
