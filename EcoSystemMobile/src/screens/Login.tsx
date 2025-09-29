import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const { login } = useAuth(); // pega login do contexto
  const navigation = useNavigation<any>();

  const handleSubmit = async () => {
    setErro("");

    if (!email || !senha) {
      setErro("Preencha todos os campos");
      return;
    }

    if (senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    try {
      await login(email, senha); // chama login do AuthContext
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }], // garante que não volta pro login com "back"
      });
    } catch (error: any) {
      setErro(error?.message || "Falha no login. Verifique suas credenciais.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>
            Entre com suas credenciais para acessar sua conta
          </Text>

          {erro ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="Digite sua senha"
              secureTextEntry
            />
            <Text style={styles.helperText}>
              A senha deve ter no mínimo 8 caracteres
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Não tem uma conta?</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Registro")}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>Criar nova conta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#F4F9FF",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    marginBottom: 16,
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#374151",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#111827",
  },
  helperText: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#806b71ff",
    fontSize: 14,
  },
  linkButton: {
    marginTop: 6,
  },
  linkText: {
    color: "#2563EB",
    fontWeight: "bold",
    fontSize: 14,
  },
});
