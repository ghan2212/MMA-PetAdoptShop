import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { db } from "../../config/FirebaseConfig";
import Colors from "../../constants/Colors";

export default function Favorite() {
  const { user } = useUser();
  const router = useRouter();
  const [favPets, setFavPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFavorites = async () => {
    setLoading(true);
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;
      const docSnap = await getDoc(doc(db, "UserFavPet", email));
      if (docSnap.exists()) {
        const favIds = docSnap.data()?.favorites || [];
        if (favIds.length === 0) { setFavPets([]); setLoading(false); return; }
        // Fetch each pet
        const results = [];
        for (const id of favIds) {
          const q = query(collection(db, "Pets"), where("id", "==", id));
          const snap = await getDocs(q);
          snap.forEach((d) => results.push({ docId: d.id, ...d.data() }));
        }
        setFavPets(results);
      }
    } catch (e) {
      console.error(e);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchFavorites(); }, [user]);

  const renderPet = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/pet-details", params: { pet: JSON.stringify(item) } })}
    >
      <Image
        source={item.imageUrl ? { uri: item.imageUrl } : require("../../assets/images/placeholder.png")}
        style={styles.petImg}
      />
      <View style={styles.overlay}>
        <View style={styles.badge}><Text style={styles.badgeText}>{item.category}</Text></View>
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.petName}>{item.name}</Text>
        <Text style={styles.petBreed}>{item.breed}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>🎂 {item.age}</Text>
          <Text style={styles.metaText}>📍 {item.address}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yêu thích ❤️</Text>
        <Text style={styles.headerSub}>{favPets.length} thú cưng</Text>
      </View>
      <FlatList
        data={favPets}
        keyExtractor={(item) => item.docId}
        renderItem={renderPet}
        numColumns={2}
        columnWrapperStyle={{ gap: 12 }}
        contentContainerStyle={favPets.length === 0 ? { flex: 1 } : { padding: 16, gap: 12 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchFavorites} tintColor={Colors.PRIMAEY} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🐾</Text>
              <Text style={styles.emptyText}>Chưa có thú cưng yêu thích</Text>
              <Text style={styles.emptySubText}>Nhấn ❤️ trên thú cưng bạn thích để lưu vào đây</Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: Colors.WHITE, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  headerTitle: { fontFamily: "outfit-bold", fontSize: 28, color: "#1a1a1a" },
  headerSub: { fontFamily: "outfit", fontSize: 14, color: Colors.GRAY, marginTop: 2 },
  card: { flex: 1, backgroundColor: Colors.WHITE, borderRadius: 16, overflow: "hidden", elevation: 3, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  petImg: { width: "100%", height: 140 },
  overlay: { position: "absolute", top: 8, left: 8 },
  badge: { backgroundColor: Colors.PRIMAEY, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: "outfit-medium", fontSize: 11, color: "#1a1a1a" },
  cardInfo: { padding: 10 },
  petName: { fontFamily: "outfit-bold", fontSize: 15, color: "#1a1a1a" },
  petBreed: { fontFamily: "outfit", fontSize: 12, color: Colors.GRAY },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 4, flexWrap: "wrap" },
  metaText: { fontFamily: "outfit", fontSize: 11, color: Colors.GRAY },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontFamily: "outfit-bold", fontSize: 20, color: "#333", textAlign: "center" },
  emptySubText: { fontFamily: "outfit", fontSize: 15, color: Colors.GRAY, textAlign: "center", marginTop: 8, lineHeight: 22 },
});
