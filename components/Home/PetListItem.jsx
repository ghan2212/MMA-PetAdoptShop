import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Colors from "../../constants/Colors";
import MarkFav from "./../../components/MakeFav";

export default function PetListItem({ pet, onRemoveFav }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: "/pet-details",
          params: {
            pet: JSON.stringify(pet),
          },
        })
      }
      style={{
        padding: 10,
        marginRight: 15,
        backgroundColor: Colors.WHITE,
        borderRadius: 10,
      }}
    >
      <View
        style={{
          position: "absolute",
          zIndex: 10,
          right: 10,
          top: 10,
        }}
      >
        <MarkFav
          pet={pet}
          color={"white"}
          onRemoveFav={() => onRemoveFav && onRemoveFav(pet.id)}
        />
      </View>

      <Image
        source={{ uri: pet?.imageUrl }}
        style={{
          width: 150,
          height: 135,
          borderRadius: 10,
        }}
      />

      <Text
        style={{
          fontFamily: "outfit-medium",
          fontSize: 18,
        }}
      >
        {pet?.name}
      </Text>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: Colors.GRAY,
            fontFamily: "outfit",
          }}
        >
          {pet?.breed}
        </Text>

        <Text
          style={{
            fontFamily: "outfit",
            color: Colors.PRIMAEY,
            paddingHorizontal: 7,
            borderRadius: 10,
            fontSize: 11,
            backgroundColor: Colors.LIGHT_PRIMARY,
          }}
        >
          {pet?.age} YRS
        </Text>
      </View>
    </TouchableOpacity>
  );
}
