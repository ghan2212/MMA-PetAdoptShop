import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AboutPet from "../../components/PetDetails/AboutPet";
import MakeFav from "../../components/MakeFav";
import OwnerInfo from "../../components/PetDetails/OwnerInfo";
import PetInfo from "../../components/PetDetails/PetInfo";
import PetSubInfo from "../../components/PetDetails/PetSubInfo";
import Colors from "../../constants/Colors";

export default function PetDetails() {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const { user } = useUser();

  const pet = params?.pet ? JSON.parse(params.pet) : null;
  const myEmail = user?.primaryEmailAddress?.emailAddress;
  const isOwner = myEmail === pet?.user?.email;

  useEffect(() => {
    navigation.setOptions({
      headerTransparent: true,
      headerTitle: "",
      headerRight: () => <MakeFav pet={pet} />,
    });
  }, []);

  if (!pet) return null;

  const onAdopt = () => {
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
    <View style={{ flex: 1 }}>
      <ScrollView>
        <PetInfo pet={pet} />
        <PetSubInfo pet={pet} />
        <AboutPet pet={pet} />
        <OwnerInfo pet={pet} />
        <View style={{ height: 80 }} />
      </ScrollView>

      {!isOwner && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.adoptBtn} onPress={onAdopt}>
            <Text style={styles.adoptText}>💬 Nhắn tin nhận nuôi</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  adoptBtn: {
    padding: 18,
    backgroundColor: Colors.PRIMAEY,
    borderRadius: 0,
    alignItems: "center",
  },
  adoptText: {
    fontFamily: "outfit-bold",
    fontSize: 18,
    color: "#1a1a1a",
  },
  bottomContainer: {
    position: "absolute",
    width: "100%",
    bottom: 0,
  },
});
