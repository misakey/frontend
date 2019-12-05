import React, { useMemo } from 'react';
import omit from '@misakey/helpers/omit';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import RatingSchema from 'store/schemas/Rating';

import isNil from '@misakey/helpers/isNil';

import withMyFeedback from 'components/smart/withMyFeedback';
import withDialogConnect from 'components/smart/Dialog/Connect/with';

import MUILink from '@material-ui/core/Link';

// CONSTANTS
const OMIT_PROPS = ['userId', 'tReady'];

// COMPONENTS
const FeedbackLink = ({
  rating,
  children,
  isFetchingRating,
  t,
  ...rest
}) => {
  const translationKey = useMemo(() => (!isNil(rating) ? 'edit' : 'give'), [rating]);

  if (isFetchingRating) {
    return null;
  }

  return (
    <MUILink
      component={Link}
      {...omit(rest, OMIT_PROPS)}
    >
      {t(`common:feedback.${translationKey}`)}
      {children}
    </MUILink>
  );
};

FeedbackLink.propTypes = {
  rating: PropTypes.shape(RatingSchema.propTypes),
  isFetchingRating: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]),
  onClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

FeedbackLink.defaultProps = {
  rating: null,
  children: null,
  isFetchingRating: false,
};

export default withTranslation(['common'])(withMyFeedback()(withDialogConnect(FeedbackLink)));
