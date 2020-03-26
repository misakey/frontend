import React from 'react';
import PropTypes from 'prop-types';

import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import isNil from '@misakey/helpers/isNil';

import Typography from '@material-ui/core/Typography';

import { common } from '@misakey/ui/colors';

import laurel from './laurel.svg';


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  stepContainer: {
    flexGrow: 1,
    flexShrink: 0,
    flexBasis: '33%',
  },
  secondStepBlock: {
    height: 80,
    opacity: 0.9,
  },
  firstStepBlock: {
    height: 120,
    background: `url(${laurel}) center center no-repeat`,
    backgroundSize: '65%',
  },
  thirdStepBlock: {
    height: 55,
    opacity: 0.8,
  },
  stepBlock: ({ color }) => ({
    backgroundColor: color,
    borderRadius: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  }),
  stepTitle: {
    fontWeight: 'bold',
    fontSize: '1.2rem',
    textAlign: 'center',

    [theme.breakpoints.down('xs')]: {
      fontSize: '1.1rem',
    },
  },
  stepSubtitle: {
    textAlign: 'center',
  },
  stepScore: ({ color }) => ({
    color,
    fontSize: '1.4rem',
    marginRight: theme.spacing(1),

    [theme.breakpoints.down('xs')]: {
      fontSize: '1.3rem',
    },
  }),
}));

const Podium = ({ color, unit, first, second, third }) => {
  const classes = useStyles({ color });

  const hasSecond = !isNil(second.score);
  const hasThird = !isNil(third.score);
  return (
    <div className={classes.root}>
      <div className={classes.stepContainer}>
        <div>
          {(hasSecond) ? (
            <>
              <Typography className={classes.stepTitle}>
                <span className={classes.stepScore}>
                  {second.score}
                </span>
                {unit}
              </Typography>
              <Typography className={classes.stepSubtitle}>
                {second.value}
              </Typography>
            </>
          ) : null}
        </div>
        <div className={clsx(classes.secondStepBlock, classes.stepBlock)}>
          <Typography variant="h3">
            2
          </Typography>
        </div>
      </div>
      <div className={classes.stepContainer}>
        <div>
          <Typography className={classes.stepTitle}>
            <span className={classes.stepScore}>
              {first.score}
            </span>
            {unit}
          </Typography>
          <Typography className={classes.stepSubtitle}>
            {first.value}
          </Typography>
        </div>
        <div className={clsx(classes.firstStepBlock, classes.stepBlock)}>
          <Typography variant="h3">
            1
          </Typography>
        </div>
      </div>
      <div className={classes.stepContainer}>
        <div>
          {hasThird ? (
            <>
              <Typography className={classes.stepTitle}>
                <span className={classes.stepScore}>
                  {third.score}
                </span>
                {unit}
              </Typography>
              <Typography className={classes.stepSubtitle}>
                {third.value}
              </Typography>
            </>
          ) : null}
        </div>
        <div className={clsx(classes.thirdStepBlock, classes.stepBlock)}>
          <Typography variant="h3">
            3
          </Typography>
        </div>
      </div>
    </div>
  );
};

Podium.propTypes = {
  color: PropTypes.string,
  unit: PropTypes.string.isRequired,
  first: PropTypes.shape({ score: PropTypes.number, value: PropTypes.string }).isRequired,
  second: PropTypes.shape({ score: PropTypes.number, value: PropTypes.string }),
  third: PropTypes.shape({ score: PropTypes.number, value: PropTypes.string }),
};

Podium.defaultProps = {
  color: common.misakey,
  second: {},
  third: {},
};

export default Podium;
