import { config } from 'dotenv';
import { ConfigManager } from './config/ConfigManager.class';
import { dbConnect, loadDefaults } from './db/utils';
import TeamSpeakConnect from './TeamSpeakConnect.class';
config();

const init = async () => {
  console.log('Starting instance');
  await dbConnect();
  await loadDefaults();
  const ts = new TeamSpeakConnect(new ConfigManager());
  await ts.init();
};

init();
