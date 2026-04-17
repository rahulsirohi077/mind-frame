import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DB_URL;

if (!connectionString) {
	throw new Error("DB_URL is not set");
}

const globalForPrisma = globalThis as typeof globalThis & {
	prisma?: PrismaClient;
};

const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		adapter: new PrismaPg(connectionString),
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export default prisma;
