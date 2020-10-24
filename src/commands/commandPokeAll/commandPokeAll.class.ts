import { TeamSpeak, TeamSpeakClient } from 'ts3-nodejs-library';
import { ConfigManager } from '../../config/ConfigManager.class';
import { strRepleace } from '../../utils';
import CommandClass, { WITHOUT_OPTIONS, WITH_OPTIONS } from '../command.class';

class commandPokeAll extends CommandClass {
  constructor(private ts: TeamSpeak, private config: ConfigManager) {
    super();
  }

  public async exec(params: string[], invoker: TeamSpeakClient) {
    if (params.length > 0) {
      const clients = await this.ts.clientList({clientType: 0});
      let counter = 0;
      for(const client of clients) {
        await this.ts.clientPoke(client.clid, params.join(' '));
        counter++;
      }
      return this.ts.sendTextMessage(invoker.clid, 1, strRepleace(this.config.get('commandPokeAll')?.config[0].message, {counter}));
    }
  }
}

export default { type: WITHOUT_OPTIONS, fnc: commandPokeAll };
