import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
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

export default function Inbox() {
  const { user } = useUser();
  const router = useRouter();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const myEmail = user?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (!myEmail) return;
    // users là array of objects {email, name, imageUrl}
    // dùng array-contains-any với object không hoạt động
    // → query tất cả Chat rồi filter phía client
    const q = query(
      collection(db, "Chat"),
      orderBy("lastMessageTime", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((chat) =>
          chat.users?.some((u) =>
            typeof u === "object" ? u.email === myEmail : u === myEmail
          )
        );
      setChats(data);
      setLoading(false);
    });
    return unsub;
  }, [myEmail]);

  const renderChat = ({ item }) => {
    // Tìm người kia trong array users (object hoặc string)
    const otherUser = item.users?.find((u) =>
      typeof u === "object" ? u.email !== myEmail : u !== myEmail
    );
    const otherEmail = typeof otherUser === "object" ? otherUser?.email : otherUser;
    const otherName = (typeof otherUser === "object" ? otherUser?.name : null)
      || otherEmail?.split("@")[0] || "Người dùng";
    const otherImage = typeof otherUser === "object" ? otherUser?.imageUrl : null;
    const time = item.lastMessageTime?.toDate?.();
    const timeStr = time
      ? time.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      : "";

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          router.push({
            pathname: "/chat",
            params: {
              ownerEmail: otherEmail,
              ownerName: otherName,
              ownerImage: otherImage || "",
              petName: item.petName || "",
            },
          })
        }
      >
        <View style={styles.avatarContainer}>
          {otherImage ? (
            <Image source={{ uri: otherImage }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>{otherName?.[0]?.toUpperCase()}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>{otherName}</Text>
            <Text style={styles.chatTime}>{timeStr}</Text>
          </View>
          {item.petName ? (
            <Text style={styles.chatPet}>🐾 {item.petName}</Text>
          ) : null}
          <Text style={styles.chatLastMsg} numberOfLines={1}>
            {item.lastMessage || "Bắt đầu trò chuyện..."}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tin nhắn</Text>
        <Text style={styles.headerSub}>{chats.length} cuộc hội thoại</Text>
      </View>

      {loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyText}>Đang tải...</Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={renderChat}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={() => {}} tintColor={Colors.PRIMAEY} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyText}>Chưa có tin nhắn nào</Text>
              <Text style={styles.emptySubText}>Khi bạn nhắn tin với chủ thú cưng, chúng sẽ hiện ở đây</Text>
            </View>
          }
          contentContainerStyle={chats.length === 0 ? { flex: 1 } : {}}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16, backgroundColor: Colors.WHITE, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  headerTitle: { fontFamily: "outfit-bold", fontSize: 28, color: "#1a1a1a" },
  headerSub: { fontFamily: "outfit", fontSize: 14, color: Colors.GRAY, marginTop: 2 },
  chatItem: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: Colors.WHITE, marginHorizontal: 16, marginTop: 12, borderRadius: 16, elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  avatarContainer: { marginRight: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  avatarFallback: { backgroundColor: Colors.PRIMAEY, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontFamily: "outfit-bold", fontSize: 22, color: "#1a1a1a" },
  chatInfo: { flex: 1 },
  chatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatName: { fontFamily: "outfit-bold", fontSize: 16, color: "#1a1a1a", flex: 1 },
  chatTime: { fontFamily: "outfit", fontSize: 12, color: Colors.GRAY },
  chatPet: { fontFamily: "outfit", fontSize: 12, color: Colors.PRIMAEY, marginVertical: 2 },
  chatLastMsg: { fontFamily: "outfit", fontSize: 14, color: Colors.GRAY },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyText: { fontFamily: "outfit-bold", fontSize: 20, color: "#333", textAlign: "center" },
  emptySubText: { fontFamily: "outfit", fontSize: 15, color: Colors.GRAY, textAlign: "center", marginTop: 8, lineHeight: 22 },
});
