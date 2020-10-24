import { Document, Model } from 'mongoose';
export interface IConfig {
  name: string;
  enabled: boolean;
  type: string;
  config: any[];
}
export interface IConfigDocument extends IConfig, Document {}
export interface IConfigModel extends Model<IConfigDocument> {}
