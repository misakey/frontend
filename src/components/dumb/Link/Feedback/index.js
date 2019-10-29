import React from 'react';
import omit from '@misakey/helpers/omit';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import withMyFeedback from 'components/smart/withMyFeedback';
import RatingSchema from 'store/schemas/Rating';

import isNil from '@misakey/helpers/isNil';

import MUILink from '@material-ui/core/Link';

// CONSTANTS
const OMIT_PROPS = ['userId'];

// COMPONENTS
const FeedbackLink = ({
  isAuthenticated,
  rating,
  children,
  onClick,
  to,
  ...rest
}) => {
  if (!isNil(rating)) {
    return null;
  }
  if (isAuthenticated) {
    return (
      <MUILink component={Link} to={to} {...omit(rest, OMIT_PROPS)}>
        {children}
      </MUILink>
    );
  }

  return (
    <MUILink onClick={onClick} component="button" {...omit(rest, OMIT_PROPS)}>
      {children}
    </MUILink>
  );
};

FeedbackLink.propTypes = {
  isAuthenticated: PropTypes.bool,
  rating: PropTypes.shape(RatingSchema.propTypes),
  children: PropTypes.oneOfType([PropTypes.elementType, PropTypes.object]).isRequired,
  onClick: PropTypes.func.isRequired,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

FeedbackLink.defaultProps = {
  isAuthenticated: false,
  rating: null,
};

export default withMyFeedback()(FeedbackLink);
