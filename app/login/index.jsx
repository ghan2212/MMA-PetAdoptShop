import { useAuth, useSignIn, useSignUp, useSSO } from "@clerk/clerk-expo";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Colors from "./../../constants/Colors";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();

  const { isSignedIn } = useAuth();
  const { startSSOFlow } = useSSO();

  const {
    signIn,
    setActive: setSignInActive,
    isLoaded: signInLoaded,
  } = useSignIn();

  const {
    signUp,
    setActive: setSignUpActive,
    isLoaded: signUpLoaded,
  } = useSignUp();

  const [mode, setMode] = useState("main");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Nếu đã đăng nhập thì chuyển luôn vào Home
  useEffect(() => {
    if (isSignedIn) {
      router.replace("/(tabs)/home");
    }
  }, [isSignedIn]);

  // LOGIN EMAIL
  const onEmailLogin = async () => {
    if (isSignedIn) {
      router.replace("/(tabs)/home");
      return;
    }

    if (!signInLoaded || !email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: email,
        password,
      });

      if (result.status === "complete") {
        await setSignInActive({
          session: result.createdSessionId,
        });

        router.replace("/(tabs)/home");
      }
    } catch (err) {
      Alert.alert(
        "Lỗi đăng nhập",
        err?.errors?.[0]?.longMessage || "Đăng nhập thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  // LOGIN GOOGLE
  const onGooglePress = useCallback(async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: Linking.createURL("/(tabs)/home"),
      });

      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace("/(tabs)/home");
      }
    } catch (err) {
      Alert.alert("Lỗi", "Đăng nhập Google thất bại.");
    }
  }, []);

  // REGISTER
  const onEmailRegister = async () => {
    if (!signUpLoaded || !email || !password || !firstName) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin.");
      return;
    }

    if (password.length < 8) {
      Alert.alert("Lỗi", "Mật khẩu phải ít nhất 8 ký tự.");
      return;
    }

    setLoading(true);

    try {
      await signUp.create({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setMode("verify");
    } catch (err) {
      Alert.alert(
        "Lỗi đăng ký",
        err?.errors?.[0]?.longMessage || "Đăng ký thất bại.",
      );
    } finally {
      setLoading(false);
    }
  };

  // VERIFY CODE
  const onVerifyCode = async () => {
    if (!signUpLoaded || !code) {
      Alert.alert("Lỗi", "Vui lòng nhập mã xác nhận.");
      return;
    }

    setLoading(true);

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (result.status === "complete") {
        await setSignUpActive({
          session: result.createdSessionId,
        });

        router.replace("/(tabs)/home");
      }
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err?.errors?.[0]?.longMessage || "Mã xác nhận không đúng.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===== VERIFY SCREEN =====

  if (mode === "verify") {
    return (
      <View style={styles.container}>
        <Image
          source={require("./../../assets/images/login.png")}
          style={styles.heroImage}
        />

        <View style={styles.card}>
          <Text style={styles.title}>Xác nhận Email</Text>

          <Text style={styles.subtitle}>
            Mã xác nhận đã gửi đến{"\n"}
            {email}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập mã 6 chữ số"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Pressable style={styles.primaryBtn} onPress={onVerifyCode}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.primaryBtnText}>Xác nhận</Text>
            )}
          </Pressable>

          <TouchableOpacity onPress={() => setMode("register")}>
            <Text style={styles.link}>← Quay lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ===== LOGIN SCREEN =====

  if (mode === "login") {
    return (
      <ScrollView style={styles.container}>
        <Image
          source={require("./../../assets/images/login.png")}
          style={styles.heroImage}
        />

        <View style={styles.card}>
          <Text style={styles.title}>Chào mừng trở lại 🐾</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />

          <Pressable style={styles.primaryBtn} onPress={onEmailLogin}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.primaryBtnText}>Đăng nhập</Text>
            )}
          </Pressable>

          <Pressable style={styles.googleBtn} onPress={onGooglePress}>
            <Text style={styles.googleText}>Đăng nhập với Google</Text>
          </Pressable>

          <TouchableOpacity onPress={() => setMode("register")}>
            <Text style={styles.link}>Chưa có tài khoản? Đăng ký ngay</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  // ===== MAIN SCREEN =====

  return (
    <View style={styles.container}>
      <Image
        source={require("./../../assets/images/login.png")}
        style={{ width: "100%", height: 420 }}
      />

      <View style={styles.card}>
        <Text style={styles.title}>Sẵn sàng kết bạn mới? 🐾</Text>

        <Pressable style={styles.googleBtn} onPress={onGooglePress}>
          <Text style={styles.googleText}>Tiếp tục với Google</Text>
        </Pressable>

        <Pressable style={styles.primaryBtn} onPress={() => setMode("login")}>
          <Text style={styles.primaryBtnText}>Đăng nhập bằng Email</Text>
        </Pressable>

        <TouchableOpacity onPress={() => setMode("register")}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.WHITE },

  heroImage: {
    width: "100%",
    height: 300,
    resizeMode: "cover",
  },

  card: {
    padding: 24,
  },

  title: {
    fontSize: 26,
    fontFamily: "outfit-bold",
    textAlign: "center",
    marginBottom: 20,
  },

  subtitle: {
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#f5f5f5",
    padding: 14,
    borderRadius: 12,
    marginVertical: 8,
  },

  primaryBtn: {
    backgroundColor: Colors.PRIMARY,
    padding: 16,
    borderRadius: 14,
    marginTop: 10,
    alignItems: "center",
  },

  primaryBtnText: {
    fontFamily: "outfit-bold",
    fontSize: 16,
  },

  googleBtn: {
    backgroundColor: "#f1f1f1",
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
    alignItems: "center",
  },

  googleText: {
    fontSize: 15,
  },

  link: {
    marginTop: 20,
    textAlign: "center",
    color: Colors.GRAY,
  },
});
