import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { generatePath } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import { GMAIL } from 'constants/mail-providers';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import useScript from 'hooks/useScript';

import { sendMessage as sendGmailMessage, SEND_MAIL_CONFIG as GMAIL_CONFIG } from 'helpers/gapi/gmail';

import pick from '@misakey/helpers/pick';
import prop from '@misakey/helpers/prop';
import propOr from '@misakey/helpers/propOr';
import noop from '@misakey/helpers/noop';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ButtonSubmit from '@misakey/ui/Button/Submit';

// @FIXME local override
import Navigation from '@misakey/ui/Navigation';

// CONSTANTS
const APP_CONTACT_PROPS = ['dpoEmail', 'name', 'mainDomain'];

const PROVIDERS = {
  [GMAIL.key]: GMAIL_CONFIG,
};

const SEND_CONFIG = {
  [GMAIL.key]: sendGmailMessage,
};


// HELPERS
const getAppContactProps = pick(APP_CONTACT_PROPS);
const fromProp = prop('from');
const scriptSrcProp = prop('scriptSrc');
const scriptOnLoadProp = propOr(noop, 'onLoad');
const scriptOnAlreadyLoadedProp = propOr(noop, 'onAlreadyLoaded');


// HOOKS
const useStyles = makeStyles((theme) => ({
  preview: {
    display: 'flex',
    flexDirection: 'column',
    margin: '3rem 0',
  },
  subject: {
    paddingBottom: '1rem',
    borderBottom: `1px solid ${theme.palette.primary.main}`,
    lineHeight: theme.typography.subtitle1.lineHeight,
  },
  body: {
    overflow: 'auto',
    lineHeight: theme.typography.body1.lineHeight,
  },
}));

const useOnSuccess = (from, history, enqueueSnackbar, t) => useCallback(
  () => {
    enqueueSnackbar(t('screens:contact.preview.success'), { variant: 'success' });
    history.push(from);
  },
  [from, history, enqueueSnackbar, t],
);

const useOnSubmit = (provider, mailto, subject, body, onSuccess) => useCallback(
  () => {
    const send = SEND_CONFIG[provider];
    if (isFunction(send)) {
      return send(mailto, subject, body, onSuccess);
    }
    throw new Error(`Unknown send behaviour for provider ${provider}`);
  },
  [provider, mailto, subject, body, onSuccess],
);

const useFrom = (state, mainDomain) => useMemo(
  () => {
    const from = fromProp(state);
    if (isNil(from)) {
      return generatePath(routes.citizen.application.box, { mainDomain });
    }
    return from;
  },
  [state, mainDomain],
);

const ContactPreview = ({
  history,
  match: { params },
  databoxURL,
  location: { state },
  entity,
  t,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();

  const [loaded, setLoaded] = useState(false);

  const { provider } = params;
  const { dpoEmail, name, mainDomain } = useMemo(
    () => (isNil(entity) ? {} : getAppContactProps(entity)),
    [entity],
  );
  const from = useFrom(state, mainDomain);

  const pushPath = useMemo(
    () => generatePath(routes.citizen.application.contact._, { mainDomain }),
    [mainDomain],
  );
  const providerConfig = useMemo(() => PROVIDERS[provider], [provider]);
  const scriptSrc = useMemo(() => scriptSrcProp(providerConfig), [providerConfig]);

  const mailto = t('common:emailTo', { applicationName: name, dpoEmail });
  const subject = t('common:emailSubject');
  const body = t('common:emailBody', { dpoEmail, databoxURL });


  const onSuccess = useOnSuccess(from, history, enqueueSnackbar, t);
  const onSubmit = useOnSubmit(provider, mailto, subject, body, onSuccess);

  const onLoaded = useCallback(
    (isSignedIn) => {
      if (isSignedIn) {
        setLoaded(true);
      }
    }, [setLoaded],
  );

  const onLoad = useMemo(
    () => scriptOnLoadProp(providerConfig)(onLoaded, noop),
    [providerConfig, onLoaded],
  );

  const onAlreadyLoaded = useMemo(
    () => scriptOnAlreadyLoadedProp(providerConfig)(onLoaded, noop),
    [providerConfig, onLoaded],
  );

  useScript(
    scriptSrc,
    onLoad,
    onAlreadyLoaded,
  );

  return (
    <div>
      <Navigation
        pushPath={pushPath}
        showGoBack={false}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('screens:contact.preview.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('screens:contact.preview.subtitle')}
        </Typography>
        <Box className={classes.preview}>
          <pre className={classes.subject}>
            {subject}
          </pre>
          <pre className={classes.body}>
            {body}
          </pre>
        </Box>
        <Box mt={1} display="flex" justifyContent="flex-end">
          <ButtonSubmit onClick={onSubmit} disabled={!loaded}>
            {t('common:send')}
          </ButtonSubmit>
        </Box>
      </Container>
    </div>
  );
};

ContactPreview.propTypes = {
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  location: PropTypes.shape({ state: PropTypes.object }).isRequired,
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,

  entity: PropTypes.shape(ApplicationSchema.propTypes),
  databoxURL: PropTypes.string,
};

ContactPreview.defaultProps = {
  entity: null,
  databoxURL: null,
};


export default withTranslation('screens')(ContactPreview);
