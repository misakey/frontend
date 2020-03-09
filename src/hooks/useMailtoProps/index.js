import { useMemo, useCallback } from 'react';
import { IS_PLUGIN } from 'constants/plugin';
import { openMailto } from '@misakey/helpers/plugin';
import noop from '@misakey/helpers/noop';

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
    (e) => Promise.resolve(
      onClick(e),
    ),
    [onClick],
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
