// lib/models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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
  apiKey: String,
  unsplashApiKey: String,
  verified: { type: Boolean, default: false },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (this.password.startsWith('$2a$') || this.password.startsWith('$2b$') || this.password.startsWith('$2y$')) {
    return bcrypt.compare(candidatePassword, this.password);
  }
  return this.password === candidatePassword;
};

// This line prevents the model from being re-compiled on hot reloads
export default mongoose.models.User || mongoose.model("User", userSchema);
