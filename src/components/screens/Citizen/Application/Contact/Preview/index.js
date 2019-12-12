import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { generatePath, Link, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import makeStyles from '@material-ui/core/styles/makeStyles';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
// import { selectors as contactSelectors } from 'store/reducers/screens/contact';

import { GMAIL } from 'constants/mail-providers';

import useScript from 'hooks/useScript';

import { sendMessage as sendGmailMessage, SEND_MAIL_CONFIG as GMAIL_CONFIG } from 'helpers/gapi/gmail';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import prop from '@misakey/helpers/prop';
import propOr from '@misakey/helpers/propOr';
import noop from '@misakey/helpers/noop';
import getSearchParams from '@misakey/helpers/getSearchParams';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import BoxControls from 'components/dumb/Box/Controls';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ToggleButtonGroupMailType from 'components/smart/ToggleButtonGroup/MailType';
import PreMail from 'components/dumb/Pre/Mail';

import Navigation from 'components/dumb/Navigation';

// CONSTANTS
const PROVIDERS = {
  [GMAIL.key]: GMAIL_CONFIG,
};

const SEND_CONFIG = {
  [GMAIL.key]: sendGmailMessage,
};

// HELPERS
const scriptSrcProp = prop('scriptSrc');
const scriptOnLoadProp = propOr(noop, 'onLoad');
const scriptOnAlreadyLoadedProp = propOr(noop, 'onAlreadyLoaded');

// HOOKS
const useStyles = makeStyles(() => ({
  spanNoWrap: {
    whiteSpace: 'nowrap',
  },
}));

const useOnSuccess = (enqueueSnackbar, t) => useCallback(
  () => {
    enqueueSnackbar(t('common:providers.send.success'), { variant: 'success' });
  },
  [enqueueSnackbar, t],
);

const useOnSubmit = (mailProvider, mailto, subject, body, onSuccess) => useCallback(
  () => {
    const send = SEND_CONFIG[mailProvider];
    if (isFunction(send)) {
      return send(mailto, subject, body, onSuccess);
    }
    throw new Error(`Unknown send behaviour for provider ${mailProvider}`);
  },
  [mailProvider, mailto, subject, body, onSuccess],
);

// COMPONENTS
const ContactPreview = ({
  history,
  databoxURL,
  entity,
  mailProvider,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { search } = useLocation();
  const mailType = useMemo(
    () => getSearchParams(search).mailType,
    [search],
  );

  const [loaded, setLoaded] = useState();

  const { dpoEmail, mainDomain, name } = useMemo(
    () => (isNil(entity) ? {} : entity),
    [entity],
  );

  const mailto = useMemo(
    () => (
      <Trans
        values={{ applicationName: name, dpoEmail }}
        i18nKey="common:emailToTrans"
      >
        {'DPO de {{applicationName}}'}
        <span className={classes.spanNoWrap}>{'{{dpoEmail}}'}</span>
      </Trans>
    ),
    [classes.spanNoWrap, dpoEmail, name],
  );
  const subject = useMemo(
    () => t('common:emailSubject'),
    [t],
  );
  const body = useMemo(
    () => t(`common:emailBody.${mailType}`, { dpoEmail, databoxURL }),
    [databoxURL, dpoEmail, mailType, t],
  );

  const nextTo = useMemo(
    () => (isNil(mainDomain) || isNil(mailType)
      ? null
      : ({
        pathname: generatePath(
          routes.citizen.application.contact.providers,
          { mainDomain, mailType },
        ),
        search,
      })),
    [mailType, mainDomain, search],
  );

  const providerConfig = useMemo(() => PROVIDERS[mailProvider], [mailProvider]);
  const scriptSrc = useMemo(() => scriptSrcProp(providerConfig), [providerConfig]);

  const onSuccess = useOnSuccess(enqueueSnackbar, t);
  const onSubmit = useOnSubmit(mailProvider, mailto, subject, body, onSuccess);

  const primary = useMemo(
    () => (isNil(mailProvider)
      ? {
        component: Link,
        to: nextTo,
        text: t('common:next'),
      }
      : {
        onClick: onSubmit,
        isValid: loaded,
        text: t('common:send'),
      }),
    [loaded, mailProvider, nextTo, onSubmit, t],
  );

  const onLoaded = useCallback(
    (isSignedIn) => {
      if (isSignedIn) {
        setLoaded(true);
      }
    }, [],
  );

  const onLoad = useMemo(
    () => scriptOnLoadProp(providerConfig)(onLoaded, noop),
    [providerConfig, onLoaded],
  );

  const onAlreadyLoaded = useMemo(
    () => scriptOnAlreadyLoadedProp(providerConfig)(onLoaded, noop),
    [providerConfig, onLoaded],
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

  return (
    <>
      <Navigation
        history={history}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('screens:contact.preview.title')}
      />
      <Container maxWidth="md">
        <Subtitle>
          {t('screens:contact.preview.subtitle')}
        </Subtitle>
        <Box mt={3}>
          <ToggleButtonGroupMailType />
        </Box>
        <PreMail mailto={mailto} subject={subject} body={body} />
        {!isNil(nextTo) && (
          <BoxControls
            mt={2}
            primary={primary}
          />
        )}
      </Container>
    </>
  );
};

ContactPreview.propTypes = {
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,

  entity: PropTypes.shape(ApplicationSchema.propTypes),
  databoxURL: PropTypes.string,
  // CONNECT
  mailProvider: PropTypes.string,
};

ContactPreview.defaultProps = {
  entity: null,
  databoxURL: null,
  mailProvider: null,
};

// @FIXME use mail provider preferency once we can configure it in account
// CONNECT
// const mapStateToProps = (state) => ({
//   mailProvider: contactSelectors.getMailProviderPreferency(state),
// });

export default withTranslation(['common', 'screens'])(ContactPreview);
