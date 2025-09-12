import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
}