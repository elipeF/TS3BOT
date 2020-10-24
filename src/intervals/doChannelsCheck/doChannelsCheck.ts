import { TeamSpeak } from 'ts3-nodejs-library';
import { PrivateChannelsModel, PRIVATE_CHANNEL_FREE, PRIVATE_CHANNEL_TAKEN } from '../../db/privatechannels/privatechannels.schema';
import { strRepleace } from '../../utils';

const doChannelsCheck = async (ts: TeamSpeak, {config}, done) => {
  const conf = config[0]
  const channelsInZone = await ts.channelList({pid: conf.zone});
  let counter = 0;
  for(const channel of channelsInZone) {
    const query = await PrivateChannelsModel.findOne({cid: +channel.cid});
    counter++;
    const date = new Date();
    date.setDate(date.getDate() + conf.validity);
    if(query) {
      if(channel.secondsEmpty === -1) {    
        await PrivateChannelsModel.updateOne({_id: query.id}, {validTo: date.getTime() })
      } else {
        if(query.validTo <= new Date().getTime()) {
          const subChannels = await ts.channelList({pid: channel.cid});
          for(const subChannel of subChannels) {
            await subChannel.del(true)
          }
          const channelGroupsOfChannel = await ts.channelGroupClientList('', channel.cid)
          for(const channelGroup of channelGroupsOfChannel) {
            if(channelGroup.cgid !== conf.guest && channelGroup.cldbid) {
              await ts.setClientChannelGroup(conf.guest, channel.cid, channelGroup.cldbid);
            }
          }
          await channel.edit({channelName: strRepleace(conf.prefix, {number: counter}) + conf.freeChannelName})
          await PrivateChannelsModel.updateOne({_id: query.id}, {owner: 0, status: PRIVATE_CHANNEL_FREE})
          continue;
        }
      }
    } else {
      const group = await ts.getChannelGroupById(conf.group);
      let adminOfChannel;
      try {
        adminOfChannel = await group?.clientList(channel.cid);
      } catch(e) {
        //console.log(e)
      }
      const owner = adminOfChannel?.[0].cldbid ?? 0

      await new PrivateChannelsModel({cid: channel.cid, owner, status: owner ? PRIVATE_CHANNEL_TAKEN : PRIVATE_CHANNEL_FREE, validTo: date.getTime()}).save()

    }
    if(!channel.name.startsWith(strRepleace(conf.prefix, {number: counter}))) {
      let newName;
      if(/^\d/.test(channel.name)) {
        newName = counter + channel.name.replace(/^\d/, ''); 
      } else {
        newName = strRepleace(conf.prefix, {number: counter}) + channel.name;
      }
      await channel.edit({channelName: newName})
    }
  }
  done();
};

export default doChannelsCheck;
