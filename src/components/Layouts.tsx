import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { usuario, logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    logout();
    navigation.navigate('Login' as never); // "Login" deve existir no seu Stack.Navigator
  };

  return (
    <View style={styles.container}>
      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.navigate('Home' as never)}>
          <Text style={styles.logo}>ECOSTOCK</Text>
        </TouchableOpacity>

        {usuario && (
          <View style={styles.links}>
            <TouchableOpacity onPress={() => navigation.navigate('Materiais' as never)}>
              <Text style={styles.link}>Materiais</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Estoque' as never)}>
              <Text style={styles.link}>Estoque</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.right}>
          {usuario ? (
            <View style={styles.userArea}>
              <Text style={styles.userName}>{usuario.nome}</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.btnSecondary}>
                <Text style={styles.btnText}>Sair</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)} style={styles.btnPrimary}>
              <Text style={styles.btnText}>Entrar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Conteúdo */}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

export default Layout;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4, // sombra Android
    shadowColor: '#000', // sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  links: {
    flexDirection: 'row',
    marginLeft: 16,
  },
  link: {
    marginHorizontal: 8,
    color: '#111827',
    fontSize: 16,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userArea: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    marginRight: 12,
    fontSize: 16,
    color: '#374151',
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnSecondary: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});
