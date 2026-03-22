import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── Helper: Generate Order Number ───────────────────────────────────────────
const generateOrderNumber = async (): Promise<string> => {
  const count = await prisma.order.count();
  const num = String(count + 1).padStart(5, '0');
  return `ORD-${num}`;
};

// ─── GET /orders — list all orders ───────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, page = '1', limit = '20', search = '' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: { items: true, customer: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.order.count({ where }),
    ]);

    res.json({ orders, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

// ─── GET /orders/:id — single order ──────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid order ID' });

  try {
    const order = await prisma.order.findUnique({
      where: { Id: id },
      include: { items: { include: { product: { include: { images: true } } } }, customer: true },
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch order' });
  }
});

// ─── POST /orders — create order (checkout) ───────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      customerId,
      orderType,
      paymentMethod,
      items,            // [{ productId, productName, price, quantity }]
      subtotal,
      taxAmount,
      discountAmount,
      discountCode,
      total,
      notes,
      cashReceived,
      changeGiven,
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    const orderNumber = await generateOrderNumber();

    // Validate stock and reduce quantities
    for (const item of items) {
      if (!item.productId) continue;
      const product = await prisma.products.findUnique({ where: { Id: item.productId } });
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      if (product.Quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.Name}` });
      }
    }

    // Create order + items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerName: customerName || 'Guest',
          customerId: customerId || null,
          orderType: orderType || 'In-Store',
          paymentMethod: paymentMethod || 'Cash',
          paymentStatus: 'paid',
          status: 'completed',
          subtotal: Number(subtotal),
          taxAmount: Number(taxAmount),
          discountAmount: Number(discountAmount) || 0,
          discountCode: discountCode || null,
          total: Number(total),
          notes: notes || null,
          cashReceived: cashReceived ? Number(cashReceived) : null,
          changeGiven: changeGiven ? Number(changeGiven) : null,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: items.map((item: any) => ({
          orderId: newOrder.Id,
          productId: item.productId || null,
          productName: item.productName,
          price: Number(item.price),
          quantity: Number(item.quantity),
          subtotal: Number(item.price) * Number(item.quantity),
        })),
      });

      // Reduce product stock
      for (const item of items) {
        if (!item.productId) continue;
        await tx.products.update({
          where: { Id: item.productId },
          data: { Quantity: { decrement: item.quantity } },
        });
      }

      // Update discount usage
      if (discountCode) {
        await tx.discount.updateMany({
          where: { code: discountCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      return newOrder;
    });

    const fullOrder = await prisma.order.findUnique({
      where: { Id: order.Id },
      include: { items: true, customer: true },
    });

    res.status(201).json(fullOrder);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// ─── PATCH /orders/:id/status — update order status ─────────────────────────
router.patch('/:id/status', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid order ID' });

  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'completed', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await prisma.order.findUnique({ where: { Id: id }, include: { items: true } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // If cancelling/refunding, restore stock
    if ((status === 'cancelled' || status === 'refunded') && order.status === 'completed') {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { Id: id }, data: { status } });
        for (const item of order.items) {
          if (!item.productId) continue;
          await tx.products.update({
            where: { Id: item.productId },
            data: { Quantity: { increment: item.quantity } },
          });
        }
      });
    } else {
      await prisma.order.update({ where: { Id: id }, data: { status } });
    }

    const updated = await prisma.order.findUnique({ where: { Id: id }, include: { items: true } });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update order status' });
  }
});

// ─── DELETE /orders/:id — delete order ───────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid order ID' });

  try {
    const order = await prisma.order.findUnique({ where: { Id: id } });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { Id: id } });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete order' });
  }
});

export default router;
