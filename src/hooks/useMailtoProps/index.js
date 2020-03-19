import { useMemo, useCallback } from 'react';
import { IS_PLUGIN } from 'constants/plugin';
import { openMailto } from '@misakey/helpers/plugin';
import noop from '@misakey/helpers/noop';
import { isFirefox, isDesktopDevice } from '@misakey/helpers/devices';

const isFirefoxDesktop = isFirefox && isDesktopDevice;

// HOOKS
export default (mailto, onClick = noop) => {
  const linkProps = useMemo(
    () => ({
      component: 'a',
      target: '_blank',
      rel: 'noopener noreferrer',
      href: mailto,
    }),
    [mailto],
  );

  const pluginOnClick = useCallback(
    (e) => Promise.all([
      onClick(e),
      openMailto(mailto),
    ]),
    [mailto, onClick],
  );

  const linkOnClick = useCallback(
    (event) => {
      if (isFirefoxDesktop) {
        event.preventDefault();
        return Promise.resolve(onClick(event)).then((onClickReturn) => {
          window.open(mailto, 'mail', 'noopener,noreferrer');
          return onClickReturn;
        });
      }
      return Promise.resolve(onClick(event));
    },
    [onClick, mailto],
  );

  if (IS_PLUGIN) {
    return {
      onClick: pluginOnClick,
    };
  }
  return {
    ...linkProps,
    onClick: linkOnClick,
  };
};
