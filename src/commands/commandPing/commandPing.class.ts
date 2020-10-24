import { TeamSpeak, TeamSpeakClient } from 'ts3-nodejs-library';
import { ConfigManager } from '../../config/ConfigManager.class';
import CommandClass, { WITHOUT_OPTIONS, WITH_OPTIONS } from '../command.class';

class commandPing extends CommandClass {
  constructor(private ts: TeamSpeak, private config: ConfigManager) {
    super();
  }

  public async exec(params, invoker: TeamSpeakClient) {
    if (params && invoker) {
      this.ts.sendTextMessage(invoker.clid, 1, 'Pong');
    }
  }
}

export default { type: WITHOUT_OPTIONS, fnc: commandPing };
