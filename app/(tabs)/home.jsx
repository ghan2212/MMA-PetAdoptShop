import { useAuth } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "../../components/Home/Header";
import PetListByCategory from "../../components/Home/PetListByCategory";
import Slider from "../../components/Home/Slider";


export default function Home() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) {
      router.replace("/login");
    }
  }, [isSignedIn]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerPad}>
          <Header />
        </View>

        {/* Slider */}
        <Slider />

        {/* Pet List */}
        <PetListByCategory />

        {/* Add New Pet Button */}
        <TouchableOpacity
          style={styles.addPetBtn}
          onPress={() => router.push("/add-new-pet")}
        >
          <Ionicons name="paw" size={20} color="#c89b00" />
          <Text style={styles.addPetText}>Add New Pet</Text>
        </TouchableOpacity>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  headerPad: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "#fff",
  },

  addPetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    padding: 16,
    marginHorizontal: 20,
    marginTop: 20,

    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#f2d38b",
    borderStyle: "dashed",

    backgroundColor: "#fff7e6",

    gap: 8,
  },

  addPetText: {
    fontFamily: "outfit-medium",
    fontSize: 16,
    color: "#c89b00",
  },
});
