import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Material } from "../types";
import { materialService } from "../services/material";
import { estoqueService } from "../services/estoque";
import MovimentacaoFormRN from "../components/MovimentacaoFormRN";

interface Movimentacao {
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useNavigation } from "@react-navigation/native";
import materialService from "../services/material";
import { estoqueService } from "../services/estoque";
import { Material } from "../types";

export interface Movimentacao {
  materialId: number;
  quantidade: number;
  preco?: number;
}

export default function EntradaMaterial() {
  const navigation = useNavigation<any>();

  //Estados principais
  const [materiais, setMateriais] = useState<Material[]>([]);

  const [loading, setLoading] = useState(true); // carregamento inicial
  const [saving, setSaving] = useState(false); // carregamento ao salvar
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  //Campos e dropdown
  const [open, setOpen] = useState(false);
  const [materialId, setMaterialId] = useState<number | null>(null);
  const [items, setItems] = useState<{ label: string; value: number }[]>([]);
  const [dropdownWidth, setDropdownWidth] = useState<number | null>(null);
  const [quantidade, setQuantidade] = useState("");
  const [preco, setPreco] = useState("");
  const [errors, setErrors] = useState({
    materialId: false,
    quantidade: false,
    preco: false,
  });

  //Carregar materiais do backend
  useEffect(() => {
    carregarMateriais();
  }, []);

  const carregarMateriais = async () => {
    try {
      const data = await materialService.listar();
      setMateriais(data);
      setItems(
        data.map((m) => ({
          label: m.nome,
          value: m.id,
        }))
      );
    } catch {
      setErro("Falha ao carregar materiais");
    } finally {
      setLoading(false);
    }
  };

  //Máscara de preço (R$)
  const formatarPreco = (valor: string) => {
    let num = valor.replace(/\D/g, "");
    if (!num) return "";
    num = (Number(num) / 100).toFixed(2);
    return "R$ " + num.replace(".", ",");
  };

  const handlePrecoChange = (text: string) => {
    setPreco(formatarPreco(text));
    if (text) setErrors((e) => ({ ...e, preco: false }));
  };

  //Método de salvar
  const handleSubmit = async () => {
    const qtd = Number(quantidade);
    const precoNumber = Number(preco.replace(/[^\d,]/g, "").replace(",", "."));

    const novosErros = {
      materialId: !materialId,
      quantidade: !qtd || qtd <= 0 || !Number.isInteger(qtd),
      preco: !preco,
    };
    setErrors(novosErros);

    if (Object.values(novosErros).includes(true)) {
      Alert.alert("Atenção", "Preencha os campos corretamente.");
      return;
    }

    try {
      setSaving(true);
      const movimentacoes: Movimentacao[] = [
        { materialId: materialId!, quantidade: qtd, preco: precoNumber },
      ];

      await estoqueService.registrarEntrada(
        movimentacoes.map((m) => ({
          materialId: m.materialId,
          quantidade: m.quantidade,
          preco: m.preco || 0,
        }))
      );

      setSucesso(true);
      setErro("");

     setTimeout(() => {
  setSaving(false);
  navigation.navigate("Estoque");
}, 1500);
} catch {
  setErro("Falha ao registrar entradas");
}


  //Loader inicial
  if (loading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Carregando materiais...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Registrar Entrada de Material</Text>

        {/* Feedback */}
        {erro ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{erro}</Text>
          </View>
        ) : null}

        {sucesso ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>
              Entradas registradas com sucesso!
            </Text>
          </View>
        ) : null}

<View style={styles.body}>
  {/* Mensagens de erro */}
  {erro ? (
    <View style={styles.errorBox}>
      <Text style={styles.errorText}>{erro}</Text>
    </View>
  ) : null}

  {/* Mensagem de sucesso */}
  {sucesso ? (
    <View style={styles.successBox}>
      <Text style={styles.successText}>
        Entradas registradas com sucesso!
      </Text>
    </View>
  ) : null}

  {/* Seletor de material */}
  <Text style={styles.label}>Material</Text>
  <View
    style={[styles.dropdownWrapper, dropdownWidth ? { width: dropdownWidth } : { width: "100%" }]}
    onLayout={(e) => setDropdownWidth(e.nativeEvent.layout.width)}
  >
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
      listMode="SCROLLVIEW"
      dropDownDirection="BOTTOM"
      containerStyle={{ width: "100%", position: "relative" }}
      dropDownContainerStyle={[
        styles.dropdownContainer,
        dropdownWidth
          ? { position: "absolute", top: 50, left: 0, width: dropdownWidth, zIndex: 3000, elevation: 3000 }
          : { position: "absolute", top: 50, left: 0, width: "100%", zIndex: 3000, elevation: 3000 },
      ]}
    />
  </View>

  {/* Formulário */}
  <MovimentacaoFormRN
    materiais={materiais}
    tipo="entrada"
    onSubmit={handleSubmit}
    onCancel={() => navigation.navigate("Estoque")}
  />
</View>

          />
        </View>

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
          <Text style={styles.errorText}>Digite um número inteiro positivo</Text>
        )}

        {/* Preço unitário */}
        <Text style={styles.label}>Preço unitário</Text>
        <TextInput
          placeholder="R$ 0,00"
          keyboardType="numeric"
          style={[
            styles.input,
            errors.preco && { borderColor: "red", backgroundColor: "#ffeaea" },
          ]}
          value={preco}
          onChangeText={handlePrecoChange}
          editable={!saving}
        />
        {errors.preco && (
          <Text style={styles.errorText}>Informe o preço do material</Text>
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
            onPress={() => navigation.navigate("Dashboard")}
            disabled={saving}
          >
            <Text style={styles.buttonText1}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Overlay de salvamento */}
      {saving && (
        <View style={styles.savingOverlay} pointerEvents="auto">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Salvando...</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  loadingBox: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 16,
    color: "#374151",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    padding: 16,
  },
  header: {
    backgroundColor: "#ffffffff",
    padding: 16,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000000ff",
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    marginBottom: 4,
    color: "#111",
  },
  dropdown: {
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    minHeight: 44,
    zIndex: 2000,
  },
  dropdownContainer: {
    borderColor: "#ccc",
    borderRadius: 10,
  },
  dropdownWrapper: {
    position: "relative",
    zIndex: 2000,
    elevation: 2000,
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
  cancelButton: { borderColor: "#3B82F6", borderWidth: 1 },
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
  errorText: {
    color: "#B91C1C",
  },
  successBox: {
    backgroundColor: "#D1FAE5",
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
    padding: 12,
    marginBottom: 12,
  },
  successText: {
    color: "#047857",
  },
  savingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
});
