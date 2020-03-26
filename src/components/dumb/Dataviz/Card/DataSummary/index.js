import React from 'react';

import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Card from 'components/dumb/Card';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
  card: {
    minWidth: 150,
    borderRadius: theme.spacing(1),
    margin: theme.spacing(1),
  },
  title: ({ color }) => ({
    color,
    fontWeight: 'bold',
    fontSize: '1.5rem',
    textAlign: 'center',
  }),
  subtitle: {
    fontWeight: 'bold',
    fontSize: '1.3rem',
    textAlign: 'center',
  },
}));

const DatumSummaryCard = ({ title, subtitle, color }) => {
  const classes = useStyles({ color });

  return (
    <Card className={classes.card}>
      <Typography className={classes.title}>
        { title }
      </Typography>
      <Typography className={classes.subtitle}>
        { subtitle }
      </Typography>
    </Card>
  );
};

DatumSummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
};

export default DatumSummaryCard;
