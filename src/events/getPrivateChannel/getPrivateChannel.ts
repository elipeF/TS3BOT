import { TeamSpeak, TeamSpeakClient } from 'ts3-nodejs-library';
import { ConfigManager } from '../../config/ConfigManager.class';
import { PrivateChannelsModel, PRIVATE_CHANNEL_FREE, PRIVATE_CHANNEL_TAKEN } from '../../db/privatechannels/privatechannels.schema';
import { IPrivateChannelsDocument } from '../../db/privatechannels/privatechannels.types';
import { strRepleace } from '../../utils';
import { CLIENT_CONNECT, CLIENT_IN_CHANNEL, CLIENT_MOVED } from '../invokers';

const invokers = [CLIENT_CONNECT, CLIENT_MOVED, CLIENT_IN_CHANNEL];

const getPrivateChannel = async (
  ts: TeamSpeak,
  conf: ConfigManager,
  client: TeamSpeakClient,
) => {
  const config = conf[0];

  const usersChannel = await PrivateChannelsModel.findOne({owner: +client.databaseId});
  

  if(usersChannel) {
    try {
      await ts.channelInfo(usersChannel.cid + '');
      return await ts.clientMove(client.cid, usersChannel.cid + '');
    } catch(e) {
      await PrivateChannelsModel.deleteOne({_id: usersChannel._id})
    } 
  }

  const zone = await ts.channelList({pid: config.zone});
  const channelNumber = zone.length + 1;
  let fromDb = false;

  const freeChannel = await PrivateChannelsModel.findOne({status: PRIVATE_CHANNEL_FREE});
  let channelCid;
  if(freeChannel) {
    let found = false
    let channel: null | IPrivateChannelsDocument = null;
    do {
      channel = channel ?? freeChannel;
      try {
        await ts.channelInfo(channel.cid + '');
        channelCid = channel.cid;
        found = true;
        fromDb = true;
      } catch(e) {
        await PrivateChannelsModel.deleteOne({_id: channel._id});
        const nextChannel = await PrivateChannelsModel.findOne({status: PRIVATE_CHANNEL_FREE}); 
        if(nextChannel) {
          channel = nextChannel
        } else {
          found = true;
        }
      }
    } while(!found)
  }

  if(!channelCid) {
    const rootChannel = await ts.channelCreate(
      strRepleace(config.prefix, {number: channelNumber}) + strRepleace(config.channelName, {username: client.nickname}),{
      cpid: config.zone, channel_maxclients: -1,
      channel_maxfamilyclients: 0,
      channel_flag_maxclients_unlimited: 1,
      channel_flag_maxfamilyclients_unlimited: 1,
      channel_flag_maxfamilyclients_inherited: 0,
      channel_flag_permanent: 1
  });
  channelCid = +rootChannel.cid;
}

  for(let i = 1; i <= config.subchannelscount; i++) {
    await ts.channelCreate(
      strRepleace(config.subchannelsname, {number: i}),{
      cpid: channelCid,
      channel_maxclients: -1,
      channel_maxfamilyclients: 0,
      channel_flag_maxclients_unlimited: 1,
      channel_flag_maxfamilyclients_unlimited: 1,
      channel_flag_maxfamilyclients_inherited: 0,
      channel_flag_permanent: 1
  });
  }

  const validity = new Date();
  validity.setDate(validity.getDate() + config.validity);

  if(fromDb) {
    await PrivateChannelsModel.updateOne({cid: channelCid}, {owner: +client.databaseId, status: PRIVATE_CHANNEL_TAKEN, validTo: validity.getTime()})
  } else {
    await new PrivateChannelsModel({cid: channelCid, owner: +client.databaseId, status: PRIVATE_CHANNEL_TAKEN, validTo: validity.getTime()}).save();
  }

  return await ts.clientMove(client.cid, channelCid + '');

};

export default { fnc: getPrivateChannel, invokers };
