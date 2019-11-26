import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import './Action.scss';

const BoxAction = ({ buttonProps, actions, title }) => (
  <div id="BoxAction">
    <Typography variant="h5" component="h3" align="center" color="textSecondary">
      {title}
    </Typography>
    <div className="flexBox">
      {actions.map(({ onClick, buttonText }) => (
        <Button className="action" {...buttonProps} onClick={onClick} key={buttonText}>
          {buttonText}
        </Button>
      ))}
    </div>
  </div>
);

BoxAction.propTypes = {
  buttonProps: PropTypes.shape({ label: PropTypes.isRequired }),
  title: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      buttonText: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
    }),
  ),
};

BoxAction.defaultProps = {
  buttonProps: { color: 'secondary', variant: 'contained' },
  actions: [],
};

export default BoxAction;
