import mergeDeepLeft from '@misakey/helpers/mergeDeepLeft';

import {
  getChannels,
} from '../HttpApi';

export class ContextStore {
  constructor(ownerId) {
    this.channelsPublicInfo = {};
    this.ownerId = ownerId;
  }

  // for now we have only one channel per data type
  // (the "initial channel")
  // but in the future we will have several,
  // each corresponding to a time window.
  // This will make store logic a bit more complex.
  async getChannelPublicInfo(datatype) {
    let channelPublicInfo = this.channelsPublicInfo[datatype];
    if (channelPublicInfo) {
      return channelPublicInfo;
    }

    // refresh channels public info
    const retrievedPublicInfo = await getChannels(this.ownerId);
    // server returns a list of channels,
    // but internaly we organize them in a mapping datatype => channel
    // @FIXME maybe we should just use a list as well?
    // one day it's going to be stored in a local SQL DB
    // so performance is not a problem.
    retrievedPublicInfo.forEach((channel) => {
      const dt = channel.datatype;
      this.channelsPublicInfo[dt] = mergeDeepLeft(
        this.channelsPublicInfo[dt] || {},
        channel,
      );
    });

    // retrying ...
    channelPublicInfo = this.channelsPublicInfo[datatype];
    if (channelPublicInfo) {
      return channelPublicInfo;
    }

    // ...giving up
    throw Error(`no channel found for datatype ${datatype}`);
  }

  getChannelSecretKey(datatype) {
    if (!(datatype in this.secrets.channelKeys)) {
      throw Error(`no channels were created for data type ${datatype}`);
    }
    const channelSecretKey = this.secrets.channelKeys[datatype].initialChannel.secretKey;
    if (!channelSecretKey) {
      throw Error(`missing secret key for initial channel of data type ${datatype}`);
    }
    return channelSecretKey;
  }
}
