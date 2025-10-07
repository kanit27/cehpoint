// lib/models/User.ts
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  mName: String,
  password: String,
  profile: {
    type: String,
    default: "https://firebasestorage.googleapis.com/v0/b/ai-based-training-platfo-ca895.appspot.com/o/user.png?alt=media&token=cdde4ad1-26e7-4edb-9f7b-a3172fbada8d"
  },
  role: {
    type: String,
    default: "user",
  },
  type: String,
  uid: { type: String, required: true, unique: true },
  // ... add all other fields from your User.js model
});

// This line prevents the model from being re-compiled on hot reloads
export default mongoose.models.User || mongoose.model("User", userSchema);