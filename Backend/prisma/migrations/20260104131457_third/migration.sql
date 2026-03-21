/*
  Warnings:

  - You are about to drop the column `ImageUrl` on the `Products` table. All the data in the column will be lost.
  - Added the required column `Status` to the `Products` table without a default value. This is not possible if the table is not empty.
  - Made the column `Description` on table `Products` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Products" DROP COLUMN "ImageUrl",
ADD COLUMN     "IsFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "SalePrice" DOUBLE PRECISION,
ADD COLUMN     "Status" TEXT NOT NULL,
ALTER COLUMN "Price" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "Quantity" DROP DEFAULT,
ALTER COLUMN "Description" SET NOT NULL;

-- CreateTable
CREATE TABLE "ProductImage" (
    "Id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ProductColor" (
    "Id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "ProductColor_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "ColorImage" (
    "Id" SERIAL NOT NULL,
    "colorId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,

    CONSTRAINT "ColorImage_pkey" PRIMARY KEY ("Id")
);

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductColor" ADD CONSTRAINT "ProductColor_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Products"("Id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ColorImage" ADD CONSTRAINT "ColorImage_colorId_fkey" FOREIGN KEY ("colorId") REFERENCES "ProductColor"("Id") ON DELETE CASCADE ON UPDATE CASCADE;
