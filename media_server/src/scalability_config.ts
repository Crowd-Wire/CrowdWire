import "dotenv/config";
import os from "os";

export const scalability_config = {
    //@ts-ignore
    max_consumers_per_worker: parseInt(process.env.MAX_CONSUMERS_PER_WORKER, 10),
    //@ts-ignore
    max_consumers: Object.keys(os.cpus()).length * parseInt(process.env.MAX_CONSUMERS_PER_WORKER, 10),
} as const;