// check-latest-interview.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

async function check() {
  await mongoose.connect(uri);
  
  const db = mongoose.connection.db;
  const sessions = await db.collection('interviewsessions')
    .find({})
    .sort({ _id: -1 })
    .limit(1)
    .toArray();

  if (!sessions.length) {
    console.log("❌ No records found in 'interviewsessions' collection.");
  } else {
    const doc = sessions[0];
    console.log("=== LATEST INTERVIEW RECORD ===");
    console.log("Session ID:", doc.sessionId);
    console.log("Status:", doc.status);
    console.log("Turns:", doc.turnCount);
    console.log("Total Messages:", doc.history?.length);
    console.log("Feedback:", JSON.stringify(doc.feedback, null, 2));
  }
  
  await mongoose.disconnect();
}

check().catch(console.error);