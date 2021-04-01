import { useCallback, useRef, useEffect } from 'react';

import { useTranslation } from 'react-i18next';
import { MSG_FILE, MSG_TXT } from '@misakey/ui/constants/boxes/events';
import browserNotify from '@misakey/core/helpers/browserNotify';
import { isTabVisible } from '@misakey/core/helpers/visibilityChange';

export default () => {
  const { t } = useTranslation('boxes');
  const tRef = useRef(t);

  useEffect(
    () => {
      tRef.current = t;
    },
    [tRef, t],
  );

  return useCallback(
    (event, boxTitle) => {
      const { type, sender } = event;
      const { displayName } = sender;
      if (!isTabVisible()) {
        const isMessageFile = type === MSG_FILE;
        if (isMessageFile || type === MSG_TXT) {
          return browserNotify(
            `${boxTitle || tRef.current('boxes:notifications.browser.events.defaultTile')}`,
            {
              badge: '/favicon.ico',
              icon: '/favicon.ico',
              body: tRef.current(`boxes:notifications.browser.events.body.${isMessageFile ? 'file' : 'text'}`, { displayName }),
            },
          );
        }
        return null;
      }
      return null;
    },
    [tRef],
  );
};
