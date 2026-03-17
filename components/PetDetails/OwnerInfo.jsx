import { useUser } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";

export default function OwnerInfo({ pet }) {
  const { user } = useUser();
  const router = useRouter();
  const myEmail = user?.primaryEmailAddress?.emailAddress;
  const isOwner = myEmail === pet?.user?.email;

  const onChat = () => {
    if (isOwner) return;
    router.push({
      pathname: "/chat",
      params: {
        ownerEmail: pet?.user?.email,
        ownerName: pet?.user?.name,
        ownerImage: pet?.user?.imageUrl || "",
        petName: pet?.name || "",
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {pet?.user?.imageUrl ? (
          <Image source={{ uri: pet.user.imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarLetter}>{pet?.user?.name?.[0]?.toUpperCase() || "U"}</Text>
          </View>
        )}
        <View>
          <Text style={styles.ownerName}>{pet?.user?.name || "Chủ thú cưng"}</Text>
          <Text style={styles.ownerLabel}>Chủ thú cưng</Text>
        </View>
      </View>
      {!isOwner && (
        <TouchableOpacity onPress={onChat} style={styles.chatBtn}>
          <Ionicons name="chatbubble-outline" size={18} color="#1a1a1a" />
          <Text style={styles.chatBtnText}>Nhắn tin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginHorizontal: 20, marginTop: 10, borderWidth: 1, borderRadius: 15,
    padding: 14, backgroundColor: Colors.WHITE, borderColor: Colors.PRIMAEY,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 50, height: 50, borderRadius: 25 },
  avatarFallback: { backgroundColor: Colors.PRIMAEY, alignItems: "center", justifyContent: "center" },
  avatarLetter: { fontFamily: "outfit-bold", fontSize: 20, color: "#1a1a1a" },
  ownerName: { fontFamily: "outfit-bold", fontSize: 15 },
  ownerLabel: { fontFamily: "outfit", color: Colors.GRAY, fontSize: 13 },
  chatBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: Colors.PRIMAEY, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  chatBtnText: { fontFamily: "outfit-medium", fontSize: 14, color: "#1a1a1a" },
});
