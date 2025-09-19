import React from "react";

import {
    Text,
    View,
    TextInput,
    TouchableOpacity
} from 'react-native';

import { styles } from './styles';

export default function Login(){
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F9FF' }}>
            <View style={styles.container}>
                <View style={styles.boxTop}>
                    <Text style={styles.title}>Bem-vindo de volta!</Text>
                    <Text style={styles.titleSuportText}>Entre com suas credenciais para acessar a sua conta</Text>
                </View>
                <View style={styles.boxMiddle}>
                    <TextInput
                        style={styles.input}
                        placeholder="E-mail"
                    />
                    <View style={styles.boxPassword}>
                        <TextInput
                            style={styles.input} 
                            placeholder="Senha"
                        />
                        <Text>A senha deve ter no mínimo 8 caracteres</Text>    
                    </View>
                    <TouchableOpacity style={styles.buttonEntrar}>
                        <Text style={styles.textButtonEntrar}>Entrar</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.boxBottom}>
                    <Text>Não tem uma conta?</Text>
                    <TouchableOpacity style={styles.buttonCadastrar}>
                        <Text style={styles.textButtonCadastrar}>Cadastre-se</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}