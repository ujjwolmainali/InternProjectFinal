-- CreateTable
CREATE TABLE "Category" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("Id")
);
