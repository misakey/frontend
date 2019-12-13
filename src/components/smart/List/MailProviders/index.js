import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { makeStyles } from '@material-ui/core/styles';

import { GMAIL } from 'constants/mail-providers';

import useScript from 'hooks/useScript';

import { sendMessage as sendGmailMessage, SEND_MAIL_CONFIG as GMAIL_CONFIG } from 'helpers/gapi/gmail';
import prop from '@misakey/helpers/prop';
import noop from '@misakey/helpers/noop';
import propOr from '@misakey/helpers/propOr';
import isObject from '@misakey/helpers/isObject';
import isEmpty from '@misakey/helpers/isEmpty';
import isFunction from '@misakey/helpers/isFunction';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import MailIcon from '@material-ui/icons/Mail';

// CONSTANTS
const PROVIDERS = [
  GMAIL_CONFIG,
];

const SEND_CONFIG = {
  [GMAIL.key]: sendGmailMessage,
};

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

const useOnConsentCheck = (
  provider,
  onChange,
  submit,
  setLoaded,
) => useCallback(
  (isSignedIn) => {
    setLoaded(true);
    if (isSignedIn) {
      onChange(provider.key);
      submit(provider.key);
    }
  }, [provider, onChange, submit, setLoaded],
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
  disabled,
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

  const onResponse = useCallback(
    (jsonResponse) => {
      if (jsonResponse === false) {
        enqueueSnackbar(t('common:providers.send.error'), { variant: 'error' });
      }
      enqueueSnackbar(t('common:providers.send.success'), { variant: 'success' });
    },
    [enqueueSnackbar, t],
  );

  const submit = useCallback(
    (providerKey) => {
      const send = SEND_CONFIG[providerKey];
      if (isFunction(send)) {
        const { mailto, applicationName, subject, body } = mailtoProps || {};
        const extendedMailto = t('common:emailTo', { applicationName, dpoEmail: mailto });

        send(extendedMailto, subject, body, onResponse);
      } else {
        throw new Error(`Unknown send behaviour for provider ${providerKey}`);
      }
    },
    [mailtoProps, t, onResponse],
  );

  const onConsentCheck = useOnConsentCheck(
    provider,
    onChange,
    submit,
    setLoaded,
  );
  const onConsentCatch = useCallback(
    () => {
      setLoaded(true);
    },
    [setLoaded],
  );

  const onManualClick = useCallback(
    () => {
      enqueueSnackbar(t('common:providers.manual.notify'), { variant: 'info' });
      onChange();
    },
    [onChange, enqueueSnackbar, t],
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
          disabled={disabled}
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
        </ListItem>
      ))}
      {allowManual && (
        <ListItem
          button
          disabled={disabled}
          divider
          aria-label={t('common:providers.manual.send', 'Send Manually')}
          component="a"
          href={mailtoHref}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onManualClick}
        >
          <ListItemAvatar>
            <Avatar alt={t('common:providers.manual.send', 'Send Manually')}>
              <MailIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText>
            <Typography variant="button" color="textSecondary">
              {t('common:providers.manual.send', 'Send Manually')}
            </Typography>
          </ListItemText>
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
  disabled: PropTypes.bool,
  allowManual: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListMailProviders.defaultProps = {
  mailtoProps: null,
  disabled: false,
  allowManual: false,
};


export default withTranslation('common')(ListMailProviders);
