import { TeamSpeak } from 'ts3-nodejs-library';
import { strRepleace } from '../../utils';

let lastValue = 0;

const doServerEdit = async (ts: TeamSpeak, {config}, done) => {
  
  const value = config[0].names[lastValue];
  const serverInfo = await ts.serverInfo();

  const props = {
    online: serverInfo.virtualserverClientsonline - serverInfo.virtualserverQueryclientsonline,
    slots: serverInfo.virtualserverMaxclients,
    get percent() { return Math.round(this.online / this.slots * 100)}
  }

  await ts.serverEdit({
    virtualserverName: strRepleace(value, props)})


  lastValue = config[0].names[lastValue + 1] ? lastValue + 1 : 0;

  return done();
};

export default doServerEdit;
  