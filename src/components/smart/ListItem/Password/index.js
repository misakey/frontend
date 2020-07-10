import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';

import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import withDialogPasswordCreate from 'components/smart/Dialog/Password/Create/with';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// COMPONENTS
const ListItemWithPasswordCreate = withDialogPasswordCreate(ListItem);

const ListItemPassword = ({ classes, hasPassword, to, t, ...props }) => {
  const linkProps = useMemo(
    () => (isNil(to)
      ? { disabled: true }
      : {
        to,
        component: Link,
      }),
    [to],
  );

  if (!hasPassword) {
    return (
      <ListItemWithPasswordCreate
        classes={{ container: classes.container }}
        aria-label={t('fields:password.action')}
        {...omitTranslationProps(props)}
      >
        <ListItemIcon className={classes.icon}>
          <Typography>{t('fields:password.label')}</Typography>
        </ListItemIcon>
        <ListItemText primary={t('fields:password.none')} />
        <ChevronRightIcon className={classes.actionIcon} />
      </ListItemWithPasswordCreate>
    );
  }

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
  hasPassword: PropTypes.bool,
  to: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemPassword.defaultProps = {
  classes: {},
  hasPassword: false,
  to: null,
};

export default withTranslation('fields')(ListItemPassword);
