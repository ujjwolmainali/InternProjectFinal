import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /discounts ───────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const discounts = await prisma.discount.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(discounts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch discounts' });
  }
});

// ─── POST /discounts/validate — validate a coupon code ───────────────────────
router.post('/validate', async (req: Request, res: Response) => {
  try {
    const { code, orderTotal } = req.body;
    if (!code) return res.status(400).json({ message: 'Coupon code required' });

    const discount = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });

    if (!discount) return res.status(404).json({ message: 'Invalid coupon code' });
    if (!discount.isActive) return res.status(400).json({ message: 'Coupon is inactive' });
    if (discount.expiresAt && new Date() > discount.expiresAt) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }
    if (discount.maxUses !== null && discount.usedCount >= discount.maxUses) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }
    if (discount.minOrder && orderTotal < discount.minOrder) {
      return res.status(400).json({ message: `Minimum order amount is $${discount.minOrder.toFixed(2)}` });
    }

    const discountAmount =
      discount.type === 'percentage'
        ? (orderTotal * discount.value) / 100
        : Math.min(discount.value, orderTotal);

    res.json({ valid: true, discount, discountAmount: Math.round(discountAmount * 100) / 100 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to validate coupon' });
  }
});

// ─── POST /discounts — create discount ───────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const { code, type, value, minOrder, maxUses, isActive, expiresAt } = req.body;

    if (!code || !type || value === undefined) {
      return res.status(400).json({ message: 'code, type and value are required' });
    }
    if (!['percentage', 'fixed'].includes(type)) {
      return res.status(400).json({ message: 'type must be percentage or fixed' });
    }

    const existing = await prisma.discount.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return res.status(409).json({ message: 'Coupon code already exists' });

    const discount = await prisma.discount.create({
      data: {
        code: code.toUpperCase(),
        type,
        value: Number(value),
        minOrder: minOrder ? Number(minOrder) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json(discount);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create discount' });
  }
});

// ─── PUT /discounts/:id — update discount ────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid discount ID' });

  try {
    const { code, type, value, minOrder, maxUses, isActive, expiresAt } = req.body;

    const existing = await prisma.discount.findUnique({ where: { Id: id } });
    if (!existing) return res.status(404).json({ message: 'Discount not found' });

    const updated = await prisma.discount.update({
      where: { Id: id },
      data: {
        code: code ? code.toUpperCase() : existing.code,
        type: type || existing.type,
        value: value !== undefined ? Number(value) : existing.value,
        minOrder: minOrder !== undefined ? (minOrder ? Number(minOrder) : null) : existing.minOrder,
        maxUses: maxUses !== undefined ? (maxUses ? Number(maxUses) : null) : existing.maxUses,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : existing.expiresAt,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update discount' });
  }
});

// ─── DELETE /discounts/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid discount ID' });

  try {
    const existing = await prisma.discount.findUnique({ where: { Id: id } });
    if (!existing) return res.status(404).json({ message: 'Discount not found' });

    await prisma.discount.delete({ where: { Id: id } });
    res.json({ message: 'Discount deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete discount' });
  }
});

export default router;
