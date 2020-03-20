import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import numbro from 'numbro';

import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import routes from 'routes';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import MUILink from '@material-ui/core/Link';
import RatingScore from 'components/dumb/Rating/Score';
import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardContentRoot: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  ratingIconFilled: {
    color: theme.palette.secondary.main,
  },
  scoreBlock: {
    display: 'flex',
    alignItems: 'flex-end',
  },
  halfBlock: {
    flex: '1',
  },
}));

// COMPONENTS
const SummaryFeedbackCard = ({ application, hideLink, hideTitle, t }) => {
  const { mainDomain, avgRating, totalRating, distrRating } = useMemo(
    () => (isNil(application) ? {} : application),
    [application],
  );

  const actualAvgRating = useMemo(
    () => (totalRating === 0 || isNil(avgRating)
      ? t('common:emptyRating')
      : numbro(avgRating).format({ mantissa: 1 })),
    [totalRating, avgRating, t],
  );

  const classes = useStyles();

  const linkTo = useMemo(
    () => generatePath(routes.citizen.application.feedback.others, { mainDomain }),
    [mainDomain],
  );

  const title = useMemo(
    () => (hideTitle ? null : t('citizen:application.info.feedback.all')),
    [hideTitle, t],
  );

  const displayLink = useMemo(
    () => !hideLink && totalRating !== 0,
    [hideLink, totalRating],
  );

  return (
    <Box>
      {(!hideTitle || !hideLink) && (
        <CardHeader
          title={title}
          action={displayLink ? (
            <MUILink
              component={Link}
              to={linkTo}
              color="secondary"
              variant="h6"
              underline="none"
            >
              {t('common:see')}
            </MUILink>
          ) : null}
        />
      )}
      <CardContent className={classes.cardContentRoot}>
        <Box mr={1} className={clsx(classes.scoreBlock, classes.halfBlock)}>
          <Box mr={1}>
            <Typography variant="h1" color="textPrimary" noWrap>
              {actualAvgRating}
            </Typography>
          </Box>
          <Box mr={2}>
            <Typography variant="h6" color="textPrimary" noWrap>
              {t('common:on')}
              {' 5'}
            </Typography>
          </Box>
          <Box ml="auto">
            <Typography variant="subtitle1" color="textPrimary" noWrap>
              {t('citizen:application.info.feedback.ratingCount', { count: totalRating })}
            </Typography>
          </Box>
        </Box>
        <RatingScore
          className={classes.halfBlock}
          distrRating={distrRating}
          totalRating={totalRating}
        />
      </CardContent>
    </Box>
  );
};

SummaryFeedbackCard.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
  hideLink: PropTypes.bool,
  hideTitle: PropTypes.bool,
};

SummaryFeedbackCard.defaultProps = {
  application: null,
  hideLink: false,
  hideTitle: false,
};

export default withTranslation('common', 'citizen')(SummaryFeedbackCard);
