import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';

import makeStyles from '@material-ui/core/styles/makeStyles';


// HOOKS
const useStyles = makeStyles((theme) => ({
  boldSpan: {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

// COMMPONENTS
const EventBoxMessagePreview = ({ isFromCurrentUser, displayName, text }) => {
  const classes = useStyles();

  const i18nKey = useMemo(
    () => `boxes:list.events.preview.message.${isFromCurrentUser ? 'you' : 'they'}`,
    [isFromCurrentUser],
  );

  const values = useMemo(
    () => ({ displayName, text }),
    [displayName, text],
  );

  return (
    <Trans i18nKey={i18nKey} values={values}>
      <span className={classes.boldSpan}>Vous</span>
      {text}
    </Trans>
  );
};

EventBoxMessagePreview.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  displayName: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
};

EventBoxMessagePreview.defaultProps = {
  isFromCurrentUser: false,

};

export default withTranslation('boxes')(EventBoxMessagePreview);
