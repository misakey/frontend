/* global browser */ // eslint-disable-line no-redeclare
import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import * as numeral from 'numeral';
import { generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import useWidth from '@misakey/hooks/useWidth';
import ApplicationSchema from 'store/schemas/Application';

import routes from 'routes';

import displayIn from '@misakey/helpers/displayIn';

import { makeStyles } from '@material-ui/core/styles';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';

import Typography from '@material-ui/core/Typography';
import MUILink from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Rating from '@material-ui/lab/Rating';
import Skeleton from '@material-ui/lab/Skeleton';

import ContactButton from 'components/smart/ContactButton';
import ApplicationImg from 'components/dumb/Application/Img';
import FeedbackLink from 'components/dumb/Link/Feedback';

import Container from '@material-ui/core/Container';
import { withUserManager } from '@misakey/auth/components/OidcProvider';
import './index.scss';

// CONSTANTS
const SMALL_BREAKPOINTS = ['xs', 'sm'];
const SPACING = 3;
const AVATAR_SIZE = { sm: 75, md: 100 };

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(SPACING, 0),
  },
  grid: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  avatar: {
    borderRadius: 5,
    width: AVATAR_SIZE.sm,
    height: AVATAR_SIZE.sm,
    marginTop: 5,
    [theme.breakpoints.up('md')]: {
      width: AVATAR_SIZE.md,
      height: AVATAR_SIZE.md,
    },
  },
  letterAvatar: {
    color: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[200],
  },
  titles: {
    width: `calc(100% - ${AVATAR_SIZE.sm}px - ${theme.spacing(SPACING)}px - 2px)`,
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
  width: PropTypes.string.isRequired,
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
  avgRating,
  totalRating,
  shortDesc,
  t,
  userManager,
  wasContacted,
  onContributionDpoEmailClick,
}) {
  const classes = useStyles();
  const width = useWidth();

  const addFeedbackRoute = useMemo(
    () => generatePath(routes.citizen.application.feedback.me, { mainDomain }),
    [mainDomain],
  );

  const avgRatingText = useMemo(
    () => (totalRating === 0 || isNil(avgRating) ? t('common:ratingEmpty') : numeral(avgRating).format('0.0')),
    [totalRating, avgRating, t],
  );

  const signInRedirect = useCallback(() => {
    // @FIXME: remove when auth in plugin is implemented
    if (window.env.PLUGIN) {
      browser.tabs.create({
        url: `${window.env.APP_URL}/citizen/${mainDomain}`,
      });
    } else {
      userManager.signinRedirect();
    }
  }, [userManager, mainDomain]);

  const feedbackApp = useMemo(() => ({ id, mainDomain }), [id, mainDomain]);
  const applicationName = useMemo(() => (name || mainDomain), [name, mainDomain]);

  return (
    <Container maxWidth={false}>
      <header className={clsx(className, classes.root)}>
        <Grid container spacing={SPACING} className={classes.grid} alignItems="center">
          <Grid item>
            <ApplicationImg
              alt={applicationName}
              component="a"
              target="_blank"
              href={homepage}
              fontSize="large"
              src={!isEmpty(logoUri) ? logoUri : undefined}
              className={clsx(classes.avatar, { [classes.letterAvatar]: isEmpty(logoUri) })}
            >
              {applicationName.slice(0, 3)}
            </ApplicationImg>
          </Grid>
          <Grid item className={classes.titles}>
            {isLoading ? <OnLoading width={width} /> : (
              <>
                <Typography
                  variant={['xs', 'sm'].includes(width) ? 'h5' : 'h4'}
                  className={classes.nameTitle}
                >
                  {applicationName}
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {shortDesc}
                </Typography>
                <Typography>
                  {isAuthenticated && dpoEmail && (
                    <MUILink href={`mailto:${dpoEmail}`}>
                      {dpoEmail}
                    </MUILink>
                  )}
                  {isAuthenticated && !dpoEmail && (
                    <MUILink
                      onClick={onContributionDpoEmailClick}
                      className="lightLink"
                      component="button"
                    >
                      {t('screens:application.info.userContribution.dpoEmailOpenDialog')}
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
            <Divider className={classes.divider} />
            <Grid container spacing={1} alignItems="center" wrap="nowrap">
              <Grid item>
                <Typography color="primary" variant="h5">{avgRatingText}</Typography>
              </Grid>
              <Grid item>
                <Rating
                  readOnly
                  size="large"
                  value={avgRating}
                  classes={{ iconFilled: classes.ratingIcon }}
                />
              </Grid>
            </Grid>
            <Typography color="textSecondary" variant="subtitle1" display="inline">
              {t('screens:application.info.ratingCount', { count: totalRating })}
            </Typography>
            {feedbackApp.id && (
              <FeedbackLink
                application={feedbackApp}
                to={addFeedbackRoute}
                onClick={signInRedirect}
                variant="subtitle1"
                className={classes.rateLink}
              >
                {t('screens:application.info.rate')}
              </FeedbackLink>
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
  auth: PropTypes.shape({ id: PropTypes.string, profile: PropTypes.object }).isRequired,
  className: PropTypes.string,
  isAuthenticated: PropTypes.bool,
  isLoading: PropTypes.bool,
  t: PropTypes.func.isRequired,
  userManager: PropTypes.object.isRequired,
  wasContacted: PropTypes.bool,
  onContributionDpoEmailClick: PropTypes.func.isRequired,
};

ApplicationHeader.defaultProps = {
  className: '',
  isAuthenticated: false,
  isLoading: false,
  wasContacted: false,
};

export default withUserManager(withTranslation(['common', 'screens'])(ApplicationHeader));
