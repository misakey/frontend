import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Subtitle from '@misakey/ui/Typography/Subtitle';
import MuiCardHeader from '@material-ui/core/CardHeader';

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardHeaderRoot: {
    padding: theme.spacing(0),
  },
}));

// COMPONENTS
const CardHeader = ({ title, titleTypographyProps, ...rest }) => {
  const classes = useStyles();

  return (
    <MuiCardHeader
      classes={{ root: classes.cardHeaderRoot }}
      disableTypography
      title={(
        <Subtitle variant="subtitle2" color="textSecondary" {...titleTypographyProps}>{title}</Subtitle>
    )}
      {...rest}
    />
  );
};

CardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  titleTypographyProps: PropTypes.object,
};

CardHeader.defaultProps = {
  titleTypographyProps: {},
};

export default CardHeader;
