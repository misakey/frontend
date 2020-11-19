import log from '@misakey/helpers/log';

const isNotificationAPISupported = 'Notification' in window;
const areNotificationsAllowed = () => Notification.permission === 'granted';
const areNotificationsDenied = () => Notification.permission === 'denied';

const createNotification = (text, options) => new Notification(text, options);

export default (text, options) => {
  if (!isNotificationAPISupported) {
    log('Notification API not supported', 'warn');
    return null;
  }

  if (areNotificationsAllowed()) {
    return createNotification(text, options);
  }

  if (!areNotificationsDenied()) {
    return Notification.requestPermission()
      .then((permission) => {
        if (permission === 'granted') {
          return createNotification(text, options);
        }
        return null;
      });
  }

  return null;
};

