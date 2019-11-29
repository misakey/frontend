import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { makeStyles } from '@material-ui/core/styles';

import useScript from 'hooks/useScript';

import { SEND_MAIL_CONFIG as GMAIL_CONFIG } from 'helpers/gapi/gmail';
import prop from '@misakey/helpers/prop';
import noop from '@misakey/helpers/noop';
import propOr from '@misakey/helpers/propOr';
import isObject from '@misakey/helpers/isObject';
import isEmpty from '@misakey/helpers/isEmpty';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// CONSTANTS
const PROVIDERS = [
  GMAIL_CONFIG,
];

// HELPERS
const scriptSrcProp = prop('scriptSrc');
const scriptOnLoadProp = propOr(noop, 'onLoad');
const scriptOnAlreadyLoadedProp = propOr(noop, 'onAlreadyLoaded');

// HOOKS
const useStyles = makeStyles(() => ({
  listItemRoot: {
    justifyContent: 'space-between',
  },
  avatarRoot: {
    width: '100%',
    borderRadius: '0',
  },
}));

const useOnProviderSelect = (setProvider) => useCallback(
  (provider) => {
    setProvider(provider);
  },
  [setProvider],
);

const useOnConsentCheck = (provider, onChange, setLoaded, enqueueSnackbar, t) => useCallback(
  (isSignedIn) => {
    setLoaded(true);
    if (isSignedIn) {
      enqueueSnackbar(t('common:providers.success'), { variant: 'success' });
      onChange(provider.key);
    }
  }, [provider, onChange, setLoaded, enqueueSnackbar, t],
);

const useOnProviderClick = (
  provider, loaded,
  onProviderSelect, onConsentCheck, onConsentCatch,
) => useCallback(
  (event) => {
    const providerKey = event.currentTarget.id;
    const nextProvider = PROVIDERS.find(({ key }) => key === providerKey);
    if (provider !== nextProvider) {
      onProviderSelect(nextProvider);
    } else if (loaded) {
      scriptOnAlreadyLoadedProp(provider)(onConsentCheck, onConsentCatch)();
    }
  },
  [provider, loaded, onProviderSelect, onConsentCheck, onConsentCatch],
);

const useMailtoHref = (mailtoProps, t) => useMemo(
  () => {
    if (!isObject(mailtoProps) || isEmpty(mailtoProps)) {
      return '';
    }
    const { applicationName, mailto, subject, body } = mailtoProps;
    return `mailto:${encodeURIComponent(t('emailTo', { applicationName, dpoEmail: mailto }))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },
  [mailtoProps, t],
);

// COMPONENTS
const ListMailProviders = ({
  onChange,
  allowManual,
  mailtoProps,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [provider, setProvider] = useState(null);
  const scriptSrc = useMemo(() => scriptSrcProp(provider), [provider]);
  const [loaded, setLoaded] = useState(false);
  const onProviderSelect = useOnProviderSelect(setProvider);

  const mailtoHref = useMailtoHref(mailtoProps, t);

  const onConsentCheck = useOnConsentCheck(provider, onChange, setLoaded, enqueueSnackbar, t);
  const onConsentCatch = useCallback(
    () => {
      setLoaded(true);
    },
    [setLoaded],
  );

  const onManualClick = useCallback(
    () => enqueueSnackbar(t('common:providers.manual.notify'), { variant: 'info' }),
    [enqueueSnackbar, t],
  );

  const onLoad = useMemo(
    () => scriptOnLoadProp(provider)(onConsentCheck, onConsentCatch),
    [provider, onConsentCheck, onConsentCatch],
  );

  const onAlreadyLoaded = useCallback(
    (...args) => {
      if (!loaded) {
        scriptOnAlreadyLoadedProp(provider)(onConsentCheck, onConsentCatch)(...args);
      }
    },
    [provider, loaded, onConsentCheck, onConsentCatch],
  );

  const onError = useCallback(
    () => {
      enqueueSnackbar(t('common:providers.error'), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  useScript(
    scriptSrc,
    onLoad,
    onAlreadyLoaded,
    onError,
  );

  const onProviderClick = useOnProviderClick(
    provider, loaded, onProviderSelect, onConsentCheck, onConsentCatch,
  );

  return (
    <List>
      {PROVIDERS.map(({ key, alt, logoSrc }) => (
        <ListItem
          button
          divider
          id={key}
          key={key}
          aria-label={alt}
          classes={{ root: classes.listItemRoot }}
          onClick={onProviderClick}
        >
          <ListItemAvatar>
            <Avatar alt={alt} src={logoSrc} classes={{ root: classes.avatarRoot }} />
          </ListItemAvatar>
          <ChevronRightIcon color="primary" />
        </ListItem>
      ))}
      {allowManual && (
        <ListItem
          button
          divider
          aria-label={t('common:providers.manual.send', 'Send Manually')}
          component="a"
          href={mailtoHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onManualClick}
        >
          <ListItemIcon>
            <Typography variant="button" color="textSecondary">
              {t('common:providers.manual.send', 'Send Manually')}
            </Typography>
          </ListItemIcon>
        </ListItem>
      )}
    </List>
  );
};

ListMailProviders.propTypes = {
  mailtoProps: PropTypes.shape({
    mailto: PropTypes.string.isRequired,
    applicationName: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  }),
  allowManual: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListMailProviders.defaultProps = {
  mailtoProps: {},
  allowManual: false,
};

export default withTranslation('common')(ListMailProviders);
