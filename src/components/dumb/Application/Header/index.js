import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import useWidth from '@misakey/hooks/useWidth';
import ApplicationSchema from 'store/schemas/Application';

import displayIn from '@misakey/helpers/displayIn';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Rating from '@material-ui/lab/Rating';
import Skeleton from '@material-ui/lab/Skeleton';

import ContactButton from 'components/smart/ContactButton';
import ApplicationImg from 'components/dumb/Application/Img';
import Container from '@material-ui/core/Container';
import { withUserManager } from '@misakey/auth/components/OidcProvider';

import './index.scss';

// CONSTANTS
const DISPLAY_RATING = false;

const SMALL_BREAKPOINTS = ['xs', 'sm'];
const spacing = 3;
const avatarSize = { sm: 75, md: 100 };

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 0),
  },
  grid: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  avatar: {
    borderRadius: 5,
    width: avatarSize.sm,
    height: avatarSize.sm,
    marginTop: 5,
    [theme.breakpoints.up('md')]: {
      width: avatarSize.md,
      height: avatarSize.md,
    },
  },
  letterAvatar: {
    color: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[200],
  },
  titles: {
    width: `calc(100% - ${avatarSize.sm}px - ${theme.spacing(spacing)}px - 2px)`,
    [theme.breakpoints.up('sm')]: {
      minWidth: 300,
      width: 'auto',
    },
  },
  nameTitle: {
    overflow: 'hidden',
  },
  divider: {
    margin: theme.spacing(1, 0),
    backgroundColor: theme.palette.grey[200],
  },
  ratingIcon: {
    color: theme.palette.primary.main,
  },
  rateLink: {
    marginLeft: theme.spacing(1),
  },
}));

const useIsSmall = (width) => useMemo(
  () => displayIn(width, SMALL_BREAKPOINTS),
  [width],
);

// COMPONENTS
function OnLoading({ width }) {
  const isSmall = useIsSmall(width);

  return (
    <>
      <Skeleton
        variant="text"
        style={{ margin: 0 }}
        height={isSmall ? 31 : 39}
      />
      <Skeleton variant="text" />
      <Skeleton variant="text" style={{ marginBottom: 0 }} />
    </>
  );
}

OnLoading.propTypes = {
  width: PropTypes.number.isRequired,
};

function ApplicationHeader({
  auth,
  className,
  dpoEmail,
  homepage,
  id,
  isAuthenticated,
  isLoading,
  logoUri,
  name,
  mainDomain,
  rating,
  ratingCount,
  shortDesc,
  t,
  userManager,
  wasContacted,
  onContributionDpoEmailClick,
}) {
  const classes = useStyles();
  const width = useWidth();
  const isSmall = useIsSmall(width);

  return (
    <Container maxWidth={false}>
      <header className={clsx(className, classes.root)}>
        <Grid container spacing={spacing} className={classes.grid} alignItems="center">
          <Grid item>
            <ApplicationImg
              alt={name}
              component="a"
              target="_blank"
              href={homepage}
              fontSize="large"
              src={!isEmpty(logoUri) ? logoUri : undefined}
              className={clsx(classes.avatar, { [classes.letterAvatar]: isEmpty(logoUri) })}
            >
              {name.slice(0, 3)}
            </ApplicationImg>
          </Grid>
          <Grid item className={classes.titles}>
            {isLoading ? <OnLoading width={width} /> : (
              <>
                <Typography
                  variant={isSmall ? 'h5' : 'h4'}
                  className={classes.nameTitle}
                >
                  {name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {shortDesc}
                </Typography>
                <Typography>
                  {isAuthenticated && dpoEmail && (
                    <MUILink href={`mailto:${dpoEmail}`}>
                      {dpoEmail}
                    </MUILink>
                  )}
                  {!isAuthenticated && !window.env.PLUGIN && (
                    <MUILink onClick={() => userManager.signinRedirect()} component="button">
                      {t('screens:application.info.emailSignIn')}
                    </MUILink>
                  )}
                </Typography>
              </>
            )}
            {DISPLAY_RATING && (
              <>
                <Divider className={classes.divider} />
                <Grid container spacing={1} alignItems="center" wrap="nowrap">
                  <Grid item>
                    <Typography color="primary" variant="h5">{rating}</Typography>
                  </Grid>
                  <Grid item>
                    <Rating
                      readOnly
                      size="large"
                      value={rating}
                      classes={{ iconFilled: classes.ratingIcon }}
                    />
                  </Grid>
                </Grid>
                <Typography color="textSecondary" variant="subtitle1">
                  {t('screens:application.info.ratingCount', { count: ratingCount })}
                  <MUILink component={Link} to="#" className={classes.rateLink}>
                    {t('screens:application.info.rate')}
                  </MUILink>
                </Typography>
              </>
            )}
          </Grid>
          {(isAuthenticated) && (
            <Grid item>
              <ContactButton
                idToken={auth.id}
                dpoEmail={dpoEmail}
                applicationID={id}
                mainDomain={mainDomain}
                contactedView={wasContacted}
              />
              {!dpoEmail && (
                <Button
                  onClick={onContributionDpoEmailClick}
                  variant="outlined"
                  color="secondary"
                >
                  {t('screens:application.info.userContribution.dpoEmailOpenDialog')}
                </Button>
              )}
            </Grid>
          )}
        </Grid>
      </header>
    </Container>
  );
}

ApplicationHeader.propTypes = {
  ...ApplicationSchema.propTypes,
  auth: PropTypes.shape({ id: PropTypes.string }).isRequired,
  className: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isLoading: PropTypes.bool,
  location: PropTypes.shape({ pathname: PropTypes.string, search: PropTypes.string }).isRequired,
  rating: PropTypes.number,
  ratingCount: PropTypes.number,
  t: PropTypes.func.isRequired,
  userManager: PropTypes.object.isRequired,
  wasContacted: PropTypes.bool,
  onContributionDpoEmailClick: PropTypes.func.isRequired,
};

ApplicationHeader.defaultProps = {
  className: '',
  rating: 2.5,
  ratingCount: 0,
  isAuthenticated: false,
  isLoading: false,
  wasContacted: false,
};

export default connect(
  (state) => ({
    auth: state.auth,
    isAuthenticated: !!state.auth.token,
  }),
)(withRouter(withUserManager(withTranslation(['common', 'screens'])(ApplicationHeader))));
