import { Queue, Worker } from "bullmq";
import { defaultQueueConfig, redisConnection } from "../config/queue.js";
import { logger } from "../config/logger.js";
import { sendEmail } from "../config/mailer.js";


// bullmq is based on redis


// queue name in redis 
export const emailQueueName = "email-queue";

export const emailQueue = new Queue(emailQueueName, {
    connection: redisConnection,
    defaultJobOptions: defaultQueueConfig,
});

// worker for instant one
export const handler = new Worker(emailQueueName, async (job) => {
    console.log("the email worker data is ", job.data);
    const data = job.data;
    data?.map(async (item) => {
        await sendEmail(item.toEmail, item.subject, item.body)
    });
}, {
    connection: redisConnection
});

// for delay one
// export const handler = new Worker(emailQueueName, async (job) => {
//     console.log("the email worker data is ", job.data);
// }, {
//     connection: redisConnection
// });

// worker listener
handler.on("completed", (job) => {
    logger.info({ job: job, message: "Job completed" });

    console.log(`the job ${job.id} is completed`);
})
// worker listener
handler.on("failed", (job) => {
    console.log(`the job ${job.id} is failed`);
})