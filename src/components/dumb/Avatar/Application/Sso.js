import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
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
    marginLeft: theme.spacing(1),
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  mainDomain: {
    marginRight: theme.spacing(1),
  },
  ratingIcon: {
    color: theme.palette.primary.main,
  },
}));

const ApplicationAvatarSso = ({ sso, t, className, typographyProps, ...rest }) => {
  const classes = useStyles();

  const { clientName, logoUri } = useMemo(
    () => sso || {},
    [sso],
  );

  const alt = useMemo(
    () => t('components:application.logoAlt', { brand: clientName }),
    [clientName, t],
  );

  return (
    <Box className={clsx(className, classes.appBlock)} {...omitTranslationProps(rest)}>
      <ApplicationAvatar
        classes={{ root: classes.appImg }}
        src={logoUri}
        name={clientName}
        alt={alt}
      />
      <div className={classes.appName}>
        <Typography noWrap color="textSecondary" {...typographyProps}>
          {clientName}
        </Typography>
      </div>

    </Box>
  );
};

ApplicationAvatarSso.propTypes = {
  className: PropTypes.string,
  sso: PropTypes.shape({
    clientName: PropTypes.string.isRequired,
    logoUri: PropTypes.string.isRequired,
  }),
  t: PropTypes.func.isRequired,
  typographyProps: PropTypes.object,
};

ApplicationAvatarSso.defaultProps = {
  className: '',
  sso: null,
  typographyProps: {},
};

export default withTranslation('components')(ApplicationAvatarSso);
