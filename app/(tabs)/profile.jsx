import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Ionicons from "@expo/vector-icons/Ionicons";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../config/FirebaseConfig";
import Colors from "../../constants/Colors";

export default function Profile() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const router = useRouter();

  const [postCount, setPostCount] = useState(0);
  const [favoriteCount, setFavoriteCount] = useState(0);

  useEffect(() => {
    if (user) {
      getUserPets();
      getFavorites();
      getMessages();
    }
  }, [user]);

  // get pets count
  const getUserPets = async () => {
    const q = query(
      collection(db, "Pets"),
      where("user.email", "==", user?.primaryEmailAddress?.emailAddress),
    );

    const snapshot = await getDocs(q);
    setPostCount(snapshot.size);
  };

  const getFavorites = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const docSnap = await getDoc(doc(db, "UserFavPet", email));

      if (docSnap.exists()) {
        const favIds = docSnap.data()?.favorites || [];
        setFavoriteCount(favIds.length);
      } else {
        setFavoriteCount(0);
      }
    } catch (error) {
      console.log("Favorite error:", error);
    }
  };

  const getMessages = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;

      const q = query(
        collection(db, "Messages"),
        where("users", "array-contains", email),
      );

      const snapshot = await getDocs(q);
    } catch (error) {
      console.log("Message error:", error);
    }
  };
  const onSignOut = () => {
    Alert.alert("Sign Out", "Do you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => signOut() },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          {user?.imageUrl ? (
            <Image source={{ uri: user.imageUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback]}>
              <Text style={styles.avatarLetter}>
                {user?.fullName?.[0]?.toUpperCase() || "U"}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.name}>{user?.fullName}</Text>
        <Text style={styles.email}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{postCount}</Text>
          <Text style={styles.statLabel}>Posted</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statItem}>
          <Text style={styles.statNum}>{favoriteCount}</Text>
          <Text style={styles.statLabel}>Favorites</Text>
        </View>

        {/* <View style={styles.divider} /> */}
        {/* 
        <View style={styles.statItem}>
          <Text style={styles.statNum}>{messageCount}</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View> */}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        <MenuItem
          icon="paw"
          label="My Pets"
          onPress={() => router.push("/my-pets")}
        />

        <MenuItem
          icon="heart"
          label="Favorite Pets"
          onPress={() => router.push("/(tabs)/favorite")}
        />

        <MenuItem
          icon="chatbubble"
          label="Messages"
          onPress={() => router.push("/(tabs)/inbox")}
        />

        <MenuItem
          icon="document-text"
          label="Manage Posts"
          onPress={() => router.push("/manage-posts")}
        />
      </View>

      {/* Settings */}
      {/* <View style={styles.menu}>
        <MenuItem icon="settings" label="Settings" />
        <MenuItem icon="notifications" label="Notifications" />
        <MenuItem icon="help-circle" label="Help & Support" />
      </View> */}

      {/* Logout */}
      <TouchableOpacity style={styles.logoutBtn} onPress={onSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#d32f2f" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Pet Adopt v1.0.0</Text>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Ionicons name={icon} size={22} color={Colors.PRIMAEY} />
        <Text style={styles.menuText}>{label}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#aaa" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fafafa" },

  header: {
    backgroundColor: Colors.PRIMAEY,
    paddingTop: 70,
    paddingBottom: 30,
    alignItems: "center",
  },

  avatarWrapper: { marginBottom: 12 },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: "#fff",
  },

  avatarFallback: {
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarLetter: {
    fontSize: 36,
    fontFamily: "outfit-bold",
    color: Colors.PRIMAEY,
  },

  name: {
    fontSize: 20,
    fontFamily: "outfit-bold",
    color: "#1a1a1a",
  },

  email: {
    fontSize: 14,
    fontFamily: "outfit",
    color: "#555",
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 16,
    padding: 16,
    justifyContent: "space-between",
  },

  statItem: { flex: 1, alignItems: "center" },

  statNum: {
    fontSize: 22,
    fontFamily: "outfit-bold",
  },

  statLabel: {
    fontSize: 13,
    fontFamily: "outfit",
    color: Colors.GRAY,
  },

  divider: {
    width: 1,
    backgroundColor: "#eee",
  },

  menu: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },

  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  menuText: {
    fontSize: 15,
    fontFamily: "outfit-medium",
  },

  logoutBtn: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    margin: 20,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#fff0f0",
  },

  logoutText: {
    fontSize: 16,
    fontFamily: "outfit-bold",
    color: "#d32f2f",
  },

  version: {
    textAlign: "center",
    fontSize: 12,
    fontFamily: "outfit",
    color: "#888",
  },
});
