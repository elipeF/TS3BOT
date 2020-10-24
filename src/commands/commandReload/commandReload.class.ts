import { TeamSpeak, TeamSpeakClient } from 'ts3-nodejs-library';
import emiter from '../../config/ConfigEmitter.class';
import { ConfigManager } from '../../config/ConfigManager.class';
import CommandClass, { WITHOUT_OPTIONS, WITH_OPTIONS } from '../command.class';

class commandReload extends CommandClass {
  constructor(private ts: TeamSpeak, private config: ConfigManager) {
    super();
  }

  public async exec(params, invoker: TeamSpeakClient) {
    if (params && invoker) {
      const name = params.join(' ').trim();
      const config = this.config.get(name);
      if (config) {
        switch (config.type) {
          case 'event': {
            return emiter.emit('updateEvents', name);
          }
          case 'interval': {
            return emiter.emit('updateIntervals', name);
          }
          case 'command': {
            return emiter.emit('updateCommands', name);
          }
          default: {
            return;
          }
        }
        // if (config)
      }
    }
    return;
  }
}

export default { type: WITHOUT_OPTIONS, fnc: commandReload };
