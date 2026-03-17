import Feather from "@expo/vector-icons/Feather";
import Fontisto from "@expo/vector-icons/Fontisto";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";
import Colors from "./../../constants/Colors";

import { useUser } from "@clerk/clerk-expo";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../config/FirebaseConfig";

export default function TabLayout() {
  const { user } = useUser();
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    if (user) {
      getMessages();
    }
  }, [user]);

  const getMessages = async () => {
    try {
      const email = user?.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const q = query(
        collection(db, "Messages"),
        where("users", "array-contains", email),
      );

      const snapshot = await getDocs(q);

      setMessageCount(snapshot.size);
    } catch (error) {
      console.log("Message badge error:", error);
    }
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.PRIMARY,
        tabBarInactiveTintColor: Colors.GRAY,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#f0f0f0",
          elevation: 8,
          shadowOpacity: 0.08,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
          backgroundColor: "#fff",
        },
        tabBarLabelStyle: {
          fontFamily: "outfit",
          fontSize: 12,
        },
      }}
    >
      {/* HOME */}
      <Tabs.Screen
        name="home"
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          ),
        }}
      />

      {/* FAVORITE */}
      <Tabs.Screen
        name="favorite"
        options={{
          title: "Yêu thích",
          tabBarIcon: ({ color }) => (
            <Fontisto name="heart" size={22} color={color} />
          ),
        }}
      />

      {/* INBOX */}
      <Tabs.Screen
        name="inbox"
        options={{
          title: "Tin nhắn",
          tabBarIcon: ({ color }) => (
            <Feather name="message-circle" size={24} color={color} />
          ),

          // badge logic
          tabBarBadge:
            messageCount > 0 ? (messageCount > 9 ? "9+" : messageCount) : null,

          tabBarBadgeStyle: {
            backgroundColor: "#FF3B30",
            color: "#fff",
            fontSize: 10,
            fontFamily: "outfit-bold",
            minWidth: 18,
            height: 18,
            borderRadius: 9,
          },
        }}
      />

      {/* PROFILE */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Hồ sơ",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
