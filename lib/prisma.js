import { PrismaClient } from "./generated/prisma";
const globalForPrisma = globalThis;
export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.

// import { PrismaClient } from "@prisma/client";

// const globalForPrisma = globalThis;

// export const prisma= globalForPrisma.prisma ?? new PrismaClient({
//   log: ['query'],
// });

// if (process.env.NODE_ENV !== 'production') {
//   globalForPrisma.prisma = prisma;
// }
