import "./utils/env";
import http from "http";
import printAppInfo from "./utils/print-app-info";

const createServer = (process: NodeJS.Process) => {
    return async () => {
        let disconnectPrisma: (() => Promise<void>) | undefined;

        try {
            console.log("[server] Starting server initialization...");

            // Import modules dynamically to catch errors
            console.log("[server] Importing modules...");
            const prismaModule = await import("./lib/prisma");
            const { prisma } = prismaModule;
            disconnectPrisma = async () => {
                await prisma.$disconnect();
            };

            const indexModule = await import(".");
            const index = indexModule.default;

            console.log("[server] Creating Express app...");
            const _index = new index();
            const main = _index.app;
            const server = http.createServer(main);

            console.log("[server] Connecting to database...");
            await prisma.$connect();

            shutdown(server, process, disconnectPrisma);

            console.log("[server] Starting HTTP server on port", process.env.PORT);
            server.listen(process.env.PORT, () => {
                printAppInfo(
                    `Server started on port ${process.env.PORT}`
                );
            });
        } catch (error) {
            console.error("\n[server] ❌ Failed to start server!");
            console.error("[server] Error type:", error?.constructor?.name || typeof error);
            if (error instanceof Error) {
                console.error("[server] Error message:", error.message);
                console.error("[server] Error stack:", error.stack);
            } else {
                console.error("[server] Error object:", error);
            }
            process.exit(1);
        }
    };
};

const shutdown = (server: http.Server, proc: NodeJS.Process, disconnectPrisma?: () => Promise<void>) => {
    const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM"];
    let shuttingDown = false;

    const shutdown = async (reason: string) => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`[shutdown] received ${reason}, starting shutdown…`);

        const forceExitTimer = setTimeout(() => {
            console.error("[shutdown] force exit after timeout");
            proc.exit(1);
        }, 10_000);
        (forceExitTimer as any).unref?.();

        server.close(async (closeErr) => {
            if (closeErr) {
                console.error("[shutdown] http server close error:", closeErr);
            } else {
                console.log("[shutdown] http server closed");
            }

            try {
                if (disconnectPrisma) {
                    await disconnectPrisma()
                    console.log("[shutdown] prisma disconnected");
                }
            } catch (e) {
                console.error("[shutdown] prisma disconnect error:", e);
            }

            clearTimeout(forceExitTimer);
            console.log("[shutdown] complete, exiting");
            proc.exit(closeErr ? 1 : 0);
        });
    };

    signals.forEach((sig) =>
        proc.on(sig, () => shutdown(sig))
    );

    proc.on("uncaughtException", (err) => {
        console.error("[uncaughtException]", err);
        shutdown("uncaughtException");
    });
    proc.on("unhandledRejection", (reason) => {
        console.error("[unhandledRejection]", reason);
        shutdown("unhandledRejection");
    });
}

createServer(process)()