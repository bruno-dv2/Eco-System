# Etapa 1: Build (compila o TypeScript)
FROM node:20-alpine AS builder

WORKDIR /app

# Copia apenas arquivos essenciais primeiro (cache eficiente)
COPY package*.json ./
RUN npm install

# Copia o restante do código
COPY . .

# Copia o arquivo .env para dentro do container
COPY .env .env

RUN npx prisma generate

RUN npx prisma db pull

# Gera a pasta dist/
RUN npm run build


# Etapa 2: Runtime (roda apenas o necessário)
FROM node:20-alpine

WORKDIR /app

# Copia apenas o necessário da etapa anterior
COPY --from=builder /app/package*.json ./
RUN npm install --production

# Copia o código já compilado
COPY --from=builder /app/dist ./dist

# Copia o Prisma se existir (importante!)
COPY --from=builder /app/prisma ./prisma

# Se você usa Prisma, gera o client (opcional, mas comum)
RUN npx prisma generate || true

# Expõe a porta 3001
EXPOSE 3001

# Inicia o servidor
CMD ["node", "dist/servidor.js"]
