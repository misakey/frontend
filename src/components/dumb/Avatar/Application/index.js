import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ApplicationImg from 'components/dumb/Application/Img';
import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  toolbar: {
    justifyContent: 'space-between',
  },
  appBlock: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  appImg: {
    borderRadius: 5,
  },
  appName: {
    marginLeft: theme.spacing(2),
  },
}));

const ApplicationAvatar = ({ application, t }) => {
  const classes = useStyles();

  const { name, logoUri, mainDomain } = useMemo(
    () => (isNil(application) ? {} : application),
    [application],
  );

  const displayName = useMemo(
    () => name || mainDomain,
    [name, mainDomain],
  );


  return (
    <Box className={classes.appBlock}>
      <ApplicationImg
        classes={{ root: classes.appImg }}
        src={logoUri}
        alt={t('screens:application.info.logoAlt', { mainDomain: displayName })}
      >
        {/* @FIXME: this fallback behaviour should be handled inside ApplicationImg */}
        {displayName.slice(0, 3)}
      </ApplicationImg>
      <Typography noWrap color="textSecondary" className={classes.appName}>
        {displayName}
      </Typography>
    </Box>
  );
};

ApplicationAvatar.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
};

ApplicationAvatar.defaultProps = {
  application: null,
};

export default withTranslation(['screens'])(ApplicationAvatar);
