-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "companyName" TEXT NOT NULL DEFAULT 'My Dairy Farm',
    "ownerName" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "email" TEXT,
    "billNote" TEXT DEFAULT 'Thank you for your business!',

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);
