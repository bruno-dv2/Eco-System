import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from './screens/Welcome';
import LoginScreen from './screens/Login';
import RegistroScreen from './screens/Registro';
import DashboardScreen from './screens/Dashboard';
import MateriaisScreen from './screens/Materiais';
import EstoqueScreen from './screens/Estoque';
import EntradaMaterialScreen from './screens/EntradaMaterial';
import SaidaMaterialScreen from './screens/SaidaMaterial';


export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Registro: undefined;
  Dashboard: undefined;
  Materiais: undefined;
  Estoque: undefined;
  EntradaMaterial: undefined;
  SaidaMaterial: undefined;
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
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
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
