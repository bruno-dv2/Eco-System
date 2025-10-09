import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
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
  const { registro, usuario } = useAuth();
  const navigation = useNavigation<RegistroScreenProp>();

  // Se já estiver logado, redireciona
  useEffect(() => {
    if (usuario) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    }
  }, [usuario]);

  const handleSubmit = async () => {
    setErro("");

    if (!nome || !email || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos");
      return;
    }

    if (senha.length < 8) {
      setErro("A senha deve ter no mínimo 8 caracteres");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não conferem");
      return;
    }

    try {
      await registro(nome, email, senha); // chama AuthContext.registro
      navigation.reset({
        index: 0,
        routes: [{ name: "Dashboard" }],
      });
    } catch (error: any) {
      setErro(
        error?.message ||
          "Falha ao criar conta. Verifique os dados e tente novamente."
      );
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

        <TextInput
          placeholder="Nome completo"
          value={nome}
          onChangeText={setNome}
          style={styles.input}
        />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          placeholder="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          style={styles.input}
        />
        <TextInput
          placeholder="Confirmar senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSubmit}>
          <Text style={styles.primaryText}>Criar conta</Text>
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
    marginBottom: 12,
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
  },
  primaryText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
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
