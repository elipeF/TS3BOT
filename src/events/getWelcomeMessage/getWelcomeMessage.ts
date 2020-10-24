import { TeamSpeak, TeamSpeakClient } from 'ts3-nodejs-library';
import { ConfigManager } from '../../config/ConfigManager.class';
import { strRepleace } from '../../utils';
import { CLIENT_CONNECT } from '../invokers';

const invokers = [CLIENT_CONNECT];

const getWelcomeMessage = async (
  ts: TeamSpeak,
  conf,
  client: TeamSpeakClient,
) => {

  const serverInfo = await ts.serverInfo();
  const clientInfo = await ts.clientInfo(client.clid)

  const props = {
    nickname: clientInfo[0].clientNickname,
    unique: clientInfo[0].clientUniqueIdentifier,
    platform: clientInfo[0].clientPlatform,
    totalConnections: clientInfo[0].clientTotalconnections,
    firstConnect: new Date(clientInfo[0].clientCreated * 1000).toLocaleString(),
    online: serverInfo.virtualserverClientsonline - serverInfo.virtualserverQueryclientsonline,
    slots: serverInfo.virtualserverMaxclients
  } 

  for(const message of conf[0].message) {
    ts.sendTextMessage(client.clid, 1, strRepleace(message, props));
  }
};

export default { fnc: getWelcomeMessage, invokers };
 