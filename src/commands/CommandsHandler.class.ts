import { TeamSpeak } from 'ts3-nodejs-library';
import { TextMessage } from 'ts3-nodejs-library/lib/types/Events';
import emiter from '../config/ConfigEmitter.class';
import { ConfigManager } from '../config/ConfigManager.class';
import { WITHOUT_OPTIONS } from './command.class';

import * as CommandsList from './CommandsList';

interface CommandProps {
  name: string;
  enabled: boolean;
  rights: number[];
  exec: any;
  type: string;
}

export class CommandsHandler {
  commands: CommandProps[] = [];

  constructor(private ts: TeamSpeak, private config: ConfigManager) {
    for (const command in CommandsList) {
      const config = this.config.get(command);
      if (config) {
        this.commands.push({
          name: command,
          enabled: config.enabled,
          rights: config.config 
            .map((e: any) => e.rights)
            .reduce((acc, val) => acc.concat(val), []),
          exec: new CommandsList[command].fnc(this.ts, this.config),
          type: CommandsList[command].type,
        });
      }
    }
    this.subscriber();
  }

  private subscriber() {
    this.ts.on('textmessage', (e) => this.handle(e));
    emiter.on('updateCommands', (e) => this.update(e));
  }

  private handle(e: TextMessage) {
    if (e.msg.charAt(0) === process.env.COMMAND_PREFIX) {
      const splitedCommand = e.msg.split(' ');
      const commandName = splitedCommand
        .shift()
        ?.replace(process.env.COMMAND_PREFIX, '');
      const command = this.commands.find(
        (e) =>
          e.name.toLocaleLowerCase().replace('command', '') ===
          commandName?.toLocaleLowerCase() && e.enabled,
      );
      if (command) {
        const canUse =
          e.invoker.servergroups.filter((value) =>
            command.rights.includes(+value),
          ).length > 0
            ? true
            : false;


        if (!canUse && e.invoker.uniqueIdentifier !== process.env.TS_QUERY_LOGIN) {
          return this.ts.sendTextMessage(
            e.invoker.clid,
            1,
            'No permission to use it',
          );
        }

        if (command.type === WITHOUT_OPTIONS) {
          command.exec.exec(splitedCommand, e.invoker);
        } else {
          const options: string[] = command.exec.getOptions(command.exec);
          const commandOption = splitedCommand.shift();
          if (commandOption && options.includes(commandOption)) {
            command.exec[commandOption](splitedCommand, e.invoker);
          } else {
            if (commandOption) {
              return this.ts.sendTextMessage(
                e.invoker.clid,
                1,
                `Option ${commandOption} for command ${commandName} not found`,
              );
            } else {
              return this.ts.sendTextMessage(
                e.invoker.clid,
                1,
                `Function ${commandName} needs option`,
              );
            }
          }
        }
      }
    }
  }

  private async update(name: string) {
    const command = this.commands.find((el) => el.name === name);
    await this.config.update(name);
    const newConf = this.config.get(name);
    if (command && newConf) {
      const { config, type, ...rest } = newConf;
      const newCommand = this.commands.map((el) => {
        if (el.name === name) {
          return {
            ...command,
            ...rest,
            rights: config
              .map((e: any) => e.rights)
              .reduce((acc, val) => acc.concat(val), []),
          };
        } else {
          return el;
        }
      });
      this.commands = newCommand;
    }
  }
}
