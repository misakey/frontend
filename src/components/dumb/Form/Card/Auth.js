import React from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import CardAuth from 'components/dumb/Card/Auth';

const FormCardAuth = ({
  children, primary, secondary, subtitle, title,
  subtitleProps, titleProps,
  ...rest
}) => {
  const theme = useTheme();
  const padded = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Form>
      <CardAuth
        title={title}
        subtitle={subtitle}
        primary={primary}
        secondary={secondary}
        subtitleProps={subtitleProps}
        titleProps={titleProps}
        padded={padded}
        formik
        {...rest}
      >
        {children}
      </CardAuth>
    </Form>
  );
};

FormCardAuth.propTypes = {
  primary: PropTypes.oneOfType([PropTypes.node, PropTypes.object]).isRequired,
  secondary: PropTypes.oneOfType([PropTypes.node, PropTypes.object]),
  children: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  title: PropTypes.node,
  subtitleProps: PropTypes.object,
  titleProps: PropTypes.object,
};

FormCardAuth.defaultProps = {
  subtitle: null,
  title: null,
  secondary: null,
  subtitleProps: { align: 'center' },
  titleProps: { align: 'center', gutterBottom: true },
};

export default FormCardAuth;
