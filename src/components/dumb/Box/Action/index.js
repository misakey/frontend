import React from 'react';
import PropTypes from 'prop-types';

import pick from '@misakey/helpers/pick';

import Button from '@material-ui/core/Button';

import Screen from 'components/dumb/Screen';
import Title from 'components/dumb/Typography/Title';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

// CONSTANTS
const SCREEN_PROPS = [
  'appBarProps',
  'description',
  'splashScreen',
  'preventSplashScreen',
  'hideAppBar',
];

// HELPERS
const pickScreenProps = pick(SCREEN_PROPS);

const BoxAction = ({ buttonProps, actions, title, ...rest }) => {
  // @FIXME use a better way to pass down only screen props
  const screenProps = pickScreenProps(rest);

  return (
    <Screen
      className="boxAction"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      {...screenProps}
    >
      <Container maxWidth="md">
        <Title align="center">{title}</Title>
        <Box mt={2} display="flex" justifyContent="center">
          {actions.map(({ onClick, buttonText }) => (
            <Box mx={1} key={buttonText}>
              <Button {...buttonProps} onClick={onClick}>
                {buttonText}
              </Button>
            </Box>
          ))}
        </Box>
      </Container>
    </Screen>
  );
};

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
