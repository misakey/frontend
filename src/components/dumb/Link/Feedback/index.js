import React from 'react';
import omit from '@misakey/helpers/omit';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import RatingSchema from 'store/schemas/Rating';

import isNil from '@misakey/helpers/isNil';

import withMyFeedback from 'components/smart/withMyFeedback';
import withDialogConnect from 'components/smart/Dialog/Connect/with';

import MUILink from '@material-ui/core/Link';

// CONSTANTS
const OMIT_PROPS = ['userId'];

// COMPONENTS
const FeedbackLink = ({
  rating,
  children,
  ...rest
}) => {
  if (!isNil(rating)) {
    return null;
  }

  return (
    <MUILink
      component={Link}
      {...omit(rest, OMIT_PROPS)}
    >
      {children}
    </MUILink>
  );
};

FeedbackLink.propTypes = {
  rating: PropTypes.shape(RatingSchema.propTypes),
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
  onClick: PropTypes.func.isRequired,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

FeedbackLink.defaultProps = {
  rating: null,
};

export default withMyFeedback()(withDialogConnect(FeedbackLink));
