import { TeamSpeak } from 'ts3-nodejs-library';
import { strRepleace } from '../../utils';

const doNicknameCheck = async (ts: TeamSpeak, {config}, done) => {
  const users = await ts.clientList({clientType: 0});
  const badWords = config[0].badWords;
  
  for(const user of users) {
    for(const badWord of badWords) {
      if(user.nickname.toLocaleLowerCase().includes(badWord.toLocaleLowerCase())) {
        try {
          return await ts.clientKick(user.clid, 5, strRepleace(config[0].message,{badword: badWord}))
        } catch(e) {

        }
      }
    }
  }
  return done();
};

export default doNicknameCheck;
 