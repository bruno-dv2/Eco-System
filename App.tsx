import React from 'react';
import { AuthProvider } from './src/contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Dashboard">
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Registro" component={RegistroScreen} />
          <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
          <Stack.Screen
  name="Dashboard"
  component={DashboardScreen}
  options={{
    headerShown: false, // remove o header padrão do Stack
  }}
/>
          <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} />
          <Stack.Screen name="Materiais" component={MateriaisScreen} />
          <Stack.Screen name="Estoque" component={EstoqueScreen} />
          <Stack.Screen name="EntradaMaterial" component={EntradaMaterialScreen} />
          <Stack.Screen name="SaidaMaterial" component={SaidaMaterialScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
