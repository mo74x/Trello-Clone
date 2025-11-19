import mongoose, { Schema, Document } from 'mongoose';

export interface ICard extends Document {
  title: string;
  description?: string;
  listId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId; // Keeping boardId helps with querying
  pos: number;
  assignees: mongoose.Types.ObjectId[];
}

const CardSchema: Schema = new Schema({
  title:       { type: String, required: true },
  description: { type: String },
  listId:      { type: Schema.Types.ObjectId, ref: 'List', required: true },
  boardId:     { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  pos:         { type: Number, required: true, default: 65535 },
  assignees:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, {
  timestamps: true
});

export default mongoose.model<ICard>('Card', CardSchema);