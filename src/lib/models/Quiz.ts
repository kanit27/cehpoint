import mongoose, { Document, Schema } from 'mongoose';

export interface IQuiz extends Document {
  userId: string;
  courseId: string;
  score: number;
  createdAt: Date;
}

const quizSchema = new Schema({
    userId: { type: String, required: true }, 
    courseId: { type: String, required: true }, 
    score: { type: Number, required: true }, 
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Quiz || mongoose.model<IQuiz>("Quiz", quizSchema);
