import { useMemo, useCallback } from 'react';
import noop from '@misakey/core/helpers/noop';
import { isFirefox, isDesktopDevice } from '@misakey/core/helpers/devices';

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

  return {
    ...linkProps,
    onClick: linkOnClick,
  };
};
