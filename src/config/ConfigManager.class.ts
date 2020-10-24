import { ConfigModel } from '../db/config/config.schema';
import { IConfigDocument } from '../db/config/config.types';

export class ConfigManager {
  private config;

  async fetch() {
    const configFromDb = await ConfigModel.find({});
    this.config = configFromDb;
  }

  async update(name: string) {
    const configFromDb = await ConfigModel.findOne({ name });
    if (configFromDb) {
      const { enabled, config } = configFromDb;
      const newConf = this.config.map((el) => {
        if (el.name === name) {
          return Object.assign(
            {},
            { name: el.name, type: el.type },
            {
              enabled,
              config,
            },
          );
        } else {
          return el;
        }
      });
      this.config = newConf;
    }
    return this.config;
  }

  get(key: string): IConfigDocument | undefined {
    return this.config.find((el) => el.name === key);
  }
}
