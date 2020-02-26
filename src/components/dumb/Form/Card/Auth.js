import React from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Card from 'components/dumb/Card';

const useStyles = makeStyles(() => ({
  card: {
    maxWidth: 500,
  },
}));


const FormCardAuth = ({
  children, primary, secondary, subtitle, title,
  subtitleProps, titleProps,
  ...rest
}) => {
  const classes = useStyles();

  const theme = useTheme();
  const padded = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <Form>
      <Card
        title={title}
        subtitle={subtitle}
        primary={primary}
        secondary={secondary}
        className={classes.card}
        subtitleProps={subtitleProps}
        titleProps={titleProps}
        padded={padded}
        formik
        {...rest}
      >
        {children}
      </Card>
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
