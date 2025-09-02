// messageQueue.js

const { sendDynamicMessage } = require("./sendDynamicMessage");


const queue = [];
let isProcessing = false;

// ====== Queue Processor ======
async function processQueue() {
  if (isProcessing) return; // ensure only one processor runs
  isProcessing = true;

  while (queue.length > 0) {
    const job = queue.shift(); // get the first job
    try {

      // Call the actual business logic
      await sendDynamicMessage(job.data);

      console.log("Job completed:", );
    } catch (err) {
      console.error("Job failed:", job.data, err);
    }
  }

  isProcessing = false;
}

// ====== Producer Function ======
function sendMessage(data) {
  queue.push({ data });   // push job into the queue
  processQueue();         // trigger the processor
}

module.exports = { sendMessage };
