import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /reports/summary — key KPIs ─────────────────────────────────────────
router.get('/summary', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      todayOrders,
      monthOrders,
      lastMonthOrders,
      totalCustomers,
      totalProducts,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfToday }, status: 'completed' },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfMonth }, status: 'completed' },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth }, status: 'completed' },
      }),
      prisma.customer.count(),
      prisma.products.count(),
      prisma.products.count({ where: { Quantity: { lte: 10 } } }),
    ]);

    const monthRevenue = monthOrders._sum.total || 0;
    const lastMonthRevenue = lastMonthOrders._sum.total || 0;
    const revenueGrowth = lastMonthRevenue === 0 ? 100 : ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    const monthCount = monthOrders._count || 0;
    const lastMonthCount = lastMonthOrders._count || 0;
    const ordersGrowth = lastMonthCount === 0 ? 100 : ((monthCount - lastMonthCount) / lastMonthCount) * 100;

    res.json({
      today: {
        revenue: todayOrders._sum.total || 0,
        orders: todayOrders._count || 0,
      },
      thisMonth: {
        revenue: monthRevenue,
        orders: monthCount,
        revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        ordersGrowth: Math.round(ordersGrowth * 10) / 10,
      },
      totalCustomers,
      totalProducts,
      lowStockProducts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch summary' });
  }
});

// ─── GET /reports/sales — daily sales for a date range ───────────────────────
router.get('/sales', async (req: Request, res: Response) => {
  try {
    const { from, to, groupBy = 'day' } = req.query as Record<string, string>;

    const now = new Date();
    const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = to ? new Date(to) : now;

    const orders = await prisma.order.findMany({
      where: {
        status: 'completed',
        createdAt: { gte: fromDate, lte: toDate },
      },
      select: { createdAt: true, total: true, subtotal: true, taxAmount: true },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const grouped: Record<string, { date: string; revenue: number; orders: number; tax: number }> = {};

    orders.forEach((o) => {
      const d = o.createdAt;
      let key: string;
      if (groupBy === 'month') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'week') {
        // ISO week
        const startOfWeek = new Date(d);
        startOfWeek.setDate(d.getDate() - d.getDay());
        key = startOfWeek.toISOString().split('T')[0];
      } else {
        key = d.toISOString().split('T')[0];
      }

      if (!grouped[key]) grouped[key] = { date: key, revenue: 0, orders: 0, tax: 0 };
      grouped[key].revenue += o.total;
      grouped[key].orders += 1;
      grouped[key].tax += o.taxAmount;
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch sales report' });
  }
});

// ─── GET /reports/products — top selling products ────────────────────────────
router.get('/products', async (req: Request, res: Response) => {
  try {
    const { from, to, limit = '10' } = req.query as Record<string, string>;
    const now = new Date();
    const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = to ? new Date(to) : now;

    const items = await prisma.orderItem.findMany({
      where: {
        order: {
          status: 'completed',
          createdAt: { gte: fromDate, lte: toDate },
        },
      },
      include: { product: { include: { images: true } } },
    });

    // Aggregate by productName
    const productMap: Record<string, { productName: string; productId: number | null; quantitySold: number; revenue: number; image: string }> = {};

    items.forEach((item) => {
      const key = item.productName;
      if (!productMap[key]) {
        productMap[key] = {
          productName: item.productName,
          productId: item.productId,
          quantitySold: 0,
          revenue: 0,
          image: item.product?.images?.[0]?.imageUrl || '',
        };
      }
      productMap[key].quantitySold += item.quantity;
      productMap[key].revenue += item.subtotal;
    });

    const sorted = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, parseInt(limit));

    res.json(sorted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch product report' });
  }
});

// ─── GET /reports/payment-methods — revenue by payment type ──────────────────
router.get('/payment-methods', async (req: Request, res: Response) => {
  try {
    const { from, to } = req.query as Record<string, string>;
    const now = new Date();
    const fromDate = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const toDate = to ? new Date(to) : now;

    const orders = await prisma.order.findMany({
      where: { status: 'completed', createdAt: { gte: fromDate, lte: toDate } },
      select: { paymentMethod: true, total: true },
    });

    const grouped: Record<string, { method: string; count: number; revenue: number }> = {};
    orders.forEach((o) => {
      if (!grouped[o.paymentMethod]) grouped[o.paymentMethod] = { method: o.paymentMethod, count: 0, revenue: 0 };
      grouped[o.paymentMethod].count += 1;
      grouped[o.paymentMethod].revenue += o.total;
    });

    res.json(Object.values(grouped));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch payment methods report' });
  }
});

// ─── GET /reports/inventory — stock levels ───────────────────────────────────
router.get('/inventory', async (req: Request, res: Response) => {
  try {
    const products = await prisma.products.findMany({
      select: { Id: true, Name: true, Category: true, Quantity: true, Price: true, Status: true },
      orderBy: { Quantity: 'asc' },
    });

    const outOfStock = products.filter((p) => p.Quantity === 0);
    const lowStock = products.filter((p) => p.Quantity > 0 && p.Quantity <= 10);
    const inStock = products.filter((p) => p.Quantity > 10);

    res.json({ products, outOfStock: outOfStock.length, lowStock: lowStock.length, inStock: inStock.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch inventory report' });
  }
});

// ─── GET /reports/monthly — last 12 months revenue ───────────────────────────
router.get('/monthly', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const months = [];

    for (let i = 11; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const result = await prisma.order.aggregate({
        _sum: { total: true },
        _count: true,
        where: { status: 'completed', createdAt: { gte: start, lte: end } },
      });

      months.push({
        month: start.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: result._sum.total || 0,
        orders: result._count || 0,
      });
    }

    res.json(months);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch monthly report' });
  }
});

export default router;
