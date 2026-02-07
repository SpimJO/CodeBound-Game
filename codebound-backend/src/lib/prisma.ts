import { PrismaClient } from '@prisma/client';

/**
 * Singleton PrismaClient instance
 * Prevents multiple instances and connection pool exhaustion
 */
class PrismaClientSingleton {
    private static instance: PrismaClient | null = null;

    private constructor() {
        // Private constructor prevents direct instantiation
    }

    public static getInstance(): PrismaClient {
        if (!PrismaClientSingleton.instance) {
            PrismaClientSingleton.instance = new PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
            });

            // Handle shutdown gracefully
            process.on('beforeExit', async () => {
                await PrismaClientSingleton.instance?.$disconnect();
            });
        }

        return PrismaClientSingleton.instance;
    }

    public static async disconnect(): Promise<void> {
        if (PrismaClientSingleton.instance) {
            await PrismaClientSingleton.instance.$disconnect();
            PrismaClientSingleton.instance = null;
        }
    }
}

// Export singleton instance
export const prisma = PrismaClientSingleton.getInstance();

// Export class for testing/special cases
export default PrismaClientSingleton;
