-- CreateTable
CREATE TABLE "Production" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "productName" TEXT NOT NULL,
    "milkUsed" DOUBLE PRECISION NOT NULL,
    "milkType" TEXT NOT NULL,
    "outputQty" DOUBLE PRECISION NOT NULL,
    "yield" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Production_pkey" PRIMARY KEY ("id")
);
