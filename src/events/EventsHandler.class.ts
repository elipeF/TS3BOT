import { TeamSpeak, TeamSpeakClient } from 'ts3-nodejs-library';
import emiter from '../config/ConfigEmitter.class';
import { ConfigManager } from '../config/ConfigManager.class';
import * as EventsList from './EventsList';
import { CLIENT_CONNECT, CLIENT_IN_CHANNEL, CLIENT_MOVED } from './invokers';

interface EventProps {
  name: string;
  enabled: boolean;
  exec: {
    fnc: (ts: TeamSpeak, conf: Object, event: TeamSpeakClient) => {};
    invokers: string[];
  };
  channels: number[];
}

export class EventsHandler {
  events: EventProps[] = [];

  constructor(private ts: TeamSpeak, private config: ConfigManager) {
    for (const event in EventsList) {
      const getConf = this.config.get(event);
      if (getConf) {
        this.events.push({
          name: event,
          enabled: getConf.enabled,
          exec: EventsList[event],
          channels: getConf.config
            .map((e: any) => e.channel)
            .reduce((acc, val) => acc.concat(val === undefined ? undefined : +val), []),
        });
      }
    }
    console.log(this.events)
    this.subscriber();
  }

  public async build() {
    const clients = await this.ts.clientList({ clientType: 0 });
    for (const client of clients) {
      this.handle({ client }, CLIENT_IN_CHANNEL);
    }
  }

  private subscriber() {
    this.ts.on('clientmoved', (e) => this.handle(e, CLIENT_MOVED));
    this.ts.on('clientconnect', (e) => this.handle(e, CLIENT_CONNECT));
    emiter.on('updateEvents', (e) => this.update(e));
  }

  private handle({ client }: { client: TeamSpeakClient }, type) {
    const events = this.events.filter(
      (el) => el.enabled &&
        (el.channels[0] === undefined ? true : el.channels.includes(+client.cid)) &&
        el.exec.invokers.includes(type)
    );
    
    for(const event of events) {
      const config = this.config.get(event.name);
      if (config) {
        event.exec.fnc(this.ts, config.config, client);
      }
    }

  }

  private async update(name: string) {
    const event = this.events.find((el) => el.name === name);
    await this.config.update(name);
    const newConf = this.config.get(name);
    if (event && newConf) {
      const { config, type, ...rest } = newConf;
      const newEvents = this.events.map((el) => {
        if (el.name === name) {
          return {
            ...event,
            ...rest,
            channels: config
              .map((e: any) => e.channel)
              .reduce((acc, val) => acc.concat(val), []),
          };
        } else {
          return el;
        }
      });
      this.events = newEvents;
    }
  }
}
