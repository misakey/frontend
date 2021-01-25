import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';

import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// COMPONENTS
const ListItemPassword = ({ classes, to, t, ...props }) => {
  const linkProps = useMemo(
    () => (isNil(to)
      ? { disabled: true }
      : {
        to,
        component: Link,
      }),
    [to],
  );

  return (
    <ListItem
      classes={{ container: classes.container }}
      aria-label={t('fields:password.action')}
      {...linkProps}
      {...omitTranslationProps(props)}
    >
      <ListItemIcon className={classes.icon}>
        <Typography>{t('fields:password.label')}</Typography>
      </ListItemIcon>
      <ListItemText primary={t('fields:password.placeholder')} />
      <ChevronRightIcon className={classes.actionIcon} />
    </ListItem>
  );
};

ListItemPassword.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
    icon: PropTypes.string,
    actionIcon: PropTypes.string,
  }),
  to: TO_PROP_TYPE,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemPassword.defaultProps = {
  classes: {},
  to: null,
};

export default withTranslation('fields')(ListItemPassword);
