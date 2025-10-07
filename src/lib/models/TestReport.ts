import mongoose, { Document, Schema } from 'mongoose';

export interface ITestReport extends Document {
  name: string;
  email: string;
  uid: string;
  reportData: object;
  createdAt: Date;
}

const testReportSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  uid: { type: String, required: true, unique: true },
  reportData: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.TestReport || mongoose.model<ITestReport>("TestReport", testReportSchema);
