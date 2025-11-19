import mongoose, { Schema, Document } from 'mongoose';

export interface IBoard extends Document{
    tittle:string;
    owner:mongoose.Types.ObjectId;
    members:mongoose.Types.ObjectId[];
} 

const BoardSchema: Schema = new Schema({
    title: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  }, {
    timestamps: true
  });
  
export default mongoose.model<IBoard>('Board', BoardSchema);