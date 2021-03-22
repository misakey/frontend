import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';

import IdentitySchema from '@misakey/react-auth/store/schemas/Identity';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ButtonAccount from '@misakey/react-auth/components/Button/Account';
import LinkAccountMisakey from '@misakey/react-auth/components/Link/Account/Misakey';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import AvatarDetailedSkeleton from '@misakey/ui/Avatar/Detailed/Skeleton';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarDetailedRoot: {
    margin: theme.spacing(1, 1),
    padding: theme.spacing(1, 0),
  },
  cardActionArea: {
    borderRadius: theme.shape.borderRadius,
    userSelect: 'text',
  },
}));

// COMPONENTS
const CardIdentityThumbnail = ({ identity, onClick, ...props }) => {
  const classes = useStyles();

  const hasIdentity = useMemo(
    () => !isNil(identity),
    [identity],
  );

  const handleClick = useCallback(
    (e) => {
      if (isFunction(onClick)) {
        onClick(e);
      }
    },
    [onClick],
  );

  const {
    displayName,
    avatarUrl,
    identifierValue,
  } = useSafeDestr(identity);

  return (
    <Box mx={4} mb={4}>
      <Card elevation={0}>
        <CardActionArea
          draggable="false"
          className={classes.cardActionArea}
          component={LinkAccountMisakey}
          onClick={handleClick}
        >
          {hasIdentity ? (
            <AvatarDetailed
              text={displayName}
              image={avatarUrl}
              title={displayName}
              subtitle={identifierValue}
              classes={{ root: classes.avatarDetailedRoot }}
              {...props}
            />
          ) : (
            <AvatarDetailedSkeleton
              title={displayName}
              {...props}
            />
          )}
        </CardActionArea>
        <ButtonAccount
          component={LinkAccountMisakey}
          standing={BUTTON_STANDINGS.MAIN}
          onClick={handleClick}
        />
      </Card>
    </Box>
  );
};

CardIdentityThumbnail.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  onClick: PropTypes.func,
};

CardIdentityThumbnail.defaultProps = {
  identity: null,
  onClick: null,
};

export default CardIdentityThumbnail;
