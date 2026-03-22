import express from 'express';
import cors from 'cors';
import productRoutes from './routes/ProductRoutes';
import orderRoutes from './routes/OrderRoutes';
import customerRoutes from './routes/CustomerRoutes';
import reportRoutes from './routes/ReportRoutes';
import discountRoutes from './routes/DiscountRoutes';
import settingsRoutes from './routes/SettingsRoutes';
import path from 'path';
import Authrouter from './routes/AuthRoutes';
import cookieParser from 'cookie-parser';

const app = express();
const port = 9000;

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/products', productRoutes);
app.use('/auth', Authrouter);
app.use('/orders', orderRoutes);
app.use('/customers', customerRoutes);
app.use('/reports', reportRoutes);
app.use('/discounts', discountRoutes);
app.use('/settings', settingsRoutes);

// Health check
app.get('/', (_req, res) => {
  res.send('<h1>MajetroDash POS API is running!</h1>');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
