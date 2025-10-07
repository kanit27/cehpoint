// lib/models/Course.ts
import mongoose, { Document, Schema } from 'mongoose';

// Interface for type safety
export interface ICourse extends Document {
  user: string;
  content: string;
  type: string;
  mainTopic: string;
  subTopic: string;
  photo: string;
  date: Date;
  end: Date;
  completed: boolean;
  progress: number;
}

const courseSchema = new Schema({
  user: { type: String, required: true },
  content: { type: String, required: true },
  type: { type: String },
  mainTopic: { type: String },
  subTopic: { type: String },
  photo: { type: String },
  date: { type: Date, default: Date.now },
  end: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
  progress: { type: Number, default: 0 },
});

// This line prevents the model from being re-compiled on hot reloads
export default mongoose.models.Course || mongoose.model<ICourse>("Course", courseSchema);