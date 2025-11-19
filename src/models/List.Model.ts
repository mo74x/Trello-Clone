import mongoose, { Schema, Document } from 'mongoose';

export interface IList extends Document {
  title: string;
  boardId: mongoose.Types.ObjectId;
  pos: number; // Position for drag-and-drop ordering
}

const ListSchema: Schema = new Schema({
  title:   { type: String, required: true },
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  pos:     { type: Number, required: true, default: 65535 } 
}, {
  timestamps: true
});

export default mongoose.model<IList>('List', ListSchema);