import { addDoc, collection } from "firebase/firestore";
import { db } from "./FirebaseConfig";

const pets = [
  // 🐶 Dogs (3)
  {
    name: "Goldy",
    age: 5,
    breed: "Golden Retriever",
    category: "Dogs",
    imageUrl: "https://images.unsplash.com/photo-1558788353-f76d92427f16",
    sex: "Male",
  },
  {
    name: "Milo",
    age: 2,
    breed: "Pug",
    category: "Dogs",
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a",
    sex: "Male",
  },
  {
    name: "Bella",
    age: 4,
    breed: "Labrador",
    category: "Dogs",
    imageUrl: "https://images.unsplash.com/photo-1507146426996-ef05306b995a",
    sex: "Female",
  },

  // 🐱 Cats (3)
  {
    name: "Luna",
    age: 3,
    breed: "British Shorthair",
    category: "Cat",
    imageUrl: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131",
    sex: "Female",
  },
  {
    name: "Tom",
    age: 1,
    breed: "American Shorthair",
    category: "Cat",
    imageUrl: "https://images.unsplash.com/photo-1595433707802-44f6aeb0d9e7",
    sex: "Male",
  },
  {
    name: "Mimi",
    age: 2,
    breed: "Persian",
    category: "Cat",
    imageUrl: "https://images.unsplash.com/photo-1516972810927-80185027ca84",
    sex: "Female",
  },

  // 🐦 Birds (3)
  {
    name: "Sky",
    age: 1,
    breed: "Parrot",
    category: "Bird",
    imageUrl: "https://images.unsplash.com/photo-1555169062-013468b47731",
    sex: "Male",
  },
  {
    name: "Sunny",
    age: 2,
    breed: "Canary",
    category: "Bird",
    imageUrl: "https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13",
    sex: "Female",
  },
  {
    name: "Rio",
    age: 3,
    breed: "Macaw",
    category: "Bird",
    imageUrl: "https://images.unsplash.com/photo-1501706362039-c6e15c6d0f2a",
    sex: "Male",
  },

  // 🐟 Fish (3)
  {
    name: "Nemo",
    age: 1,
    breed: "Clownfish",
    category: "Fish",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    sex: "Male",
  },
  {
    name: "Goldie",
    age: 1,
    breed: "Goldfish",
    category: "Fish",
    imageUrl: "https://images.unsplash.com/photo-1544551763-ced8a2c28b10",
    sex: "Female",
  },
  {
    name: "Blue",
    age: 2,
    breed: "Betta",
    category: "Fish",
    imageUrl: "https://images.unsplash.com/photo-1552083375-1447ce886485",
    sex: "Male",
  },
];

export const seedPets = async () => {
  try {
    for (const pet of pets) {
      await addDoc(collection(db, "Pets"), pet);
    }
    console.log("✅ Seed 12 pets thành công!");
  } catch (err) {
    console.error("❌ Lỗi seed pets:", err);
  }
};
