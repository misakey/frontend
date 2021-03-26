import React, { useRef, useEffect, useMemo } from 'react';

import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import EventCard from 'components/dumb/Card/Event';
import Box from '@material-ui/core/Box';
import Skeleton from '@material-ui/lab/Skeleton';

// CONSTANTS
export const INNER_SPACING = 12;

// COMPONENTS
const MessageRowSkeleton = ({
  index, style, setSize,
}) => {
  const rowRoot = useRef(null);
  const { t } = useTranslation(['boxes', 'common']);

  const author = useMemo(
    () => ({ displayName: t('boxes:notifications.byIdentity.displayName'), avatarUrl: 'https://static.misakey.com/ssoClientsLogo/misakey.png' }),
    [t],
  );

  useEffect(
    () => {
      if (rowRoot.current && setSize) {
        setSize(index, rowRoot.current.offsetHeight);
      }
    },
    [index, setSize],
  );

  return (
    <div style={style}>
      <Box display="flex" flexDirection="column" ref={rowRoot}>
        <EventCard
          author={author}
          date={<Skeleton width={20} />}
          text={<Skeleton width="80%" />}
          index={index}
        />
      </Box>
    </div>
  );
};

MessageRowSkeleton.propTypes = {
  setSize: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
};


export default MessageRowSkeleton;
