import { Image } from "expo-image";
import { Text, View } from "react-native";
import Colors from "../../constants/Colors";
import MakeFav from "../MakeFav";
export default function PetInfo({ pet }) {
  return (
    <View>
      <Image
        source={{ uri: pet.imageUrl }}
        style={{
          width: "100%",
          height: 400,
          objectFit: "cover",
        }}
      />
      <View
        style={{
          padding: 30,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View>
          <Text style={{ fontFamily: "outfit-bold", fontSize: 27 }}>
            {pet?.name}
          </Text>

          <Text
            style={{
              color: Colors.GRAY,
              fontFamily: "outfit",
              fontSize: 16,
            }}
          >
            {pet?.address}
          </Text>
        </View>
        <MakeFav pet={pet} />
      </View>
    </View>
  );
}
