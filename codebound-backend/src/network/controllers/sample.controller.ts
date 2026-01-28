import Api from "@/lib/api";
import { Request, Response, NextFunction } from "express";

class SampleController extends Api {

    public async sampleRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const data = {
                message: "Sample Route Response"
            }

            this.success(res, data, "Sample Route")
        } catch (error) {
            console.error("Error in sampleRoute:", error);
            next(error);
        }
    }

}

export default SampleController;
