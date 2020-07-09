import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/auth/store/reducers/sso';


import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import AvatarClient from '@misakey/ui/Avatar/Client';
import Title from '@misakey/ui/Typography/Title';


// HOOKS
const useStyles = makeStyles((theme) => ({
  appBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  appImg: {
    borderRadius: 5,
  },
  appName: {
    marginLeft: theme.spacing(1),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}));

const AvatarClientSso = ({ client, className, ...rest }) => {
  const classes = useStyles();

  const { name, logoUri } = useMemo(
    () => client || {},
    [client],
  );

  return (
    <Box className={clsx(className, classes.appBlock)} {...rest}>
      <AvatarClient
        classes={{ root: classes.appImg }}
        src={logoUri}
        name={name}
      />
      <div className={classes.appName}>
        <Title noWrap>{name}</Title>
      </div>

    </Box>
  );
};

AvatarClientSso.propTypes = {
  className: PropTypes.string,
  client: SSO_PROP_TYPES.client.isRequired,
};

AvatarClientSso.defaultProps = {
  className: '',
};

export default AvatarClientSso;
