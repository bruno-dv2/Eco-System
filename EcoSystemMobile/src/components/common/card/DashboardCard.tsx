import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { COLORS, SIZES } from "../../../constants/theme";

interface DashboardCardProps {
  title: string;
  value?: string | number;
  iconName?: keyof typeof Feather.glyphMap;
  iconBg?: string;
  iconColor?: string;
  linkText?: string;
  onPressLink?: () => void;
  variant?: "dashboard" | "estoque" | "materiais";
  children?: ReactNode;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  iconName,
  iconBg = COLORS.surface,
  iconColor = COLORS.primary,
  linkText,
  onPressLink,
  variant = "dashboard",
  children,
}) => (
  <View style={[styles.card, variantStyles[variant]]}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {iconName && (
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Feather name={iconName} size={20} color={iconColor} />
        </View>
      )}
    </View>

    {value !== undefined && (
      <Text style={styles.valueText}>
        {typeof value === "number" ? value.toString() : value}
      </Text>
    )}

    {children && <View style={styles.content}>{children}</View>}

    {onPressLink && linkText && (
      <TouchableOpacity onPress={onPressLink}>
        <Text style={styles.link}>{linkText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background,
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    marginBottom: SIZES.padding,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: SIZES.fontMedium,
    fontWeight: "600",
    color: COLORS.text,
  },
  iconContainer: {
    padding: 6,
    borderRadius: 999,
  },
  valueText: {
    fontSize: SIZES.fontXL,
    fontWeight: "bold",
    color: COLORS.text,
    marginTop: 4,
  },
  content: {
    marginTop: 8,
  },
  link: {
    color: COLORS.primary,
    fontWeight: "500",
    marginTop: 6,
  },
});

const variantStyles = StyleSheet.create({
  dashboard: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  estoque: {
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
  materiais: {
    backgroundColor: "#fff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },
});

export default DashboardCard;
