import auth from "./routes/auth.route";
import sample from "./routes/sample.route";
import { baseRouter } from "@/lib/baseRouter";


class AppRouter extends baseRouter {
    protected initRoutes(): void {
        this.router.use("/sample", sample);
        this.router.use("/auth", auth);
    }
}

export default AppRouter