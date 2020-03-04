import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Card from 'components/dumb/Card';
import MuiList from '@material-ui/core/List';

const useStyles = makeStyles(() => ({
  maxWidth: {
    width: '100%',
  },
}));


const CardProfileList = ({ children }) => {
  const classes = useStyles();

  return (
    <Card
      className={classes.maxWidth}
    >
      <MuiList
        disablePadding
        className={classes.maxWidth}
      >
        { children }
      </MuiList>
    </Card>
  );
};

CardProfileList.propTypes = {
  children: PropTypes.node.isRequired,
};

export default CardProfileList;
