/*
  Warnings:

  - You are about to drop the `organizations` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "employees" DROP CONSTRAINT "employees_organizationId_fkey";

-- DropTable
DROP TABLE "organizations";

-- CreateTable
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "publicKey" TEXT NOT NULL,
    "keyShareIds" TEXT[],
    "provider" TEXT NOT NULL DEFAULT 'mpc',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
