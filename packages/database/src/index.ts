// Export database utilities
export * from "./utils";

// Export database connection helpers
export const createAuthDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/auth/index.js");
  return new PrismaClient();
};

export const createOrganizationDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/organization/index.js");
  return new PrismaClient();
};

export const createEmployeeDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/employee/index.js");
  return new PrismaClient();
};

export const createWalletDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/wallet/index.js");
  return new PrismaClient();
};

export const createPayrollDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/payroll/index.js");
  return new PrismaClient();
};

export const createTransactionDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/transaction/index.js");
  return new PrismaClient();
};

export const createNotificationDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/notification/index.js");
  return new PrismaClient();
};

export const createComplianceDbConnection = () => {
  const {
    PrismaClient,
  } = require("../../../node_modules/.prisma/compliance/index.js");
  return new PrismaClient();
};
