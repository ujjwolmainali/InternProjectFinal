-- CreateTable
CREATE TABLE "Products" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Price" INTEGER NOT NULL,
    "Category" TEXT NOT NULL,
    "Quantity" INTEGER NOT NULL DEFAULT 0,
    "Description" TEXT,
    "ImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Products_pkey" PRIMARY KEY ("Id")
);
