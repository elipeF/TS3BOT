import { Schema, model } from 'mongoose';
import { IPrivateChannelsDocument } from './privatechannels.types';

const PrivateChannelsSchema = new Schema({
  cid: Number,
  validTo: Number,
  owner: Number,
  status: Number
});
export const PrivateChannelsModel = model<IPrivateChannelsDocument>('privatechannels', PrivateChannelsSchema);

export const PRIVATE_CHANNEL_FREE = 0
export const PRIVATE_CHANNEL_TAKEN = 1
