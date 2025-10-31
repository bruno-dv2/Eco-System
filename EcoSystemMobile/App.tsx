import React, { useEffect, useCallback, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { View, ActivityIndicator, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';

import WelcomeScreen from './src/screens/Welcome';
import LoginScreen from './src/screens/Login';
import RegistroScreen from './src/screens/Registro';
import DashboardScreen from './src/screens/Dashboard';
import MateriaisScreen from './src/screens/Materiais';
import EstoqueScreen from './src/screens/Estoque';
import EntradaMaterialScreen from './src/screens/EntradaMaterial';
import SaidaMaterialScreen from './src/screens/SaidaMaterial';
import RecuperarSenhaScreen from './src/screens/RecuperarSenha';
import AlterarSenhaScreen from './src/screens/AlterarSenha';

//impede a splash de sumir automaticamente
SplashScreen.preventAutoHideAsync();

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Registro: undefined;
  RecuperarSenha: undefined;
  Dashboard: undefined;
  Materiais: undefined;
  Estoque: undefined;
  EntradaMaterial: undefined;
  SaidaMaterial: undefined;
  AlterarSenha: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Componente interno que tem acesso ao contexto de autenticação
const AppNavigator: React.FC = () => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('./src/assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={styles.indicator}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={usuario ? "Dashboard" : "Welcome"}
        screenOptions={{
          headerShown: true,
        }}
      >
        {usuario ? (
          // Rotas autenticadas
          <>
            <Stack.Screen 
              name="Dashboard" 
              component={DashboardScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AlterarSenha" 
              component={AlterarSenhaScreen} 
              options={{
                title: 'Alterar Senha',         
                headerTitleAlign: 'center',
                headerStyle: { 
                  backgroundColor: '#EFF6FF',
                },
                headerTintColor: '#2563EB',
              }}
            />
            <Stack.Screen name="Materiais" component={MateriaisScreen} />
            <Stack.Screen name="Estoque" component={EstoqueScreen} />
            <Stack.Screen name="EntradaMaterial" component={EntradaMaterialScreen} />
            <Stack.Screen name="SaidaMaterial" component={SaidaMaterialScreen} />
          </>
        ) : (
          // Rotas não autenticadas
          <>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Registro" 
              component={RegistroScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="RecuperarSenha" 
              component={RecuperarSenhaScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  const [isAppReady, setAppReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Aguarda a splash screen
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppReady(true);
      }
    }

    prepare();
  }, []);

  //Quando o app estiver pronto, esconde a splash
  const onLayoutRootView = useCallback(async () => {
    if (isAppReady) {
      await SplashScreen.hideAsync();
    }
  }, [isAppReady]);

  if (!isAppReady) {
    // Tela de loading enquanto a splash ainda está ativa
    return (
      <View style={styles.splashContainer}>
        <Image
          source={require('./src/assets/splash-icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator
          size="large"
          color="#007AFF"
          style={styles.indicator}
        />
      </View>
    );
  }

  return (
    <AuthProvider>
      <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
        <AppNavigator />
        <Toast />
      </View>
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 220,
    height: 220,
  },
  indicator: {
    position: 'absolute',
    bottom: 60,
  },
});