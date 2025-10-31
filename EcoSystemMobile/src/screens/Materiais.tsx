import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { materialService } from "../services/material";
import { estoqueService } from "../services/estoque";
import { Material, SaldoMaterial } from "../types";

/** 🔹 Modal de criação/edição de material */
type MaterialModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (nome: string, descricao: string, unidade: string) => Promise<void>;
  nomeInicial?: string;
  descricaoInicial?: string;
  unidadeInicial?: string;
};

const MaterialModal: React.FC<MaterialModalProps> = ({
  visible,
  onClose,
  onSubmit,
  nomeInicial = "",
  descricaoInicial = "",
  unidadeInicial = "",
}) => {
  const [nome, setNome] = useState(nomeInicial);
  const [descricao, setDescricao] = useState(descricaoInicial);
  const [unidade, setUnidade] = useState(unidadeInicial);
  const [errors, setErrors] = useState({ nome: false, descricao: false, unidade: false });
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (visible) {
      setNome(nomeInicial);
      setDescricao(descricaoInicial);
      setUnidade(unidadeInicial);
      setErrors({ nome: false, descricao: false, unidade: false });
    }
  }, [visible, nomeInicial, descricaoInicial, unidadeInicial]);

  const handleSubmit = async () => {
    const newErrors = {
      nome: !nome.trim(),
      descricao: !descricao.trim(),
      unidade: !unidade.trim(),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).includes(true)) {
      Alert.alert("Atenção", "Preencha todos os campos antes de continuar.");
      return;
    }

    try {
      setSalvando(true);
      await onSubmit(nome, descricao, unidade);
      setNome("");
      setDescricao("");
      setUnidade("");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {nomeInicial ? "Editar Material" : "Novo Material"}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, { marginTop: 16 }]}>
            {/* Nome */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={[styles.inputCard, errors.nome && styles.inputError]}
                placeholder="Nome do material"
                value={nome}
                onChangeText={(t) => {
                  setNome(t);
                  if (t.trim()) setErrors((e) => ({ ...e, nome: false }));
                }}
              />
              {errors.nome && <Text style={styles.errorText}>Campo obrigatório</Text>}
            </View>

            {/* Descrição */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descrição</Text>
              <TextInput
                style={[styles.inputCard, errors.descricao && styles.inputError]}
                placeholder="Descrição"
                value={descricao}
                onChangeText={(t) => {
                  setDescricao(t);
                  if (t.trim()) setErrors((e) => ({ ...e, descricao: false }));
                }}
              />
              {errors.descricao && <Text style={styles.errorText}>Campo obrigatório</Text>}
            </View>

            {/* Unidade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Unidade</Text>
              <TextInput
                style={[styles.inputCard, errors.unidade && styles.inputError]}
                placeholder="Kg, Un, L..."
                value={unidade}
                onChangeText={(t) => {
                  setUnidade(t);
                  if (t.trim()) setErrors((e) => ({ ...e, unidade: false }));
                }}
              />
              {errors.unidade && <Text style={styles.errorText}>Campo obrigatório</Text>}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, salvando && { opacity: 0.6 }]}
              onPress={handleSubmit}
              disabled={salvando}
            >
              <Text style={styles.submitButtonText}>
                {salvando
                  ? "Salvando..."
                  : nomeInicial
                  ? "Salvar Alterações"
                  : "Adicionar Material"}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

/** 🔹 Tela principal de Materiais */
export default function Materiais() {
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editarMaterial, setEditarMaterial] = useState<Material | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [materiaisData, saldosData] = await Promise.all([
        materialService.listar(),
        estoqueService.consultarSaldo(),
      ]);
      setMateriais(Array.isArray(materiaisData) ? materiaisData : []);
      setSaldos(Array.isArray(saldosData) ? saldosData : []);
      setErro("");
    } catch (err: any) {
      console.error("Erro ao carregar materiais:", err);
      setErro(err.message || "Falha ao carregar materiais");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const resetForm = () => setEditarMaterial(null);

  const adicionarOuEditarMaterial = async (
    nome: string,
    descricao: string,
    unidade: string
  ) => {
    setErro("");
    setSucesso("");
    try {
      if (editarMaterial) {
        await materialService.atualizar(editarMaterial.id, { nome, descricao, unidade });
        setSucesso("Material atualizado com sucesso!");
      } else {
        await materialService.criar({ nome, descricao, unidade });
        setSucesso("Material cadastrado com sucesso!");
      }
      await carregarDados();
      setModalVisible(false);
      resetForm();
      setTimeout(() => setSucesso(""), 3000);
    } catch (error: any) {
      console.error("Erro ao salvar material:", error);
      setErro(
        error.response?.data?.mensagem ||
          (editarMaterial
            ? "Falha ao atualizar material"
            : "Falha ao criar material")
      );
    }
  };

  const abrirModalEditar = (material: Material) => {
    setEditarMaterial(material);
    setModalVisible(true);
  };

  const excluirMaterial = async (material: Material) => {
    const saldo = saldos.find((s) => s.material === material.nome)?.quantidade || 0;
    if (saldo > 0)
      return setErro("❌ Não é possível excluir material com saldo em estoque.");

    Alert.alert("Confirmação", `Excluir "${material.nome}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await materialService.excluir(material.id);
            setSucesso("Material excluído com sucesso!");
            await carregarDados();
            setTimeout(() => setSucesso(""), 3000);
          } catch (error: any) {
            console.error("Erro ao excluir:", error);
            setErro(error.response?.data?.mensagem || "Falha ao excluir material");
          }
        },
      },
    ]);
  };

  const materiaisFiltrados = materiais.filter((m) =>
    (m.nome || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <ActivityIndicator size="large" color="#2563EB" style={{ flex: 1, marginTop: 40 }} />
    );

  const renderItem = ({ item }: { item: Material }) => {
    const saldo = saldos.find((s) => s.material === item.nome)?.quantidade || 0;
    return (
      <View style={styles.item}>
        <Text style={styles.nome}>{item.nome}</Text>
        <Text style={styles.descricao}>{item.descricao || "-"}</Text>
        <Text style={styles.unidade}>{item.unidade}</Text>
        <View style={styles.botoes}>
          <TouchableOpacity style={styles.botaoIcon} onPress={() => abrirModalEditar(item)}>
            <Feather name="edit" size={20} color="#2563EB" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.botaoIcon}
            onPress={() => excluirMaterial(item)}
            disabled={saldo > 0}
          >
            <Feather name="trash-2" size={20} color={saldo > 0 ? "#999" : "#ef4444"} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Materiais</Text>

      <View style={styles.header}>
        <Feather name="search" size={20} color="#000" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.input}
          placeholder="Pesquisar"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {erro ? <Text style={styles.msgErro}>{erro}</Text> : null}
      {sucesso ? <Text style={styles.msgSucesso}>{sucesso}</Text> : null}

      <FlatList
        data={materiaisFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListHeaderComponent={
          <View style={styles.cabecalho}>
            <Text style={styles.colNome}>Nome</Text>
            <Text style={styles.colDescricao}>Descrição</Text>
            <Text style={styles.colUnidade}>Unidade</Text>
            <Text style={styles.colAcao}>Ação</Text>
          </View>
        }
      />

      {/* ➕ Botão flutuante */}
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Feather name="plus" size={30} color="#fff" />
      </TouchableOpacity>

      {/* 🧩 Modal */}
      <MaterialModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
        nomeInicial={editarMaterial?.nome}
        descricaoInicial={editarMaterial?.descricao}
        unidadeInicial={editarMaterial?.unidade}
        onSubmit={adicionarOuEditarMaterial}
      />
    </View>
  );
}

/* 🎨 Estilos */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#292626",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  input: { flex: 1, height: 40 },
  msgErro: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  msgSucesso: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  cabecalho: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  colNome: { flex: 2, fontWeight: "bold" },
  colDescricao: { flex: 2, fontWeight: "bold" },
  colUnidade: { flex: 1, fontWeight: "bold" },
  colAcao: { flex: 1, fontWeight: "bold", textAlign: "center" },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  nome: { flex: 2 },
  descricao: { flex: 2 },
  unidade: { flex: 1 },
  botoes: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  botaoIcon: { padding: 6, borderRadius: 4 },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    backgroundColor: "#2563EB",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 10,
    padding: 16,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  card: { backgroundColor: "#f9fafb", padding: 16, borderRadius: 8 },
  inputGroup: { marginBottom: 12 },
  label: { marginBottom: 4, fontWeight: "600" },
  inputCard: { borderWidth: 1, borderColor: "#ccc", borderRadius: 4, padding: 8 },
  inputError: { borderColor: "red", backgroundColor: "#ffeaea" },
  errorText: { color: "red", fontSize: 12, marginTop: 2 },
  submitButton: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 6,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: { color: "#fff", fontWeight: "600" },
});
