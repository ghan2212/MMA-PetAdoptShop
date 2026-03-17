import { useUser } from "@clerk/clerk-expo";
import { useLocalSearchParams, useNavigation } from "expo-router";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { db } from "../../config/FirebaseConfig";
import Colors from "../../constants/Colors";

export default function ChatScreen() {
  const { user } = useUser();
  const params = useLocalSearchParams();
  const navigation = useNavigation();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  const flatListRef = useRef(null);

  const ownerEmail = params?.ownerEmail;
  const ownerName = params?.ownerName;
  const ownerImage = params?.ownerImage;
  const petName = params?.petName;

  const myEmail = user?.primaryEmailAddress?.emailAddress;

  const chatId = [myEmail, ownerEmail].sort().join("_").replace(/[@.]/g, "_");

  // HEADER
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      headerTitle: () => (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          {ownerImage ? (
            <Image
              source={{ uri: ownerImage }}
              style={{ width: 36, height: 36, borderRadius: 18 }}
            />
          ) : (
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: Colors.PRIMARY,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontFamily: "outfit-bold", fontSize: 16 }}>
                {ownerName?.[0]?.toUpperCase()}
              </Text>
            </View>
          )}

          <View>
            <Text style={{ fontFamily: "outfit-bold", fontSize: 16 }}>
              {ownerName || "Người dùng"}
            </Text>

            {petName && (
              <Text
                style={{
                  fontFamily: "outfit",
                  fontSize: 12,
                  color: Colors.GRAY,
                }}
              >
                về {petName}
              </Text>
            )}
          </View>
        </View>
      ),
    });
  }, [ownerName, ownerImage, petName]);

  // REALTIME MESSAGE LISTENER
  useEffect(() => {
    const messagesRef = collection(db, "Chat", chatId, "Messages");

    const q = query(messagesRef, orderBy("createdAt", "asc"));

    const unsub = onSnapshot(q, async (snap) => {
      const msgs = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      setMessages(msgs);

      // mark messages as read
      snap.docs.forEach(async (d) => {
        const data = d.data();

        if (data.senderEmail !== myEmail && !data.isRead) {
          await updateDoc(d.ref, {
            isRead: true,
          });
        }
      });

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });

    return unsub;
  }, [chatId]);

  // SEND MESSAGE
  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;

    setInputText("");

    try {
      await setDoc(
        doc(db, "Chat", chatId),
        {
          id: chatId,
          users: [
            {
              email: myEmail,
              imageUrl: user?.imageUrl || "",
              name: user?.fullName || "",
            },
            {
              email: ownerEmail,
              imageUrl: ownerImage || "",
              name: ownerName || "",
            },
          ],
          lastMessage: text,
          lastMessageTime: serverTimestamp(),
          petName: petName || "",
        },
        { merge: true },
      );

      await addDoc(collection(db, "Chat", chatId, "Messages"), {
        text,
        senderEmail: myEmail,
        senderName: user?.fullName,
        createdAt: serverTimestamp(),
        isRead: false,
      });
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  // MESSAGE UI
  const renderMessage = ({ item }) => {
    const isMe = item.senderEmail === myEmail;

    return (
      <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
        <View>
          <View
            style={[
              styles.msgBubble,
              isMe ? styles.bubbleMe : styles.bubbleThem,
            ]}
          >
            <Text
              style={[
                styles.msgText,
                isMe ? styles.msgTextMe : styles.msgTextThem,
              ]}
            >
              {item.text}
            </Text>
          </View>

          {isMe && (
            <Text style={styles.readStatus}>
              {item.isRead ? "Đã đọc" : "Đã gửi"}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* INPUT */}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Nhắn tin..."
          placeholderTextColor={Colors.GRAY}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />

        <Pressable
          onPress={sendMessage}
          style={[styles.sendBtn, !inputText.trim() && styles.sendBtnDisabled]}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },

  messagesList: {
    padding: 16,
    paddingBottom: 8,
  },

  msgRow: {
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "flex-end",
  },

  msgRowMe: {
    justifyContent: "flex-end",
  },

  msgRowThem: {
    justifyContent: "flex-start",
  },

  msgBubble: {
    maxWidth: "85%",
    flexShrink: 1,
    minWidth: 60,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  bubbleMe: {
    backgroundColor: Colors.PRIMARY,
    borderBottomRightRadius: 4,
    alignSelf: "flex-end",
  },

  bubbleThem: {
    backgroundColor: Colors.WHITE,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#eee",
    alignSelf: "flex-start",
  },

  msgText: {
    fontFamily: "outfit",
    fontSize: 15,
    lineHeight: 21,
    flexWrap: "wrap",
  },
  msgTextMe: {
    color: "#1a1a1a",
  },

  msgTextThem: {
    color: "#333",
  },

  readStatus: {
    fontSize: 11,
    fontFamily: "outfit",
    color: "#888",
    marginTop: 2,
    textAlign: "right",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 12,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    gap: 10,
  },

  input: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontFamily: "outfit",
    fontSize: 15,
    maxHeight: 100,
  },

  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.PRIMARY,
    alignItems: "center",
    justifyContent: "center",
  },

  sendBtnDisabled: {
    backgroundColor: "#e0e0e0",
  },

  sendIcon: {
    fontSize: 18,
    color: "#1a1a1a",
  },
});
