import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
} from "react-native";
import materialService from "../services/material";
import { Material } from "../types";

export default function Materiais() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [unidade, setUnidade] = useState("");

  // 🔹 Buscar materiais ao carregar a tela
  useEffect(() => {
    carregarMateriais();
  }, []);

  async function carregarMateriais() {
    try {
      const data = await materialService.listar();
      setMateriais(data);
    } catch (error) {
      console.error("Erro ao listar materiais:", error);
      Alert.alert("Erro", "Não foi possível carregar os materiais.");
    }
  }

  // 🔹 Abrir modal para criar novo material
  function abrirModalNovo() {
    setEditingMaterial(null);
    setNome("");
    setDescricao("");
    setUnidade("");
    setModalVisible(true);
  }

  // 🔹 Abrir modal para editar material existente
  function abrirModalEditar(material: Material) {
    setEditingMaterial(material);
    setNome(material.nome);
    setDescricao(material.descricao);
    setUnidade(material.unidade);
    setModalVisible(true);
  }

  // 🔹 Criar ou atualizar material
  async function salvarMaterial() {
    try {
      if (editingMaterial) {
        await materialService.atualizar(editingMaterial.id, {
          nome,
          descricao,
          unidade,
        });
        Alert.alert("Sucesso", "Material atualizado com sucesso!");
      } else {
        await materialService.criar({ nome, descricao, unidade });
        Alert.alert("Sucesso", "Material criado com sucesso!");
      }

      setModalVisible(false);
      carregarMateriais();
    } catch (error) {
      console.error("Erro ao salvar material:", error);
      Alert.alert("Erro", "Não foi possível salvar o material.");
    }
  }

  // 🔹 Excluir material
  async function excluirMaterial(id: number) {
    Alert.alert("Confirmação", "Deseja realmente excluir este material?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await materialService.excluir(id);
            Alert.alert("Sucesso", "Material excluído com sucesso!");
            carregarMateriais();
          } catch (error) {
            console.error("Erro ao excluir material:", error);
            Alert.alert("Erro", "Não foi possível excluir o material.");
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Materiais</Text>

      <TouchableOpacity style={styles.botaoNovo} onPress={abrirModalNovo}>
        <Text style={styles.botaoTexto}>+ Novo Material</Text>
      </TouchableOpacity>

      <ScrollView style={styles.lista}>
        {materiais.map((mat) => (
          <View key={mat.id} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.nome}>{mat.nome}</Text>
              <Text style={styles.descricao}>{mat.descricao}</Text>
              <Text style={styles.unidade}>Unidade: {mat.unidade}</Text>
            </View>

            <TouchableOpacity
              style={[styles.botao, styles.botaoEditar]}
              onPress={() => abrirModalEditar(mat)}
            >
              <Text style={styles.botaoTexto}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botao, styles.botaoExcluir]}
              onPress={() => excluirMaterial(mat.id)}
            >
              <Text style={styles.botaoTexto}>Excluir</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* 🔹 Modal de criação/edição */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>
              {editingMaterial ? "Editar Material" : "Novo Material"}
            </Text>

            <TextInput
              placeholder="Nome"
              style={styles.input}
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              placeholder="Descrição"
              style={styles.input}
              value={descricao}
              onChangeText={setDescricao}
            />
            <TextInput
              placeholder="Unidade"
              style={styles.input}
              value={unidade}
              onChangeText={setUnidade}
            />

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.botao, styles.botaoSalvar]}
                onPress={salvarMaterial}
              >
                <Text style={styles.botaoTexto}>Salvar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.botao, styles.botaoCancelar]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.botaoTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  titulo: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  lista: { marginTop: 10 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  nome: { fontSize: 18, fontWeight: "bold" },
  descricao: { color: "#555" },
  unidade: { color: "#888", fontSize: 13 },
  botao: {
    padding: 8,
    borderRadius: 6,
    marginLeft: 6,
  },
  botaoEditar: { backgroundColor: "#4CAF50" },
  botaoExcluir: { backgroundColor: "#F44336" },
  botaoNovo: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitulo: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  modalBotoes: { flexDirection: "row", justifyContent: "space-between" },
  botaoSalvar: { backgroundColor: "#4CAF50", flex: 1, marginRight: 5 },
  botaoCancelar: { backgroundColor: "#F44336", flex: 1, marginLeft: 5 },
});
