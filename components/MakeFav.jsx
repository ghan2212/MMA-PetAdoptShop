import { useUser } from "@clerk/clerk-expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useState } from "react";
import { TouchableOpacity } from "react-native";
import Shared from "../Shared/Shared";
import Colors from "../constants/Colors";

export default function MakeFav({ pet }) {
  const { user } = useUser();
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    user && getFav();
  }, [user]);

  const getFav = async () => {
    const result = await Shared.GetFavList(user);
    const favList = result?.favorites || [];
    setIsFav(favList.includes(pet?.id));
  };

  const toggleFav = async () => {
    const result = await Shared.GetFavList(user);
    const favList = result?.favorites || [];
    let newList;
    if (favList.includes(pet?.id)) {
      newList = favList.filter((id) => id !== pet?.id);
      setIsFav(false);
    } else {
      newList = [...favList, pet?.id];
      setIsFav(true);
    }
    await Shared.UpdateFav(user, newList);
  };

  return (
    <TouchableOpacity onPress={toggleFav} style={{ marginRight: 10, backgroundColor: "rgba(255,255,255,0.9)", padding: 8, borderRadius: 20 }}>
      <Ionicons
        name={isFav ? "heart" : "heart-outline"}
        size={26}
        color={isFav ? "#e53935" : Colors.GRAY}
      />
    </TouchableOpacity>
  );
}
