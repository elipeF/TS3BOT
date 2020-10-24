import { TeamSpeak, QueryProtocol } from 'ts3-nodejs-library';
import { CommandsHandler } from './commands/CommandsHandler.class';
import { ConfigManager } from './config/ConfigManager.class';
import { EventsHandler } from './events/EventsHandler.class';
import { IntervalsHandler } from './intervals/IntervalsHandler.class';

export default class TeamSpeakConnect {
  private teamspeak: TeamSpeak;
  constructor(private config: ConfigManager) {}

  public async init() {
    try {
      await this.config.fetch();
      await this.connect();
    } catch (e) {
      console.log('Error fetching configuration from database');
      process.exit();
    }
  }

  public async connect() {
    this.teamspeak = new TeamSpeak({
      host: process.env.TS_IP,
      protocol: process.env.TS_QUERY_PROTO === 'RAW' ? QueryProtocol.RAW : QueryProtocol.SSH,
      queryport: process.env.TS_QUERY_PORT ? +process.env.TS_QUERY_PORT : 10011,
      serverport: process.env.TS_VOICE_PORT ? +process.env.TS_VOICE_PORT : 9987,
      username: process.env.TS_QUERY_LOGIN,
      password: process.env.TS_QUERY_PASS,
      nickname: process.env.BOT_NAME,
    });

    this.teamspeak.on('ready', async () => {
      console.log('Connected to teamspeak server');
      await new EventsHandler(this.teamspeak, this.config).build();
      new IntervalsHandler(this.teamspeak, this.config);
      new CommandsHandler(this.teamspeak, this.config);
    });

    this.teamspeak.on('error', (e) => {
      console.log(e);
      process.exit();
    });
  }
}
