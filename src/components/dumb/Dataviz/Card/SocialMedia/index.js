import React from 'react';

import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Card from 'components/dumb/Card';

const useStyles = makeStyles((theme) => ({
  card: ({ mainColor }) => ({
    margin: theme.spacing(2, 0),
    backgroundColor: mainColor,
    borderRadius: theme.spacing(2),
    border: 0,
    position: 'relative',

    '&:after': {
      content: '" "',
      display: 'block',
      paddingBottom: '100%',
    },
  }),
  content: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
}));

const SocialMediaCard = ({ mainColor, children, id }) => {
  const classes = useStyles({ mainColor });

  return (
    <Card className={classes.card} id={id}>
      <div className={classes.content}>
        {children}
      </div>
    </Card>
  );
};

SocialMediaCard.propTypes = {
  mainColor: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  id: PropTypes.string,
};

SocialMediaCard.defaultProps = {
  id: undefined,
};

export default SocialMediaCard;
