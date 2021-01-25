import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import SimpleCard from 'components/dumb/Card/Simple';
import ListItemText from '@material-ui/core/ListItemText';
import ButtonFromObjectOrNode from 'components/dumb/Button/ObjectOrNode';


const useStyles = makeStyles((theme) => ({
  typography: {
    padding: theme.spacing(1, 0),
  },
  buttonGroup: {
    [theme.breakpoints.up('sm')]: {
      '& > *:not(:last-child)': {
        marginRight: theme.spacing(0.5),
      },
      '& > *:not(:first-child)': {
        marginLeft: theme.spacing(0.5),
      },
    },
    [theme.breakpoints.down('xs')]: {
      justifyContent: 'space-between',
    },
  },
}));

const CardSimpleDoubleTextDoubleButton = ({
  primaryText, secondaryText, primary, secondary, ...rest
}) => {
  const classes = useStyles();
  return (
    <SimpleCard
      classes={{ buttonGroup: classes.buttonGroup }}
      button={(
        <>
          <ButtonFromObjectOrNode button={secondary} />
          <ButtonFromObjectOrNode button={primary} />
        </>
      )}
      {...rest}
    >
      <ListItemText
        primary={primaryText}
        secondary={secondaryText}
      />
    </SimpleCard>
  );
};

CardSimpleDoubleTextDoubleButton.propTypes = {
  primaryText: PropTypes.string,
  secondaryText: PropTypes.string,
  primary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  secondary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

CardSimpleDoubleTextDoubleButton.defaultProps = {
  primaryText: '',
  secondaryText: '',
  primary: null,
  secondary: null,
};

export default CardSimpleDoubleTextDoubleButton;
