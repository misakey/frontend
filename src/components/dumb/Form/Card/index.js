import React from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from 'components/dumb/Card';

const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    maxWidth: 500,
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
  },
}));


const FormCard = ({
  children, primary, secondary, subtitle, title,
}) => {
  const classes = useStyles();

  return (
    <Form>
      <Card
        title={title}
        subtitle={subtitle}
        primary={primary}
        secondary={secondary}
        className={classes.card}
        subtitleProps={{ align: 'center' }}
        titleProps={{ align: 'center', gutterBottom: true }}
      >
        {children}
      </Card>
    </Form>
  );
};

FormCard.propTypes = {
  primary: PropTypes.oneOf([PropTypes.node, PropTypes.object]).isRequired,
  secondary: PropTypes.oneOf([PropTypes.node, PropTypes.object]),
  children: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  title: PropTypes.node,
};

FormCard.defaultProps = {
  subtitle: null,
  title: null,
  secondary: null,
};

export default FormCard;
