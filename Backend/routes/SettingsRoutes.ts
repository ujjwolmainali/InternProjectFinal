import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';

const router = Router();

// ─── GET /settings — get store settings (always returns one record) ──────────
router.get('/', async (req: Request, res: Response) => {
  try {
    let settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      settings = await prisma.storeSettings.create({ data: {} });
    }

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch settings' });
  }
});

// ─── PUT /settings — update store settings ───────────────────────────────────
router.put('/', async (req: Request, res: Response) => {
  try {
    const { storeName, storeAddress, storePhone, storeEmail, currency, taxRate, taxEnabled, receiptFooter } = req.body;

    let settings = await prisma.storeSettings.findFirst();

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: {
          storeName: storeName || 'My Store',
          storeAddress: storeAddress || '',
          storePhone: storePhone || '',
          storeEmail: storeEmail || '',
          currency: currency || 'USD',
          taxRate: taxRate !== undefined ? Number(taxRate) : 8,
          taxEnabled: taxEnabled !== undefined ? Boolean(taxEnabled) : true,
          receiptFooter: receiptFooter || 'Thank you for your purchase!',
        },
      });
    } else {
      settings = await prisma.storeSettings.update({
        where: { Id: settings.Id },
        data: {
          storeName: storeName !== undefined ? storeName : settings.storeName,
          storeAddress: storeAddress !== undefined ? storeAddress : settings.storeAddress,
          storePhone: storePhone !== undefined ? storePhone : settings.storePhone,
          storeEmail: storeEmail !== undefined ? storeEmail : settings.storeEmail,
          currency: currency !== undefined ? currency : settings.currency,
          taxRate: taxRate !== undefined ? Number(taxRate) : settings.taxRate,
          taxEnabled: taxEnabled !== undefined ? Boolean(taxEnabled) : settings.taxEnabled,
          receiptFooter: receiptFooter !== undefined ? receiptFooter : settings.receiptFooter,
        },
      });
    }

    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update settings' });
  }
});

export default router;
