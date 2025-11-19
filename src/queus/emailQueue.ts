import { Queue, Worker } from 'bullmq';
import { Redis } from 'ioredis';

// 1. Setup Redis Connection
const connection = new Redis({
    maxRetriesPerRequest: null
});
export const emailQueue = new Queue('email-queue', { connection });

// This runs in the background and "processes" jobs
const worker = new Worker('email-queue', async (job) => {
    console.log(`Processing job ${job.id}...`);

    const { email, cardTitle } = job.data;

    // Simulate a slow email service (wait 2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log(`📧 [EMAIL SENT] To: ${email} | Subject: You were assigned to card "${cardTitle}"`);
}, { connection });

worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
});

worker.on('failed', (job, err) => {
    console.log(`Job ${job?.id} has failed with ${err.message}`);
});