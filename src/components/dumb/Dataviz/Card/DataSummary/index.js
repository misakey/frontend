import React from 'react';

import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Card from 'components/dumb/Card';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import Icon from '@material-ui/core/Icon';

const useStyles = makeStyles((theme) => ({
  card: {
    margin: theme.spacing(1),
    display: 'flex',
    color: theme.palette.common.white,
    background: 'none',
    border: 'none',
    alignItems: 'center',
  },
  icon: {
    margin: theme.spacing(1),
    fontSize: '36px !important',
  },
  title: {
    fontWeight: 'bold',
  },
}));

const DatumSummaryCard = ({ title, subtitle, icon, small }) => {
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      {/* We use here a font icon because html2canvas don't support SVGs */}
      <Icon className={classes.icon}>{icon}</Icon>
      <Box display="flex" flexDirection="column">
        <Typography variant={small ? 'h6' : 'h5'} className={classes.title}>
          { title }
        </Typography>
        <Typography>
          { subtitle }
        </Typography>
      </Box>


    </Card>
  );
};

DatumSummaryCard.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  icon: PropTypes.string,
  small: PropTypes.bool,
};

DatumSummaryCard.defaultProps = {
  icon: 'info',
  small: false,
};

export default DatumSummaryCard;
