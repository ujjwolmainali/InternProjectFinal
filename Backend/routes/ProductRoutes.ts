import { Router } from 'express';
import prisma from '../lib/prisma';
import upload from '../middleware/product_Img_upload';
import fs from 'fs/promises';
import path from 'path';



const router = Router();
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Helper: validate all fields
const validateProductFields = (body: any) => {
  const { Name, Price, Category, Description, ImageUrl, Quantity } = body;
  return !!(Name && Price !== undefined && Category && Description && ImageUrl && Quantity !== undefined);
};

// Delete uploaded file
const deleteFile = async (fileName?: string) => {
  if (!fileName) return;
  const fullPath = path.join(UPLOAD_DIR, fileName);
  try {
    await fs.access(fullPath);
    await fs.unlink(fullPath);
  } catch (err: any) {
    if (err.code !== 'ENOENT') console.error('Failed to delete file:', err);
  }
};

// ------------------- CREATE PRODUCT -------------------
router.post(
  "/",
  upload.any(),
  async (req, res) => {
    try {
      const {
        Name,
        Category,
        Price,
        SalePrice,
        Quantity,
        Description,
        Status,
        IsFeatured,
        Colors,
        Tags,
      } = req.body;

      const price = Number(Price);
      const quantity = Number(Quantity);
      const salePrice = SalePrice ? Number(SalePrice) : null;

      if (!Name || !Category || !Description || isNaN(price) || isNaN(quantity)) {
        return res.status(400).json({ message: "Invalid input data" });
      }

      const parsedColors = Colors ? JSON.parse(Colors) : [];
      const parsedTags = Tags ? JSON.parse(Tags) : [];

      const files = req.files as Express.Multer.File[];

      // ===============================
      //  CREATE PRODUCT
      // ===============================
      const product = await prisma.products.create({
        data: {
          Name,
          Category,
          Price: price,
          SalePrice: salePrice,
          Quantity: quantity,
          Description,
          Status,
          IsFeatured: IsFeatured === "true",
        },
      });

      // ===============================
      //  MAP COLOR IMAGES
      // ===============================
      const colorImageMap: Record<string, Express.Multer.File[]> = {};
      const productImages: Express.Multer.File[] = [];

      files.forEach(file => {
        // colorImages[#ff0000]
        const match = file.fieldname.match(/colorImages\[(.+)\]/);

        if (match) {
          const color = match[1];
          if (!colorImageMap[color]) colorImageMap[color] = [];
          colorImageMap[color].push(file);
        }

        if (file.fieldname === "productImages") {
          productImages.push(file);
        }
      });

      // ===============================
      //  SAVE PRODUCT IMAGES
      // ===============================
      if (productImages.length) {
        await prisma.productImage.createMany({
          data: productImages.map(file => ({
            productId: product.Id,
            imageUrl: file.path.replace(/\\/g, "/"),
          })),
        });
      }

      // ===============================
      //  SAVE COLORS + COLOR IMAGES
      // ===============================
      for (const color of parsedColors) {
        const colorRow = await prisma.productColor.create({
          data: {
            productId: product.Id,
            color: color.color,
          },
        });

        const imgs = colorImageMap[color.color] || [];

        if (imgs.length) {
          await prisma.colorImage.createMany({
            data: imgs.map(file => ({
              colorId: colorRow.Id,
              imageUrl: file.path.replace(/\\/g, "/"),
            })),
          });
        }
      }

      res.status(201).json({
        message: "Product created successfully",
        productId: product.Id,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to create product" });
    }
  }
);





// ------------------- UPDATE PRODUCT -------------------
router.put("/:id", upload.any(), async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid product ID" });

  try {
    const existing = await prisma.products.findUnique({
      where: { Id: id },
      include: {
        images: true,
        colors: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!existing) return res.status(404).json({ message: "Product not found" });

    const {
      Name,
      Category,
      Price,
      SalePrice,
      Quantity,
      Description,
      Status,
      IsFeatured,
      Colors,
      Tags,
    } = req.body;

    const parsedColors = Colors ? JSON.parse(Colors) : [];
    const parsedTags = Tags ? JSON.parse(Tags) : [];

    // ===============================
    // DELETE OLD FILES FROM DISK
    // ===============================
    for (const img of existing.images) {
      await fs.unlink(img.imageUrl).catch(() => {});
    }

    for (const color of existing.colors) {
      for (const img of color.images) {
        await fs.unlink(img.imageUrl).catch(() => {});
      }
    }

    // ===============================
    // DELETE OLD DB RECORDS
    // ===============================
    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.colorImage.deleteMany({
      where: { color: { productId: id } },
    });
    await prisma.productColor.deleteMany({ where: { productId: id } });

    // ===============================
    // UPDATE PRODUCT
    // ===============================
    await prisma.products.update({
      where: { Id: id },
      data: {
        Name,
        Category,
        Price: Number(Price),
        SalePrice: SalePrice ? Number(SalePrice) : null,
        Quantity: Number(Quantity),
        Description,
        Status,
        IsFeatured: IsFeatured === "true",
      },
    });

    // ===============================
    // MAP NEW FILES
    // ===============================
    const files = req.files as Express.Multer.File[];
    const colorImageMap: Record<string, Express.Multer.File[]> = {};
    const productImages: Express.Multer.File[] = [];

    files.forEach(file => {
      const match = file.fieldname.match(/colorImages\[(.+)\]/);
      if (match) {
        const color = match[1];
        if (!colorImageMap[color]) colorImageMap[color] = [];
        colorImageMap[color].push(file);
      } else if (file.fieldname === "productImages") {
        productImages.push(file);
      }
    });

    // ===============================
    // ADD PRODUCT IMAGES
    // ===============================
    if (productImages.length) {
      await prisma.productImage.createMany({
        data: productImages.map(file => ({
          productId: id,
          imageUrl: file.path.replace(/\\/g, "/"),
        })),
      });
    }

    // ===============================
    // ADD COLORS + COLOR IMAGES
    // ===============================
    for (const color of parsedColors) {
      const colorRow = await prisma.productColor.create({
        data: { productId: id, color: color.color },
      });

      const imgs = colorImageMap[color.color] || [];
      if (imgs.length) {
        await prisma.colorImage.createMany({
          data: imgs.map(file => ({
            colorId: colorRow.Id,
            imageUrl: file.path.replace(/\\/g, "/"),
          })),
        });
      }
    }

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update product" });
  }
});



// ------------------- READ ALL PRODUCTS -------------------
router.get('/', async (req, res) => {
  try {
    const products = await prisma.products.findMany({
      include: {
        images: true,        // Product images
        colors: {
          include: {
            images: true,    // Color images
          },
        },
      },
    });

    res.status(200).json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});



// ------------------- READ SINGLE PRODUCT -------------------
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

  try {
    const product = await prisma.products.findUnique({
      where: { Id: id },
      include: {
        images: true,        // Product images
        colors: {
          include: {
            images: true,    // Color images
          },
        },
      },
    });

    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// ------------------- DELETE PRODUCT -------------------
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "Invalid product ID" });

  try {
    //  Fetch the product with images and colors
    const product = await prisma.products.findUnique({
      where: { Id: id },
      include: {
        images: true, // product images
        colors: {
          include: { images: true }, // color images
        },
      },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    //  Delete files from disk
    for (const img of product.images) {
      await fs.unlink(img.imageUrl).catch(() => {}); // ignore if file not found
    }

    for (const color of product.colors) {
      for (const img of color.images) {
        await fs.unlink(img.imageUrl).catch(() => {});
      }
    }

    //  Delete all related DB records
    await prisma.colorImage.deleteMany({
      where: { color: { productId: id } },
    });

    await prisma.productColor.deleteMany({ where: { productId: id } });

    await prisma.productImage.deleteMany({ where: { productId: id } });

    //  Delete the product itself
    await prisma.products.delete({ where: { Id: id } });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});



// ------------------- CREATE CATEGORY -------------------
router.post("/categories", async (req, res) => {
  try {
    const { Name, Description } = req.body;

    if (!Name || !Description) {
      return res.status(400).json({ message: "Name and Description are required" });
    }

    const category = await prisma.category.create({
      data: {
        Name,
        Description,
      },
    });

    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create category" });
  }
});

// ------------------- UPDATE CATEGORY -------------------
router.put("/categories/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid category ID" });

  try {
    const { Name, Description } = req.body;


    if (!Name || !Description) {
      return res.status(400).json({ message: "Name and Description are required" });
    }

    const existing = await prisma.category.findUnique({ where: { Id: id } });
    if (!existing) return res.status(404).json({ message: "Category not found" });

    const updated = await prisma.category.update({
      where: { Id: id },
      data: { Name, Description },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update category" });
  }
});


router.get("/categories/all", async (req, res) => {
  try {
    const categories = await prisma.category.findMany(
      {
        
        orderBy: { Id: "asc" }
      }
    );
    res.status(200).json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});



router.get("/categories/all/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { Id: Number(id) },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch category" });
  }
});


// ------------------- DELETE CATEGORY -------------------
router.delete("/categories/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  try {
    const existing = await prisma.category.findUnique({
      where: { Id:id },
    });

    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    await prisma.category.delete({
      where: { Id:id },
    });

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete category" });
  }
});



export default router;
