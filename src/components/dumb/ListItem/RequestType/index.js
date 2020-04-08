import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import REQUEST_TYPES, { UNKNOWN } from 'constants/databox/type';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isFunction from '@misakey/helpers/isFunction';

import makeStyles from '@material-ui/core/styles/makeStyles';

import RequestTypeAvatar from 'components/dumb/Avatar/RequestType';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemLeftPadded: {
    paddingLeft: theme.spacing(3),
  },
}));

// COMPONENTS
const ListItemRequestType = ({ type, t, disableLeftPadding, onClick, ...rest }) => {
  const classes = useStyles();

  const title = useMemo(
    () => {
      if (type === UNKNOWN) {
        return t('citizen:requests.read.type.placeholder');
      }
      return t(`citizen:contact.email.subject.value.${type}`);
    },
    [t, type],
  );

  const onItemClick = useCallback(
    (e) => {
      if (isFunction(onClick)) {
        onClick(e, type);
      }
    },
    [onClick, type],
  );

  return (
    <ListItem
      className={clsx({ [classes.listItemLeftPadded]: !disableLeftPadding })}
      onClick={onItemClick}
      {...omitTranslationProps(rest)}
    >
      <ListItemAvatar>
        <RequestTypeAvatar type={type} />
      </ListItemAvatar>
      <ListItemText primary={title} />
    </ListItem>
  );
};

ListItemRequestType.propTypes = {
  type: PropTypes.oneOf(REQUEST_TYPES).isRequired,
  disableLeftPadding: PropTypes.bool,
  onClick: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemRequestType.defaultProps = {
  disableLeftPadding: false,
  onClick: null,
};

export default withTranslation('citizen')(ListItemRequestType);
