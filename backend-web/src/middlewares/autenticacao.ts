import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface PayloadToken {
  usuarioId: number;
}

declare global {
  namespace Express {
    interface Request {
      usuarioId?: number;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const headerAuth = req.headers.authorization;

  if (!headerAuth) {
    res.status(401).json({ erro: 'Token não fornecido' });
    return;
  }

  const partes = headerAuth.split(' ');

  if (partes.length !== 2) {
    res.status(401).json({ erro: 'Erro no token' });
    return;
  }

  const [esquema, token] = partes;

  if (!/^Bearer$/i.test(esquema)) {
    res.status(401).json({ erro: 'Token mal formatado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as PayloadToken;
    req.usuarioId = decoded.usuarioId;
    next();
  } catch (err) {
    res.status(401).json({ erro: 'Token inválido' });
    return;
  }
};