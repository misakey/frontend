import React, { useMemo, useCallback, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

import { makeStyles } from '@material-ui/core/styles';

import { GMAIL } from 'constants/mail-providers';

import useScript from '@misakey/hooks/useScript';

import { sendMessage as sendGmailMessage, SEND_MAIL_CONFIG as GMAIL_CONFIG } from '@misakey/helpers/gapi/gmail';
import prop from '@misakey/helpers/prop';
import isArray from '@misakey/helpers/isArray';
import noop from '@misakey/helpers/noop';
import propOr from '@misakey/helpers/propOr';
import head from '@misakey/helpers/head';
import isObject from '@misakey/helpers/isObject';
import isEmpty from '@misakey/helpers/isEmpty';
import isFunction from '@misakey/helpers/isFunction';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import MailIcon from '@material-ui/icons/Mail';
import IconError from '@material-ui/icons/Error';
import IconSuccess from '@material-ui/icons/Done';
import DialogConfirm from 'components/dumb/Dialog/Confirm';
import BulkMailToDialog from 'components/smart/List/MailProviders/BulkMailToDialog';
import { IS_PLUGIN } from 'constants/plugin';
import { openMailto } from '@misakey/helpers/plugin';

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

const useHandleBulkResponse = (setErrors, setSent) => useCallback(
  (responses) => {
    const result = responses.reduce(({ errors, sent }, { status, value: { mailto, error } }) => {
      if (status === 'rejected' || error) {
        return { errors: [...errors, mailto], sent };
      }
      return { errors, sent: [...sent, mailto] };
    }, { errors: [], sent: [] });
    setErrors(result.errors);
    setSent(result.sent);
  },
  [setErrors, setSent],
);

const useMailtoHrefs = (mailsProps, t) => useMemo(
  () => mailsProps.map((mail) => {
    if (!isObject(mail) || isEmpty(mail)) {
      return '';
    }
    const { applicationName, mailto, subject, body } = mail;
    const formatedMailto = t('emailTo', { applicationName, dpoEmail: mailto });
    return {
      href: `mailto:${encodeURIComponent(formatedMailto)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      mailto: formatedMailto,
    };
  }),
  [mailsProps, t],
);

const useErrorContent = (t, errors, sent) => useMemo(() => (
  <>
    <Typography>
      {t('common:providers.bulkError.content')}
    </Typography>
    <List>
      {sent.map((email) => (
        <ListItem>
          <ListItemIcon>
            <IconSuccess color="secondary" />
          </ListItemIcon>
          <ListItemText primary={email} />
        </ListItem>
      ))}
      {errors.map((email) => (
        <ListItem>
          <ListItemIcon>
            <IconError color="error" />
          </ListItemIcon>
          <ListItemText primary={email} />
        </ListItem>
      ))}
    </List>
  </>
), [errors, sent, t]);

const useDisplayMailToSnackbar = (enqueueSnackbar, t) => useCallback(() => {
  enqueueSnackbar(t('common:providers.manual.notify'), { variant: 'info' });
}, [enqueueSnackbar, t]);

// COMPONENTS
const ListMailProviders = ({
  onChange,
  disabled,
  allowManual,
  allowProviders,
  mailtoProps,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [provider, setProvider] = useState(null);
  const [errors, setErrors] = useState([]);
  const [sent, setSent] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [openBulkMailToDialog, setOpenBulkMailToDialog] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const scriptSrc = useMemo(() => scriptSrcProp(provider), [provider]);
  const mailsProps = useMemo(
    () => (isArray(mailtoProps) ? mailtoProps : [mailtoProps]), [mailtoProps],
  );
  const nbOfMails = useMemo(() => mailsProps.length, [mailsProps]);
  const isBulk = useMemo(() => nbOfMails > 1, [nbOfMails]);

  const showError = useMemo(
    () => errors.length > 0 && errors.concat(sent).length === mailsProps.length,
    [errors, mailsProps, sent],
  );
  const showSuccess = useMemo(
    () => sent.length === mailsProps.length,
    [mailsProps.length, sent],
  );
  const onProviderSelect = useOnProviderSelect(setProvider);
  const mailtoHrefs = useMailtoHrefs(mailsProps, t);
  const errorContent = useErrorContent(t, errors, sent);
  const displayMailToSnackbar = useDisplayMailToSnackbar(enqueueSnackbar, t);
  const handleBulkResponse = useHandleBulkResponse(setErrors, setSent);
  const hideErrorModal = useCallback(() => setShowErrorModal(false), []);

  const submit = useCallback(
    (providerKey) => {
      const send = SEND_CONFIG[providerKey];
      if (isFunction(send)) {
        const sendPromises = mailsProps.map((mail) => {
          const { mailto, applicationName, subject, body } = mail || {};
          const extendedMailto = t('common:emailTo', { applicationName, dpoEmail: mailto });
          return send(extendedMailto, subject, body);
        });
        Promise.allSettled(sendPromises).then(handleBulkResponse);
      } else {
        throw new Error(`Unknown send behaviour for provider ${providerKey}`);
      }
    },
    [handleBulkResponse, mailsProps, t],
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

  const simpleManualOnClick = useCallback(
    () => {
      onChange();
      displayMailToSnackbar();
      if (IS_PLUGIN) {
        openMailto(head(mailtoHrefs).href);
      }
    },
    [displayMailToSnackbar, mailtoHrefs, onChange],
  );

  const bulkManualOnClick = useCallback(
    () => {
      onChange();
      setOpenBulkMailToDialog(true);
    },
    [onChange],
  );


  const manualButtonProps = useMemo(() => {
    if (isBulk) {
      return { onClick: bulkManualOnClick };
    }
    if (IS_PLUGIN) {
      return { onClick: simpleManualOnClick };
    }
    return {
      component: 'a',
      target: '_blank',
      rel: 'noopener noreferrer',
      href: head(mailtoHrefs).href,
      onClick: simpleManualOnClick,
    };
  }, [bulkManualOnClick, isBulk, mailtoHrefs, simpleManualOnClick]);

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

  useEffect(() => {
    if (showSuccess) {
      enqueueSnackbar(t('common:providers.send.success', { count: sent.length }), { variant: 'success' });
    }

    if (showError) {
      if (isBulk) {
        setShowErrorModal(true);
      } else {
        enqueueSnackbar(t('common:providers.send.error'), { variant: 'error' });
      }
    }
  }, [enqueueSnackbar, isBulk, sent, showError, showSuccess, t]);

  return (
    <>
      <BulkMailToDialog
        mailtoHrefs={mailtoHrefs}
        setOpenBulkMailToDialog={setOpenBulkMailToDialog}
        openBulkMailToDialog={openBulkMailToDialog}
      />
      <DialogConfirm
        onConfirm={hideErrorModal}
        setDialogOpen={setShowErrorModal}
        isDialogOpen={showErrorModal}
        dialogContent={errorContent}
        title={t('common:providers.bulkError.title')}
      />
      <List>
        {allowProviders && PROVIDERS.map(({ key, alt, logoSrc }) => (
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
            {...manualButtonProps}
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
    </>
  );
};

const mailtoPropsTypes = {
  mailto: PropTypes.string.isRequired,
  applicationName: PropTypes.string.isRequired,
  subject: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
};

ListMailProviders.propTypes = {
  mailtoProps: PropTypes.oneOfType([
    PropTypes.shape(mailtoPropsTypes),
    PropTypes.arrayOf(PropTypes.shape(mailtoPropsTypes)),
  ]),
  disabled: PropTypes.bool,
  allowManual: PropTypes.bool,
  allowProviders: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListMailProviders.defaultProps = {
  mailtoProps: null,
  disabled: false,
  allowManual: false,
  allowProviders: !IS_PLUGIN,
};


export default withTranslation('common')(ListMailProviders);
