import React, { useMemo, useState } from 'react';
import routes from 'routes';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import IdentitySchema from 'store/schemas/Identity';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ScreenAction from 'components/dumb/Screen/Action';
import Container from '@material-ui/core/Container';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import SettingsIcon from '@material-ui/icons/Settings';
import CircularProgress from '@material-ui/core/CircularProgress';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import AccountPassword from 'components/screens/app/Account/Security/Password';
import AccountMFA from 'components/screens/app/Account/Security/MFA';

import { DISABLED } from 'constants/account/mfaMethod';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

const CHECK_MARK_SIGN = '\u2705';
const CROSS_MARK_SIGN = '\u274C';

// HOOKS
const useStyles = makeStyles((theme) => ({
  accordion: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    margin: theme.spacing(1, 0),
  },
  accordionDetails: {
    padding: theme.spacing(2),
  },
  icon: {
    minWidth: 36,
  },
}));

// COMPONENTS
const AccountSecurity = ({ t, identity, isFetching }) => {
  const { id } = useParams();
  const classes = useStyles();

  const [isUpdatingMFA, setIsUpdatingMFA] = useState(false);

  const isLoading = useMemo(
    () => isFetching || isNil(identity),
    [identity, isFetching],
  );

  const accountHome = useGeneratePathKeepingSearchAndHash(routes.identities._, { id });

  const navigationProps = useMemo(
    () => ({
      homePath: accountHome,
    }),
    [accountHome],
  );

  const { mfaMethod } = useSafeDestr(identity);

  const { mfaMark, mfaStatus } = useMemo(
    () => (mfaMethod === DISABLED
      ? { mfaMark: CROSS_MARK_SIGN, mfaStatus: 'deactivated' }
      : { mfaMark: CHECK_MARK_SIGN, mfaStatus: 'activated' }),
    [mfaMethod],
  );

  return (
    <ScreenAction
      title={t('account:security.title')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md">
        <Accordion elevation={0} className={classes.accordion}>
          <AccordionSummary
            expandIcon={<SettingsIcon />}
            aria-controls="password-content"
            id="password-header"
          >
            <ListItem>
              <ListItemIcon className={classes.icon}>{CHECK_MARK_SIGN}</ListItemIcon>
              <ListItemText
                primary={t('account:security.password.title')}
                secondary={t('account:security.password.subtitle')}
              />
            </ListItem>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <AccountPassword identity={identity} />
          </AccordionDetails>
        </Accordion>
        <Accordion elevation={0} className={classes.accordion}>
          <AccordionSummary
            expandIcon={<SettingsIcon />}
            aria-controls="mfa-content"
            id="mfa-header"
          >
            <ListItem>
              <ListItemIcon className={classes.icon}>
                {isUpdatingMFA ? <CircularProgress size={20} /> : mfaMark}
              </ListItemIcon>
              <ListItemText
                primary={t('account:security.MFA.title')}
                secondary={t(`account:security.MFA.subtitle.${mfaStatus}`)}
              />
            </ListItem>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <AccountMFA identity={identity} setIsFetching={setIsUpdatingMFA} />
          </AccordionDetails>
        </Accordion>
      </Container>
    </ScreenAction>
  );
};

AccountSecurity.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountSecurity.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation('account')(AccountSecurity);
