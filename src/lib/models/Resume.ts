import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  name: string;
  email: string;
  uid: string;
  resumeData: object;
  createdAt: Date;
}

const resumeSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  uid: { type: String, required: true, unique: true },
  resumeData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Resume || mongoose.model<IResume>("Resume", resumeSchema);
