import express from 'express';
import cors from 'cors';
import productRoutes from './routes/ProductRoutes';
import path from 'path';
import Authrouter from './routes/AuthRoutes';
import cookieParser from "cookie-parser";

const app = express();
const port = 9000;

app.use(
  cors({
    origin: true,          // allow all origins dynamically
    credentials: true,     // allow cookies / auth headers
  })
);


app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/products",productRoutes)
app.use("/auth",Authrouter)

// Test route
app.get('/', (req, res) => {
  res.send('<h1>Express + Prisma API server is running!</h1>');
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
