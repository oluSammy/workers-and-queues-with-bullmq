import { Job, Worker, WorkerOptions } from "bullmq";
import { Queue } from "bullmq";
import { createClient } from "redis";
import axios from "axios";

export interface WorkerJob {
  type: string;
  data: any;
}

// process.env.REDIS_URL
const redisClient = createClient({
  url: "redis://127.0.0.1:6379",
});

async function connectToRedis() {
  try {
    await redisClient.ping();
    console.info("Redis client already connected");
  } catch (e) {
    await redisClient.connect();
    console.info("Redis client connected");
  }
}

redisClient.on("connect", () => {
  console.info(`[CACHE] Successfully connected to Redis instance`);
});

const redisOptions = { host: "localhost", port: 6379 };
const workerHandler = async (job: Job<WorkerJob>) => {
  switch (job.data.type) {
    case "hello-world":
      console.info("Hello World job handler");
      console.info("Job payload", job.data);
      break;
    case "call-api":
      console.log("Call API Job handler");
      axios("https://jsonplaceholder.typicode.com/todos/1").then((res) => {
        console.log(res.data);
      });
      break;
    default:
      console.log("Unknown job type");
  }
};

const workerOptions: WorkerOptions = {
  connection: {
    host: "localhost",
    port: 6379,
  },
};

const worker = new Worker("testQueue", workerHandler, workerOptions);

// console.log("Worker started");
worker.on("ready", async () => {
  await connectToRedis();
  console.log("Worker ready to accept jobs 🧑‍🏭");
});

worker.on("completed", (job) => {
  console.log("Job completed", job.data);
});

const queues = {
  testQueue: new Queue("testQueue", { connection: redisOptions }),
};

export const addJobToQueue = async (job: { type: string; data: any }) => {
  queues.testQueue.add(job.type, job);
};
