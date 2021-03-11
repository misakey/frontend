import React, { useMemo, useContext, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { TO_PROP_TYPE } from '@misakey/ui/constants/propTypes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { UserManagerContext } from '@misakey/react-auth/components/OidcProvider/Context';

import { Link } from 'react-router-dom';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { DISABLED } from '@misakey/react-auth/constants/account/mfaMethod';

const { identity: IDENTITY_SELECTOR } = authSelectors;
const CHECK_MARK_SIGN = '\u2705';
const CROSS_MARK_SIGN = '\u274C';

// COMPONENTS
const ListItemSecurity = ({ classes, to, t, ...props }) => {
  const { hasAccount, mfaMethod } = useSelector(IDENTITY_SELECTOR);
  const { askSigninRedirect } = useContext(UserManagerContext);
  const onClick = useCallback(
    () => askSigninRedirect({ acrValues: 2, prompt: 'login', fullScreen: false }),
    [askSigninRedirect],
  );

  const listItemProps = useMemo(
    () => (!hasAccount
      ? { onClick }
      : {
        to,
        component: Link,
      }),
    [hasAccount, onClick, to],
  );

  return (
    <ListItem
      classes={{ container: classes.container }}
      aria-label={t('components:listItemSecurity.ariaLabel')}
      {...listItemProps}
      {...omitTranslationProps(props)}
    >
      <ListItemIcon className={classes.icon}>
        <Typography>{t('components:listItemSecurity.title')}</Typography>
      </ListItemIcon>
      <ListItemText primary={t('components:listItemSecurity.text', {
        MFAStatus: mfaMethod !== DISABLED ? CHECK_MARK_SIGN : CROSS_MARK_SIGN,
        passwordStatus: hasAccount ? CHECK_MARK_SIGN : CROSS_MARK_SIGN,
      })}
      />
      <ChevronRightIcon className={classes.actionIcon} />
    </ListItem>
  );
};

ListItemSecurity.propTypes = {
  classes: PropTypes.shape({
    container: PropTypes.string,
    icon: PropTypes.string,
    actionIcon: PropTypes.string,
  }),
  to: TO_PROP_TYPE,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListItemSecurity.defaultProps = {
  classes: {},
  to: null,
};

export default withTranslation('components')(ListItemSecurity);
