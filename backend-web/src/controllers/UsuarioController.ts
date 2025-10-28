import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from "../services/EmailServices";
import bcrypt from 'bcryptjs';
import crypto from "crypto";
import jwt from 'jsonwebtoken';
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export class UsuarioController {
  async registro(req: Request, res: Response): Promise<void> {
    try {
      const { nome, email, senha } = req.body;

      const usuarioExiste = await prisma.usuario.findUnique({
        where: { email }
      });

      if (usuarioExiste) {
        res.status(400).json({ erro: 'Usuário já existe' });
        return;
      }

      const senhaHash = await bcrypt.hash(senha, 8);

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          senha: senhaHash
        }
      });

      const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET!, {
        expiresIn: '1d'
      });

      res.json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        token
      });
    } catch {
      res.status(400).json({ erro: 'Falha no registro' });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, senha } = req.body;

      const usuario = await prisma.usuario.findUnique({
        where: { email }
      });

      if (!usuario) {
        res.status(400).json({ erro: 'Usuário não encontrado' });
        return;
      }

      const senhaValida = await bcrypt.compare(senha, usuario.senha);

      if (!senhaValida) {
        res.status(400).json({ erro: 'Senha inválida' });
        return;
      }

      const token = jwt.sign({ usuarioId: usuario.id }, process.env.JWT_SECRET!, {
        expiresIn: '1d'
      });

      res.json({
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        },
        token
      });
    } catch {
      res.status(400).json({ erro: 'Falha no login' });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const headerAuth = req.headers.authorization;

      if (!headerAuth) {
        res.status(401).json({ erro: 'Token não fornecido' });
        return;
      }

      const [, token] = headerAuth.split(' ');

      if (!token) {
        res.status(401).json({ erro: 'Token mal formatado' });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { exp: number };
      
      await prisma.tokenRevogado.create({
        data: {
          token: token,
          expiraEm: new Date(decoded.exp * 1000)
        }
      });

      res.json({ mensagem: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error(error);
      res.status(400).json({ erro: 'Falha no logout' });
    }
  }

  async alterarSenha(req: Request & { usuarioId?: number }, res: Response): Promise<void> {
    try {
      const usuarioId = req.usuarioId;
      const { senhaAtual, novaSenha } = req.body;

      if (!usuarioId) {
        res.status(401).json({ erro: 'Usuário não autenticado' });
        return;
      }

      // Validações
      if (!senhaAtual || !novaSenha) {
        res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias' });
        return;
      }

      if (novaSenha.length < 8) {
        res.status(400).json({ erro: 'A nova senha deve ter no mínimo 8 caracteres' });
        return;
      }

      // Buscar usuário
      const usuario = await prisma.usuario.findUnique({
        where: { id: usuarioId }
      });

      if (!usuario) {
        res.status(404).json({ erro: 'Usuário não encontrado' });
        return;
      }

      // Verificar senha atual
      const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);
      
      if (!senhaValida) {
        res.status(401).json({ erro: 'Senha atual incorreta' });
        return;
      }

      // Verificar se a nova senha é diferente da atual
      const senhaIgual = await bcrypt.compare(novaSenha, usuario.senha);
      
      if (senhaIgual) {
        res.status(400).json({ erro: 'A nova senha deve ser diferente da senha atual' });
        return;
      }

      // Atualizar senha
      const novaSenhaHash = await bcrypt.hash(novaSenha, 8);
      
      await prisma.usuario.update({
        where: { id: usuarioId },
        data: {
          senha: novaSenhaHash,
          dataAtualizacao: new Date()
        }
      });

      res.json({ mensagem: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({ erro: 'Erro ao alterar senha' });
    }
  }

  // Recuperação de senha enviando nova senha gerada
  async recuperacao(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    try {
      const usuario = await prisma.usuario.findUnique({ where: { email } });

      if (!usuario) {
        // resposta genérica para não expor se existe ou não
        res.json({ message: "Se o e-mail existir, você receberá uma nova senha." });
        return;
      }

      // 🔑 Gera senha aleatória
      const novaSenha = generateRandomPassword(8);

      // Hash da senha
      const hash = await bcrypt.hash(novaSenha, 10);

      // Atualiza usuário
      await prisma.usuario.update({
        where: { id: usuario.id },
        data: {
          senha: hash,
          dataAtualizacao: new Date()
        }
      });

      // Envia e-mail com nova senha
      await sendEmail({
        to: usuario.email,
        subject: "Sua nova senha",
        html: `
          <p>Olá <b>${usuario.nome}</b>,</p>
          <p>Você solicitou a recuperação da sua senha.</p>
          <p>Sua nova senha é: <b>${novaSenha}</b></p>
          <p>Recomendamos alterá-la após o primeiro login.</p>
        `
      });

      res.json({ message: "Se o e-mail existir, você receberá uma nova senha." });

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }

}


  // Função utilitária
  function generateRandomPassword(length = 8): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  }