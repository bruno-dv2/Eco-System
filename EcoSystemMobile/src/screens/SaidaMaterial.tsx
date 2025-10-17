import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import { Material, MovimentacaoSaida, SaldoMaterial } from "../types";
import { materialService } from "../services/material";
import { estoqueService } from "../services/estoque";

const SaidaMaterial: React.FC = () => {
  const navigation = useNavigation<any>();
  const [materiais, setMateriais] = useState<Material[]>([]);
  const [saldos, setSaldos] = useState<SaldoMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  // Campos do formulário
  const [open, setOpen] = useState(false);
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [items, setItems] = useState<{ label: string; value: number }[]>([]);
  const [quantidade, setQuantidade] = useState("");
  const [errors, setErrors] = useState({
    materialId: false,
    quantidade: false,
  });

  // 🔹 Carregar materiais e saldos
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [materiaisData, saldosData] = await Promise.all([
        materialService.listar(),
        estoqueService.consultarSaldo(),
      ]);

      const materiaisComSaldo = materiaisData.filter((m) =>
        saldosData.some((s) => s.material === m.nome && s.quantidade > 0)
      );

      setMateriais(materiaisComSaldo);
      setSaldos(saldosData);

      // 🔹 Cria os itens do Picker com o saldo entre parênteses
      const itensComQtd = materiaisComSaldo.map((m) => {
        const saldo = saldosData.find((s) => s.material === m.nome)?.quantidade || 0;
        return {
          label: `${m.nome} (qtd: ${saldo})`,
          value: m.id,
        };
      });

      setItems(itensComQtd);
      setErro("");
    } catch {
      setErro("Falha ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const getSaldoMaterial = (id: number) => {
    const material = materiais.find((m) => m.id === id);
    if (!material) return null;
    return saldos.find((s) => s.material === material.nome);
  };

  // 🔹 Enviar saída
  const handleSubmit = async () => {
    const qtd = Number(quantidade);

    const novosErros = {
      materialId: !materialId,
      quantidade: !qtd || qtd <= 0 || !Number.isInteger(qtd),
    };
    setErrors(novosErros);

    if (Object.values(novosErros).includes(true)) {
      Alert.alert("Atenção", "Preencha todos os campos corretamente.");
      return;
    }

    const saldoAtual = getSaldoMaterial(materialId!);
    if (!saldoAtual || saldoAtual.quantidade < qtd) {
      setErro("Quantidade insuficiente em estoque.");
      return;
    }

    try {
      setSaving(true);
      const movimentacoes: MovimentacaoSaida[] = [
        { materialId: materialId!, quantidade: qtd },
      ];

      await estoqueService.registrarSaida(movimentacoes);
      setSucesso(true);
      setErro("");
      setQuantidade("");
      setMaterialId(null);
      setTimeout(() => setSucesso(false), 2500);
      carregarDados();
    } catch {
      setErro("Falha ao registrar saída");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigation.navigate("Dashboard");
  };

  // 🔹 Loading inicial
  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Carregando materiais...</Text>
      </View>
    );
  }

  // 🔹 Nenhum material disponível
  if (materiais.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Registrar Saída de Material</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Não há materiais com saldo disponível para saída.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registrar Saída de Material</Text>

        {erro ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        ) : null}

        {sucesso ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>Saída registrada com sucesso!</Text>
          </View>
        ) : null}

        {/* Picker de materiais */}
        <Text style={styles.label}>Material</Text>
        <DropDownPicker
          open={open}
          value={materialId}
          items={items}
          setOpen={setOpen}
          setValue={setMaterialId}
          setItems={setItems}
          searchable
          placeholder="Selecione um material..."
          searchPlaceholder="Pesquisar material..."
          disabled={saving}
          style={[
            styles.dropdown,
            errors.materialId && { borderColor: "red", backgroundColor: "#ffeaea" },
          ]}
          dropDownContainerStyle={styles.dropdownContainer}
          listMode="MODAL"
          modalTitle="Selecionar Material"
          modalProps={{ animationType: "slide" }}
          modalContentContainerStyle={{ backgroundColor: "#fff" }}
        />
        {errors.materialId && (
          <Text style={styles.errorText}>Selecione o material</Text>
        )}

        {/* Quantidade */}
        <Text style={styles.label}>Quantidade</Text>
        <TextInput
          placeholder="Ex: 10"
          keyboardType="numeric"
          style={[
            styles.input,
            errors.quantidade && { borderColor: "red", backgroundColor: "#ffeaea" },
          ]}
          value={quantidade}
          onChangeText={(text) => {
            if (/^\d*$/.test(text)) setQuantidade(text);
            if (text.trim()) setErrors((e) => ({ ...e, quantidade: false }));
          }}
          editable={!saving}
        />
        {errors.quantidade && (
          <Text style={styles.errorText}>Digite um número inteiro válido</Text>
        )}

        {/* Botões */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Salvar</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton, saving && styles.buttonDisabled]}
            onPress={handleCancel}
            disabled={saving}
          >
            <Text style={styles.buttonText1}>Cancelar</Text>
          </TouchableOpacity>
        </View>

        {/* Loader de envio */}
        {saving && (
          <View style={styles.savingOverlay} pointerEvents="auto">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Salvando...</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default SaidaMaterial;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#EFF6FF",
    flexGrow: 1,
  },
  loadingBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  loadingText: { marginTop: 8, color: "#374151", fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  label: { fontWeight: "600", marginBottom: 4, color: "#111" },
  dropdown: {
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    minHeight: 44,
    zIndex: 1, // 🔹 mantém o picker abaixo do overlay
  },
  dropdownContainer: {
    borderColor: "#ccc",
    borderRadius: 10,
    zIndex: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  saveButton: { backgroundColor: "#3B82F6" },
  cancelButton: {borderColor: "#3B82F6", borderWidth: 1 },
  buttonText: { color: "#fff", fontWeight: "bold" },
  buttonText1: { color: "#3B82F6", fontWeight: "bold" },
  buttonDisabled: { opacity: 0.6 },
  errorBox: {
    backgroundColor: "#FEE2E2",
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: "#B91C1C" },
  successBox: {
    backgroundColor: "#D1FAE5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 12,
    marginBottom: 12,
  },
  successText: { color: "#047857" },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999, // 🔹 garante que o overlay fique acima de tudo
    elevation: 9999,
  },
  warningBox: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: { color: "#B45309", fontSize: 14 },
});
