import { TeamSpeak, TeamSpeakClient } from 'ts3-nodejs-library';
import { ServerGroupClientEntry } from 'ts3-nodejs-library/lib/types/ResponseTypes';
import { arrIntersec } from '../../utils';
import { CLIENT_CONNECT, CLIENT_IN_CHANNEL, CLIENT_MOVED } from '../invokers';

const invokers = [CLIENT_CONNECT, CLIENT_MOVED, CLIENT_IN_CHANNEL];

const getAdminPoke = async (
  ts: TeamSpeak,
  conf,
  client: TeamSpeakClient,
) => {
  const configs = conf.filter(el => el.channel.includes(client.cid));
  for(const config of configs) {
     const channelMembers = await ts.clientList({cid: client.cid});
     const adminsInChannel = channelMembers.filter(el => arrIntersec<Number>(el.servergroups.map(el => +el), config.groups).length > 0);
     if(adminsInChannel.length > 0) return; 

     const admins = await Promise.all<ServerGroupClientEntry[]>(
       config.groups
       .map(async g => await ts.serverGroupClientList(g))
       );
     const adminsInfo = await Promise.all(
       admins
        .flat()
        .map(async el => await ts.getClientByUid(el.clientUniqueIdentifier))
       );
      const adminsOnline = adminsInfo.filter((el): el is TeamSpeakClient => el !== undefined);

     if(adminsOnline.length === 0) return ts.sendTextMessage(client.clid, 1, config.messageFail)

     for(const admin of adminsOnline) {
      await ts.clientPoke(admin.clid, config.poke)
     }

     return ts.sendTextMessage(client.clid, 1, config.messageSuccess)
  }
};

export default { fnc: getAdminPoke, invokers };
 