import { Document, Model } from 'mongoose';
export interface IPrivateChannels {
  cid: number,
  validTo: number,
  owner: number,
  status: number
}
export interface IPrivateChannelsDocument extends IPrivateChannels, Document {}
export interface IPrivateChannelsModel extends Model<IPrivateChannelsDocument> {}
