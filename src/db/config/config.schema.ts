import { Schema, model } from 'mongoose';
import { IConfigDocument } from './config.types';

const ConfigSchema = new Schema({
  name: { type: String, unique: true },
  enabled: Boolean,
  type: String,
  config: Array,
});
export const ConfigModel = model<IConfigDocument>('config', ConfigSchema);
