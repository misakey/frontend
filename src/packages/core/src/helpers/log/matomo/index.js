/* eslint-disable no-undef */
import isNil from '../../isNil';
import log from '..';


export default ({ event = 'trackEvent', category, action, name = null, value = null }) => {
  if (isNil(category) || isNil(action)) {
    // log warn in dev mode before checking if _paq is defined as it's not defined in dev mode
    log('Missing required params for logWithMatomo', 'warn', 'development', true);
    return;
  }
  if (window.env.MATOMO.ENABLED && !isNil(_paq)) {
    const newLog = [event, category, action];
    if (!isNil(name)) {
      newLog.push(name);
    }
    if (!isNil(value)) {
      newLog.push(value);
    }
    _paq.push(newLog);
  }
};
