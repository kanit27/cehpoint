// lib/models/Project.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProject extends Document {
  title: string;
  description: string;
  difficulty: string;
  time: string;
  userId: string;
  firebaseUId: string;
  email: string;
  completed: boolean;
  github_url?: string;
  video_url?: string;
  approve: 'pending' | 'accepted' | 'rejected';
  dateCreated: Date;
}

const projectSchema: Schema<IProject> = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    time: { type: String, required: true },
    userId: { type: String, required: true },
    firebaseUId: { type: String, required: true },
    email: { type: String, required: true },
    completed: { type: Boolean, default: false, required: true },
    github_url: { type: String },
    video_url: { type: String },
    approve: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    dateCreated: { type: Date, default: Date.now },
  },
  { collection: "project-users" }
);

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>("Project", projectSchema);

export default Project;