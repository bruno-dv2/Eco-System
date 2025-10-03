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
}