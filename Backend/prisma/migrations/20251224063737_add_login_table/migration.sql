-- CreateTable
CREATE TABLE "Login" (
    "Id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile" TEXT NOT NULL,
    "First_Name" TEXT NOT NULL,
    "Last_Name" TEXT NOT NULL,
    "Bio" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "Address" TEXT NOT NULL,

    CONSTRAINT "Login_pkey" PRIMARY KEY ("Id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Login_email_key" ON "Login"("email");
