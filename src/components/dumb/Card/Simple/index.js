import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

import { MIN_CARD_HEIGHT } from '@misakey/ui/constants/sizes';

import Card from 'components/dumb/Card';

// CONSTANTS
export const X_SPACING = 2;
export const Y_SPACING = 1;

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: theme.spacing(Y_SPACING, X_SPACING),
    alignItems: 'center',
    flexWrap: 'wrap',
    [theme.breakpoints.down('xs')]: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    boxSizing: 'border-box',
    minHeight: MIN_CARD_HEIGHT,
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'center',
      width: '100%',
    },
  },
}));

// COMPONENTS
const CardSimple = ({ classes, children, button, className, ...rest }) => {
  const internalClasses = useStyles();

  return (
    <Card className={clsx(className, internalClasses.root)} {...rest}>
      <div className={classes.content}>
        {children}
      </div>
      <div className={clsx(internalClasses.buttonGroup, classes.buttonGroup)}>
        {button}
      </div>
    </Card>
  );
};

CardSimple.propTypes = {
  classes: PropTypes.shape({
    content: PropTypes.string,
    buttonGroup: PropTypes.string,
  }),
  children: PropTypes.node.isRequired,
  button: PropTypes.node,
  className: PropTypes.string,
};

CardSimple.defaultProps = {
  classes: {
    content: '',
    buttonGroup: '',
  },
  button: null,
  className: '',
};

export default CardSimple;
