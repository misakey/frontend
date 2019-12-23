import React from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  card: {
    width: '100%',
    maxWidth: 500,
    [theme.breakpoints.up('sm')]: {
      padding: theme.spacing(3),
    },
  },
  title: {
    marginBottom: theme.spacing(2),
  },
  subTitle: {
    marginBottom: theme.spacing(2),
  },
}));

const FormCardTitle = (props) => {
  const classes = useStyles();

  const { children } = props;
  if (!children) { return null; }

  return <Typography className={classes.title} {...props} />;
};

FormCardTitle.propTypes = {
  align: PropTypes.string,
  children: PropTypes.node,
  component: PropTypes.string,
  variant: PropTypes.string,
};

FormCardTitle.defaultProps = {
  align: 'center',
  children: null,
  component: 'h3',
  variant: 'h4',
};

const FormCardSubTitle = (props) => {
  const classes = useStyles();

  const { children } = props;
  if (!children) { return null; }

  return <Typography className={classes.subTitle} {...props} />;
};

FormCardSubTitle.propTypes = {
  align: PropTypes.string,
  children: PropTypes.node,
  color: PropTypes.string,
  variant: PropTypes.string,
};

FormCardSubTitle.defaultProps = {
  align: 'center',
  children: null,
  color: 'textSecondary',
  variant: 'body2',
};

const FormCard = ({
  children, actions, subtitle, title,
}) => {
  const classes = useStyles();

  return (
    <Form>
      <Card className={classes.card}>
        <CardContent>
          <FormCardTitle>
            {title}
          </FormCardTitle>
          <FormCardSubTitle>
            {subtitle}
          </FormCardSubTitle>
          {children}
        </CardContent>
        <CardActions>
          {actions}
        </CardActions>
      </Card>
    </Form>
  );
};

FormCard.propTypes = {
  actions: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  title: PropTypes.node,
};

FormCard.defaultProps = {
  subtitle: null,
  title: null,
};

export default FormCard;
