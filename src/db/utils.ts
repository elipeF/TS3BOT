import mongoose from 'mongoose';
import { ConfigModel } from './config/config.schema';
export async function dbConnect(): Promise<void> {
  const database = mongoose.connection;
  database.once('open', async () => {
    console.log('Connected to database');
  });
  database.on('error', () => {
    console.log('Error connecting to database');
    process.exit(1);
  });
  if (process.env.MONGO_URL) {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
  } else {
    console.log('Please provide MONGO_URL as ENV');
    process.exit();
  }
}
export const dbDisconnect = (): Promise<void> => {
  return mongoose.disconnect();
};


export const loadDefaults = async (): Promise<void> => {
  const req = await ConfigModel.findOne({name: "commandReload"});
  if(!req) {
    await new ConfigModel({
    "name": "commandReload",
    "type": "command",
    "enabled": true,
    "config": [{
      "rights": []
    }]}).save();
  }
}
