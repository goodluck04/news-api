export const redisConnection = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
};

// export const defaultQueueConfig = {
//     delay: 5000, // five second delay
//     removeOnComplete: {
//         count: 100, //no of email sotred
//         age: 60 * 60 * 24, //one day  
//     },
//     attempts: 3, // three attemps on failure
//     backoff: {
//         // on failure delay
//         type: "exponential",
//         delay: 1000, //1000,2000,3000 delay on failure
//     }
// }

// instant many email send
export const defaultQueueConfig = {
    // delay: 5000, // five second delay
    removeOnComplete: {
        count: 100, //no of email sotred
        age: 60 * 60 * 24, //one day  
    },
    attempts: 3, // three attemps on failure
    backoff: {
        // on failure delay
        type: "exponential",
        delay: 1000, //1000,2000,3000 delay on failure
    }
}