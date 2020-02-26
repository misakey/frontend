import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import omit from '@misakey/helpers/omit';
import Box from '@material-ui/core/Box';
import Title from 'components/dumb/Typography/Title';
import CardSimpleText from 'components/dumb/Card/Simple/Text';
import { WORKSPACES } from 'constants/workspaces';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  title: {
    display: 'flex',
    flexDirection: 'column',
  },
  catchphrase: {
    fontSize: `calc(${theme.typography.h5.fontSize} + 1px)`,
    fontWeight: 'bold',
  },
  disabled: {
    border: 'none',
    color: theme.palette.grey[400],
  },
}));

const OnboardingStep = ({ isActive, workspace, step, component, t, ...props }) => {
  const classes = useStyles();
  const stepProps = useMemo(
    () => (isActive
      ? omit(props, ['tReady'])
      : omit(props, ['secondary', 'primary', 'button', 'tReady'])),
    [isActive, props],
  );

  return (
    <Box
      className={clsx({ [classes.disabled]: !isActive })}
      my={1}
      key={step}
      component={component}
      text={t(`components__new:onboarding.${workspace}.steps.${step}.text`)}
      {...stepProps}
    />
  );
};

OnboardingStep.propTypes = {
  t: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  step: PropTypes.number.isRequired,
  component: PropTypes.func,
  workspace: PropTypes.oneOf(WORKSPACES).isRequired,
};

OnboardingStep.defaultProps = {
  isActive: false,
  component: CardSimpleText,
};

const OnboardingStepWithTranslation = withTranslation('components__new')(OnboardingStep);
export { OnboardingStepWithTranslation as OnboardingStep };

const Onboarding = ({ children, workspace }) => {
  const classes = useStyles();
  return (
    <Box my={5}>
      <Title className={classes.title}>
        <Trans i18nKey={`components__new:onboarding.${workspace}.title`}>
          <span className={classes.catchphrase}>A partir de maintenant,</span>
          <span>
            {'j\'habitue les sites à me renvoyer mes données à l\'abri des géants de la tech'}
          </span>
        </Trans>
      </Title>
      {children}
    </Box>
  );
};

Onboarding.propTypes = {
  children: PropTypes.node.isRequired,
  workspace: PropTypes.oneOf(WORKSPACES).isRequired,
};

export default withTranslation('components__new')(Onboarding);
