import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../../App";

type RegistroScreenProp = NativeStackNavigationProp<
  RootStackParamList,
  "Registro"
>;

const RegistroScreen: React.FC = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    nome: false,
    email: false,
    senha: false,
    confirmarSenha: false,
  });

  const { registro, usuario } = useAuth();
  const navigation = useNavigation<RegistroScreenProp>();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    if (usuario) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    }
  }, [usuario]);

  const getFieldError = (field: string): string | null => {
    if (field === "nome" && touched.nome && !nome.trim()) {
      return "O nome é obrigatório";
    }
    if (field === "email" && touched.email) {
      if (!email.trim()) return "O email é obrigatório";
      if (!emailRegex.test(email)) return "Digite um email válido";
    }
    if (field === "senha" && touched.senha) {
      if (!senha.trim()) return "A senha é obrigatória";
      if (senha.length < 8) return "A senha deve ter no mínimo 8 caracteres";
    }
    if (field === "confirmarSenha" && touched.confirmarSenha) {
      if (!confirmarSenha.trim()) return "Confirme sua senha";
      if (senha !== confirmarSenha) return "As senhas não conferem";
    }
    return null;
  };

  const handleSubmit = async () => {
    setErro("");
    setLoading(true);

    setTouched({
      nome: true,
      email: true,
      senha: true,
      confirmarSenha: true,
    });

    if (
      !nome ||
      !email ||
      !senha ||
      !confirmarSenha ||
      !emailRegex.test(email) ||
      senha.length < 8 ||
      senha !== confirmarSenha
    ) {
      setErro("Verifique os campos destacados e tente novamente");
      setLoading(false);
      return;
    }

    try {
      await registro(nome, email, senha);

      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (error: any) {
      console.error("Erro no registro:", error);

      if (error.response) {
        switch (error.response.status) {
          case 400:
            setErro("Os dados enviados são inválidos. Verifique e tente novamente.");
            break;
          case 409:
            setErro("Este e-mail já está cadastrado. Tente outro.");
            break;
          case 500:
            setErro("Erro interno no servidor. Tente novamente mais tarde.");
            break;
          default:
            setErro("Falha ao criar conta. Verifique os dados e tente novamente.");
        }
      } else if (error.request) {
        setErro("Não foi possível conectar ao servidor. Verifique sua internet.");
      } else {
        setErro("Ocorreu um erro inesperado. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>Criar nova conta</Text>
        <Text style={styles.subtitle}>
          Preencha os dados abaixo para começar
        </Text>

        {erro ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        ) : null}

        {/* Nome */}
        <TextInput
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
          onBlur={() => setTouched((prev) => ({ ...prev, nome: true }))}
          style={[
            styles.input,
            getFieldError("nome") && styles.inputError,
          ]}
        />
        {getFieldError("nome") && (
          <Text style={styles.inlineError}>{getFieldError("nome")}</Text>
        )}

        {/* Email */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[
            styles.input,
            getFieldError("email") && styles.inputError,
          ]}
        />
        {getFieldError("email") && (
          <Text style={styles.inlineError}>{getFieldError("email")}</Text>
        )}

        {/* Senha */}
        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          onBlur={() => setTouched((prev) => ({ ...prev, senha: true }))}
          secureTextEntry
          style={[
            styles.input,
            getFieldError("senha") && styles.inputError,
          ]}
        />
        {getFieldError("senha") && (
          <Text style={styles.inlineError}>{getFieldError("senha")}</Text>
        )}

        {/* Confirmar Senha */}
        <TextInput
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          onBlur={() =>
            setTouched((prev) => ({ ...prev, confirmarSenha: true }))
          }
          secureTextEntry
          style={[
            styles.input,
            getFieldError("confirmarSenha") && styles.inputError,
          ]}
        />
        {getFieldError("confirmarSenha") && (
          <Text style={styles.inlineError}>
            {getFieldError("confirmarSenha")}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.disabledBtn]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Criar conta</Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta?</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            style={styles.secondaryBtn}
          >
            <Text style={styles.secondaryText}>Fazer login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RegistroScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#F4F9FF",
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 5,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 5,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#EF4444",
    backgroundColor: "#FFF5F5",
  },
  inlineError: {
    color: "#B91C1C",
    fontSize: 13,
    marginBottom: 6,
  },
  errorBox: {
    backgroundColor: "#FEE2E2",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    paddingVertical: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  primaryText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  disabledBtn: {
    opacity: 0.7,
  },
  loginContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  loginText: {
    color: "#6B7280",
    marginBottom: 8,
  },
  secondaryBtn: {
    borderColor: "#2563EB",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  secondaryText: {
    color: "#2563EB",
    fontWeight: "bold",
  },
});
