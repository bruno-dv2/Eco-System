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
import { useAuth } from "../contexts/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({ email: false, senha: false });
  const { login } = useAuth();
  const navigation = useNavigation<any>();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getFieldError = (field: string): string | null => {
    if (field === "email" && touched.email) {
      if (!email.trim()) return "O e-mail é obrigatório";
      if (!emailRegex.test(email)) return "Digite um e-mail válido";
    }
    if (field === "senha" && touched.senha) {
      if (!senha.trim()) return "A senha é obrigatória";
      if (senha.length < 8) return "A senha deve ter no mínimo 8 caracteres";
    }
    return null;
  };

  const handleSubmit = async () => {
    setErro("");
    setTouched({ email: true, senha: true });

    if (
      !email ||
      !senha ||
      !emailRegex.test(email) ||
      senha.length < 8
    ) {
      setErro("Verifique os campos destacados e tente novamente");
      return;
    }

    try {
      setLoading(true);
      await login(email, senha);

      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (error: any) {
      console.error("Erro no login:", error);

      if (error.response) {
        const status = error.response.status;
        const msg = error.response.data?.message;

        if (status === 401) {
          setErro("E-mail ou senha incorretos. Tente novamente.");
        } else if (status === 400) {
          setErro("Credenciais inválidas. Verifique e tente novamente.");
        } else if (status === 500) {
          setErro("Erro no servidor. Tente novamente mais tarde.");
        } else if (msg) {
          setErro(msg);
        } else {
          setErro("Falha no login. Verifique suas credenciais.");
        }
      } else {
        setErro("Falha na conexão. Verifique sua internet.");
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
          <Text style={styles.title}>Bem-vindo de volta!</Text>
          <Text style={styles.subtitle}>
            Entre com suas credenciais para acessar sua conta
          </Text>

          {erro ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          {/* Campo de e-mail */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={[
                styles.input,
                getFieldError("email") && styles.inputError,
              ]}
              value={email}
              onChangeText={setEmail}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              placeholder="Digite seu e-mail"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {getFieldError("email") && (
              <Text style={styles.inlineError}>{getFieldError("email")}</Text>
            )}
          </View>

          {/* Campo de senha */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={[
                styles.input,
                getFieldError("senha") && styles.inputError,
              ]}
              value={senha}
              onChangeText={setSenha}
              onBlur={() => setTouched((prev) => ({ ...prev, senha: true }))}
              placeholder="Digite sua senha"
              secureTextEntry
            />
            {getFieldError("senha") && (
              <Text style={styles.inlineError}>{getFieldError("senha")}</Text>
            )}
          </View>

          {/* Botão de login */}
          <TouchableOpacity
            style={[styles.button, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          {/* Rodapé */}
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

        <TouchableOpacity
          style={styles.forgotPassword}
          onPress={() => navigation.navigate("RecuperarSenha")}
        >
          <Text style={styles.forgotPasswordText}>
            Esqueceu sua senha?{" "}
            <Text style={styles.recoverText}>Recuperar senha</Text>
          </Text>
        </TouchableOpacity>
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
    borderRadius: 4,
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
  },
  inlineError: {
    color: "#B91C1C",
    fontSize: 13,
    marginTop: 4,
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
  forgotPassword: {
    marginTop: 18,
    alignItems: "center",
  },
  forgotPasswordText: {
    color: "#374151",
    fontSize: 14,
  },
  recoverText: {
    color: "#2563EB",
    fontWeight: "bold",
  },
});
