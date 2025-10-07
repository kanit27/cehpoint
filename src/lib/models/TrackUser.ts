import mongoose, { Document, Schema } from 'mongoose';

// Interface for Daily Performance sub-document
export interface IDailyPerformance extends Document {
  date: Date;
  totalScore: number;
  count: number;
}

// Interface for Performance Score sub-document
export interface IPerformanceScore extends Document {
  projectCount: number;
  courseCount: number;
  quizScoreAvg: number;
  averageProgress: number;
}

// Interface for the main TrackUser document
export interface ITrackUser extends Document {
  email: string;
  mName?: string;
  type?: string;
  uid: string;
  strick: number;
  testScore: number;
  max_strick: number;
  dailyPerformance: IDailyPerformance[];
  performanceScore: IPerformanceScore;
}

// Schema for daily performance records
const dailyPerformanceSchema = new Schema<IDailyPerformance>({
  date: { type: Date, required: true },
  totalScore: { type: Number, default: 0 },
  count: { type: Number, default: 0 }
});

// Schema for overall performance scores
const performanceScoreSchema = new Schema<IPerformanceScore>({
  projectCount: { type: Number, default: 0 },
  courseCount: { type: Number, default: 0 },
  quizScoreAvg: { type: Number, default: 0 },
  averageProgress: { type: Number, default: 0 },
});

// Main schema for tracking users
const trackUserSchema = new Schema<ITrackUser>({
  email: { type: String, unique: true, required: true },
  mName: { type: String },
  type: { type: String },
  uid: { type: String, required: true, unique: true },
  strick: { type: Number, default: 0 },
  testScore: { type: Number, default: 0 },
  max_strick: { type: Number, default: 0 },
  dailyPerformance: [dailyPerformanceSchema], // Array of daily performance records
  performanceScore: { type: performanceScoreSchema, default: () => ({}) } // Store overall performance metrics
});

// This line prevents the model from being re-compiled on hot reloads
export default mongoose.models.TrackUser || mongoose.model<ITrackUser>("TrackUser", trackUserSchema);
