// lib/models/ProjectTemplate.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

interface IAssignedTo {
    userid: string;
    title: string;
}

export interface IProjectTemplate extends Document {
  category: string;
  title: string;
  description: string;
  difficulty: string;
  time: string;
  date: Date;
  assignedTo: IAssignedTo[];
}

const assignedToSchema = new Schema<IAssignedTo>({
    userid: { type: String, required: true },
    title: { type: String, required: true },
});

const ProjectTemplateSchema: Schema<IProjectTemplate> = new mongoose.Schema(
  {
    category: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, required: true },
    time: { type: String, required: true },
    date: { type: Date, default: Date.now },
    assignedTo: {
      type: [assignedToSchema],
      default: [],
    },
  },
  { collection: "main_projects" }
);

const ProjectTemplate: Model<IProjectTemplate> = mongoose.models.ProjectTemplate || mongoose.model<IProjectTemplate>("ProjectTemplate", ProjectTemplateSchema);

export default ProjectTemplate;