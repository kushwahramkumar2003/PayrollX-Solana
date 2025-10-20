/*
  Warnings:

  - You are about to drop the `payroll_items` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('PAYROLL', 'BONUS', 'REFUND', 'ADJUSTMENT');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "payroll_items" DROP CONSTRAINT "payroll_items_employeeId_fkey";

-- DropForeignKey
ALTER TABLE "payroll_items" DROP CONSTRAINT "payroll_items_payrollRunId_fkey";

-- DropTable
DROP TABLE "payroll_items";

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "payrollRunId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL DEFAULT 'PAYROLL',
    "amount" DECIMAL(65,30) NOT NULL,
    "tokenAddress" TEXT,
    "signature" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "error" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);
