import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /customers — list all customers ─────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', search = '' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: { select: { orders: true } },
          orders: {
            select: { total: true, status: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.customer.count({ where }),
    ]);

    // Compute total spend per customer
    const enriched = customers.map((c) => {
      const totalSpend = c.orders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + o.total, 0);
      return { ...c, totalSpend };
    });

    res.json({ customers: enriched, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customers' });
  }
});

// ─── GET /customers/:id — single customer with orders ────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid customer ID' });

  try {
    const customer = await prisma.customer.findUnique({
      where: { Id: id },
      include: {
        orders: {
          include: { items: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch customer' });
  }
});

// ─── POST /customers — create customer ───────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, notes } = req.body;

    if (!name) return res.status(400).json({ message: 'Name is required' });

    // Check email uniqueness if provided
    if (email) {
      const existing = await prisma.customer.findUnique({ where: { email } });
      if (existing) return res.status(409).json({ message: 'Email already in use' });
    }

    const customer = await prisma.customer.create({
      data: { name, email: email || null, phone: phone || null, address: address || null, notes: notes || null },
    });

    res.status(201).json(customer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create customer' });
  }
});

// ─── PUT /customers/:id — update customer ────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid customer ID' });

  try {
    const { name, email, phone, address, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const existing = await prisma.customer.findUnique({ where: { Id: id } });
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    // Check email uniqueness if changed
    if (email && email !== existing.email) {
      const emailTaken = await prisma.customer.findUnique({ where: { email } });
      if (emailTaken) return res.status(409).json({ message: 'Email already in use' });
    }

    const updated = await prisma.customer.update({
      where: { Id: id },
      data: { name, email: email || null, phone: phone || null, address: address || null, notes: notes || null },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update customer' });
  }
});

// ─── DELETE /customers/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid customer ID' });

  try {
    const existing = await prisma.customer.findUnique({ where: { Id: id } });
    if (!existing) return res.status(404).json({ message: 'Customer not found' });

    // Unlink orders before deleting
    await prisma.order.updateMany({ where: { customerId: id }, data: { customerId: null } });
    await prisma.customer.delete({ where: { Id: id } });

    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete customer' });
  }
});

export default router;
