import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function limparTokensExpirados() {
  const agora = new Date();
  
  const resultado = await prisma.tokenRevogado.deleteMany({
    where: {
      expiraEm: {
        lt: agora
      }
    }
  });
  
  console.log(`${resultado.count} tokens expirados removidos`);
}

// Executa a cada 24 horas
setInterval(limparTokensExpirados, 24 * 60 * 60 * 1000);