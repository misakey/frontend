import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';

import { LIFECYCLE } from 'constants/app/boxes/events';

import makeStyles from '@material-ui/core/styles/makeStyles';


// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 1),
    marginBottom: theme.spacing(1),
    alignSelf: 'center',
  },
  boldSpan: {
    fontWeight: theme.typography.fontWeightBold,
  },

}));


// COMPONENTS
const EventBoxInformationPreview = ({ displayName, isFromCurrentUser, content, type }) => {
  const classes = useStyles();

  const author = useMemo(
    () => (isFromCurrentUser ? 'you' : 'they'),
    [isFromCurrentUser],
  );

  const { state } = useMemo(
    () => content || {},
    [content],
  );

  const i18nKey = useMemo(
    () => (type === LIFECYCLE
      ? `boxes:read.events.information.preview.lifecycle.${state}.${author}`
      : `boxes:read.events.information.preview.${type}.${author}`),
    [state, author, type],
  );

  const values = useMemo(
    () => ({ displayName, ...content }),
    [displayName, content],
  );

  return (
    <Trans i18nKey={i18nKey} values={values}>
      <span className={classes.boldSpan}>Vous</span>
      preview
    </Trans>

  );
};

EventBoxInformationPreview.propTypes = {
  isFromCurrentUser: PropTypes.bool,
  displayName: PropTypes.string.isRequired,
  content: PropTypes.object,
  type: PropTypes.string.isRequired,
};

EventBoxInformationPreview.defaultProps = {
  isFromCurrentUser: false,
  content: {},
};

export default withTranslation('boxes')(EventBoxInformationPreview);
