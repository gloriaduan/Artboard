import "server-only";
import { PrismaClient } from "@/prisma/generated/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const adapter = new PrismaNeonHttp(process.env.DATABASE_URL!, {});
export const db = new PrismaClient({ adapter });
