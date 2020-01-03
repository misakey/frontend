import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import * as numeral from 'numeral';
import { generatePath, Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import useWidth from '@misakey/hooks/useWidth';
import ApplicationSchema from 'store/schemas/Application';

import routes from 'routes';

import omit from '@misakey/helpers/omit';
import displayIn from '@misakey/helpers/displayIn';
import { redirectToApp } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

import { makeStyles } from '@material-ui/core/styles';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Rating from '@material-ui/lab/Rating';
import Skeleton from '@material-ui/lab/Skeleton';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';

import ContactButton from 'components/smart/ContactButton';
import ApplicationImg from 'components/dumb/Application/Img';
import FeedbackLink from 'components/dumb/Link/Feedback';
import GroupTitles from 'components/dumb/Typography/GroupTitles';

// CONSTANTS
const SMALL_BREAKPOINTS = ['xs', 'sm'];
const AVATAR_SIZE = { sm: 75, md: 100 };
const MORE_MENU_ID = 'application-more-menu';

// HOOKS
const useStyles = makeStyles((theme) => ({
  flexGrow: {
    flexGrow: 1,
  },
  flexWrap: {
    flexWrap: 'wrap',
    overflow: 'hidden',
    [theme.breakpoints.up('sm')]: {
      flexWrap: 'nowrap',
    },
  },
  avatar: {
    borderRadius: 5,
    width: AVATAR_SIZE.sm,
    height: AVATAR_SIZE.sm,
    marginRight: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      width: AVATAR_SIZE.md,
      height: AVATAR_SIZE.md,
      marginRight: theme.spacing(4),
    },
  },
  letterAvatar: {
    color: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[200],
  },
  subtitle: {
    textAlign: 'justify',
  },
  boxButtons: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    [theme.breakpoints.down('xs')]: {
      marginTop: theme.spacing(2),
    },
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'column',
      justifyContent: 'space-around',
      width: 160,
      marginLeft: theme.spacing(4),
    },
  },
  button: {
    [theme.breakpoints.up('sm')]: {
      width: 160,
    },
  },
  buttonFill: {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      flexGrow: 1,
      marginRight: theme.spacing(2),
    },
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
  application,
  isLoading,
  onContributionDpoEmailClick,
  readOnly,
  t,
  wasContacted,
  ...rest
}) {
  const classes = useStyles();
  const width = useWidth();
  const {
    dpoEmail,
    homepage,
    id,
    logoUri,
    name,
    mainDomain,
    avgRating,
    totalRating,
    published,
  } = application;

  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const moreMenuOpen = useMemo(
    () => !isNil(moreMenuAnchorEl),
    [moreMenuAnchorEl],
  );
  const onMoreMenuClick = useCallback(
    (event) => { setMoreMenuAnchorEl(event.currentTarget); },
    [setMoreMenuAnchorEl],
  );

  const onMoreMenuClose = useCallback(
    () => { setMoreMenuAnchorEl(null); },
    [setMoreMenuAnchorEl],
  );

  const mailtoDpoHref = useMemo(
    () => `mailto:${dpoEmail}`,
    [dpoEmail],
  );

  const dpoClaimRoute = useMemo(
    () => generatePath(routes.dpo.service._, { mainDomain }),
    [mainDomain],
  );

  const onDpoClaimClick = useCallback(
    () => {
      onMoreMenuClose();
      redirectToApp(dpoClaimRoute);
    },
    [onMoreMenuClose, dpoClaimRoute],
  );

  const dpoClaimProps = useMemo(
    () => (IS_PLUGIN
      ? {
        onClick: onDpoClaimClick,
      } : {
        to: dpoClaimRoute,
        onClick: onMoreMenuClose,
        component: Link,
      }
    ),
    [dpoClaimRoute, onDpoClaimClick, onMoreMenuClose],
  );

  // @FIXME: Uncomment when admin claim is updated
  // const adminClaimRoute = useMemo(
  //   () => generatePath(routes.admin.service.claim._, { mainDomain }),
  //   [mainDomain],
  // );

  // const onAdminClaimClick = useCallback(
  //   () => {
  //     onMoreMenuClose();
  //     redirectToApp(adminClaimRoute);
  //   },
  //   [onMoreMenuClose, adminClaimRoute],
  // );

  // const adminClaimProps = useMemo(
  //   () => (IS_PLUGIN
  //     ? {
  //       onClick: onAdminClaimClick,
  //     } : {
  //       to: adminClaimRoute,
  //       onClick: onMoreMenuClose,
  //       component: Link,
  //     }),
  //   [adminClaimRoute, onAdminClaimClick, onMoreMenuClose],
  // );

  const addFeedbackRoute = useMemo(
    () => generatePath(routes.citizen.application.feedback.me, { mainDomain }),
    [mainDomain],
  );

  const avgRatingText = useMemo(
    () => (totalRating === 0 || isNil(avgRating) ? t('common:ratingEmpty') : numeral(avgRating).format('0.0')),
    [totalRating, avgRating, t],
  );

  const feedbackApp = useMemo(() => ({ id, mainDomain }), [id, mainDomain]);
  const applicationName = useMemo(() => (name || mainDomain), [name, mainDomain]);

  return (
    <Box component="header" {...omit(rest, ['tReady', 'i18n'])}>
      <Box display="flex" className={classes.flexWrap}>
        <Box display="flex" flexWrap="nowrap" alignItems="center" className={classes.flexGrow}>
          <ApplicationImg
            applicationName={applicationName}
            component="a"
            target="_blank"
            rel="noopener noreferrer"
            href={homepage}
            fontSize="large"
            src={!isEmpty(logoUri) ? logoUri : undefined}
            className={clsx(classes.avatar, { [classes.letterAvatar]: isEmpty(logoUri) })}
          />
          <Box>
            {isLoading ? <OnLoading width={width} /> : (
              <GroupTitles
                title={applicationName}
                subtitle={mainDomain}
                subtitleProps={{ className: classes.subtitle }}
              />
            )}
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
            {feedbackApp.id && !readOnly && published && (
              <FeedbackLink
                application={feedbackApp}
                to={addFeedbackRoute}
                variant="subtitle1"
                color="secondary"
                className={classes.rateLink}
              />
            )}
          </Box>
        </Box>
        {(!readOnly && !isLoading) && (
          <Box className={classes.boxButtons}>
            {(
              <ContactButton
                dpoEmail={dpoEmail}
                onContributionClick={onContributionDpoEmailClick}
                applicationID={id}
                mainDomain={mainDomain}
                contactedView={wasContacted}
                className={clsx(classes.button, classes.buttonFill)}
              />
            )}
            {/* @FIXME create a generic menu button */}
            <Button
              variant="outlined"
              color="secondary"
              aria-controls={MORE_MENU_ID}
              aria-haspopup="true"
              onClick={onMoreMenuClick}
              className={classes.button}
            >
              {t('common:more')}
              <ArrowDropDownIcon />
            </Button>
            <Menu
              id={MORE_MENU_ID}
              anchorEl={moreMenuAnchorEl}
              keepMounted
              open={moreMenuOpen}
              onClose={onMoreMenuClose}
            >
              {published && (
                // @FIXME: Ensure dpo claim is updated
                <MenuItem
                  {...dpoClaimProps}
                >
                  {t('common:claim.dpo')}
                </MenuItem>
              )}
              {/* @FIXME: Uncomment when admin claim is updated */}
              {/* <MenuItem
                {...adminClaimProps}
              >
                {t('common:claim.admin')}
              </MenuItem> */}
              <MenuItem
                component="a"
                onClick={onMoreMenuClose}
                href="mailto:question.perso@misakey.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('common:report')}
              </MenuItem>
              {!isEmpty(dpoEmail) && (
                <MenuItem
                  component="a"
                  onClick={onMoreMenuClose}
                  href={mailtoDpoHref}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('common:contact.mailto')}
                </MenuItem>
              )}
            </Menu>
          </Box>
        )}
      </Box>
    </Box>
  );
}

ApplicationHeader.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  className: PropTypes.string,
  isLoading: PropTypes.bool,
  t: PropTypes.func.isRequired,
  wasContacted: PropTypes.bool,
  onContributionDpoEmailClick: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
};

ApplicationHeader.defaultProps = {
  application: {},
  className: '',
  isLoading: false,
  wasContacted: false,
  readOnly: false,
};

export default withTranslation(['common', 'screens'])(ApplicationHeader);
