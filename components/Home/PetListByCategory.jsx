import { collection, getDocs, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, View } from "react-native";

import { db } from "../../config/FirebaseConfig";
import Category from "./Category";
import PetListItem from "./PetListItem";

export default function PetListByCategory() {
  const [petList, setPetList] = useState([]);
  const [loader, setLoader] = useState(false);
  useEffect(() => {
    GetPetList("Dogs");
  }, []);

  /**
   *
   * ủe to get petList on Category selection
   *  @param {*} category
   */

  const GetPetList = async (category) => {
    setLoader(true);
    setPetList([]);

    if (!category) return;

    const q = query(collection(db, "Pets"), where("category", "==", category));
    const snapshot = await getDocs(q);

    const pets = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setPetList(pets);
    setLoader(false);
  };

  return (
    <View>
      <Category onSelectCategory={(name) => GetPetList(name)} />
      <FlatList
        data={petList}
        style={{ marginTop: 10 }}
        horizontal={true}
        refreshing={loader}
        onRefresh={() => GetPetList("Dogs")}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PetListItem pet={item} />}
      />
    </View>
  );
}
