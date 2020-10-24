import { TeamSpeak } from 'ts3-nodejs-library';
import emiter from '../config/ConfigEmitter.class';
import { ConfigManager } from '../config/ConfigManager.class';
import * as IntervalsList from './IntervalsList';

interface IntervalProps {
  name: string;
  timer: number;
  enabled: boolean;
  exec: (ts: TeamSpeak, conf: Object, callback) => {};
}

export class IntervalsHandler {
  intervals: IntervalProps[] = [];
  constructor(private ts: TeamSpeak, private config: ConfigManager) {
    emiter.on('updateIntervals', (e) => this.update(e));
    for (const interval in IntervalsList) {
      const conf = this.config.get(interval);
      if (conf) {
        this.intervals.push({
          name: interval,
          enabled: conf.enabled,
          timer: conf.config.find((e: any) => e.interval)?.interval,
          exec: IntervalsList[interval],
        });
        if (conf.enabled) {
          this.execute(interval);
        }
      }
    }
  }

  execute(name: string) {
    const interval = this.intervals.find(
      (el) => el.name === name && el.enabled,
    );
    if (interval) {
      const config = this.config.get(name);
      if (config) {
        interval.exec(this.ts, config , () =>
          setTimeout(() => this.execute(interval.name), interval.timer * 1000),
        );
      }
    }
  }

  async update(name: string) {
    const interval = this.intervals.find((el) => el.name === name);
    await this.config.update(name);
    const newConf = this.config.get(name);
    if (interval && newConf) {
      const { config } = newConf;
      const newIntervals = this.intervals.map((el) => {
        if (el.name === name) {
          return {
            ...interval,
            enabled: newConf.enabled,
            timer: config.find((e: any) => e.interval)?.interval,
          };
        } else {
          return el;
        }
      });
      this.intervals = newIntervals;
      if (newConf.enabled) {
        this.execute(name);
      }
    }
  }
}
