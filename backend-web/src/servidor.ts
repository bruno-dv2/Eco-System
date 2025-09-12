import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rotasAutenticacao from './rotas/autenticacao';
import rotasMaterial from './rotas/material';
import rotasEstoque from './rotas/estoque';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rota de teste
app.get('/', (req, res) => {
  res.json({ mensagem: 'API funcionando!' });
});

// Configuração das rotas
app.use('/api/auth', rotasAutenticacao);
app.use('/api/materiais', rotasMaterial);
app.use('/api/estoque', rotasEstoque);

const PORTA = process.env.PORT || 3001;

app.listen(PORTA, () => {
  console.log(`Servidor rodando na porta ${PORTA}`);
});