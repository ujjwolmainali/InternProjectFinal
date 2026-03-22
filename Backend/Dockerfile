FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# ✅ Generate Prisma client at build time (with fallback env)
ENV DATABASE_URL="postgresql://postgres:Raju%4012@localhost:5432/MajetroDash"

RUN npx prisma generate

EXPOSE 9000

CMD ["sh", "-c", "npx prisma migrate deploy && npx tsx Server.ts"]
