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
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";

const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<any>();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleEnviar = async () => {
    setErro("");
    setSucesso("");

    if (!email.trim()) {
      setErro("Preencha o campo de e-mail");
      return;
    }

    if (!emailRegex.test(email)) {
      setErro("Digite um e-mail válido");
      return;
    }

    try {
      setLoading(true);

      // 🔹 Consumo do endpoint backend
      const response = await api.post("/auth/recuperacao", { email });

      // ✅ Resposta esperada de sucesso
      if (response.status === 200) {
        setSucesso("Um e-mail de recuperação foi enviado com sucesso!");
        setEmail("");
        setTimeout(() => setSucesso(""), 5000);
      }
    } catch (error: any) {
      console.error("Erro na recuperação:", error);

      if (error.response) {
        const status = error.response.status;
        const msg = error.response.data?.message;

        // 🔹 Tratamento refinado por status
        if (status === 404) {
          setErro("E-mail não encontrado. Verifique e tente novamente.");
        } else if (status === 400) {
          setErro("O e-mail informado é inválido.");
        } else if (status === 500) {
          setErro("Erro interno do servidor. Tente novamente mais tarde.");
        } else if (msg) {
          setErro(msg);
        } else {
          setErro("Falha ao enviar e-mail de recuperação.");
        }
      } else {
        setErro("Não foi possível conectar ao servidor. Verifique sua internet.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.box}>
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.subtitle}>
            Digite seu e-mail para receber um código de recuperação
          </Text>

          {erro ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          {sucesso ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>{sucesso}</Text>
            </View>
          ) : null}

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[
                styles.input,
                erro && !emailRegex.test(email) ? styles.inputError : null,
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleEnviar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>Voltar ao login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RecuperarSenha;

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
    fontSize: 26,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
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
    borderRadius: 4,
  },
  successBox: {
    backgroundColor: "#D1FAE5",
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    marginBottom: 16,
    borderRadius: 4,
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
  },
  successText: {
    color: "#047857",
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
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  button: {
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  backBtn: {
    marginTop: 16,
    alignItems: "center",
  },
  backText: {
    color: "#2563EB",
    fontWeight: "bold",
  },
});
