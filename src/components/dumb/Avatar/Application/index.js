import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import ApplicationImg from 'components/dumb/Application/Img';
import Typography from '@material-ui/core/Typography';
import Rating from '@material-ui/lab/Rating';

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
  ratingIcon: {
    color: theme.palette.primary.main,
  },
}));

const ApplicationAvatar = ({ application, t, displayRating }) => {
  const classes = useStyles();

  const { name, logoUri, mainDomain, avgRating } = useMemo(
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
      <div className={classes.appName}>
        <Typography noWrap color="textSecondary">
          {displayName}
        </Typography>
        {displayRating && (
          <Rating
            readOnly
            size="small"
            value={avgRating}
            classes={{ iconFilled: classes.ratingIcon }}
          />
        )}
      </div>

    </Box>
  );
};

ApplicationAvatar.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  displayRating: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

ApplicationAvatar.defaultProps = {
  application: null,
  displayRating: false,
};

export default withTranslation(['screens'])(ApplicationAvatar);
