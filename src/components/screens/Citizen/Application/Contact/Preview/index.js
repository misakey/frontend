import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { generatePath, Link, useLocation } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import makeStyles from '@material-ui/core/styles/makeStyles';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';
// import { selectors as contactSelectors } from 'store/reducers/screens/contact';

import { GMAIL } from 'constants/mail-providers';
import RECONTACT_MAIL_TYPES, { LEGAL_RECONTACT, CORDIAL_RECONTACT, FRIENDLY_RECONTACT } from 'constants/mailTypes/recontact';
import { LEGAL, CORDIAL, FRIENDLY } from 'constants/mailTypes';

import useScript from '@misakey/hooks/useScript';

import { sendMessage as sendGmailMessage, SEND_MAIL_CONFIG as GMAIL_CONFIG } from '@misakey/helpers/gapi/gmail';
import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import prop from '@misakey/helpers/prop';
import propOr from '@misakey/helpers/propOr';
import noop from '@misakey/helpers/noop';
import getSearchParams from '@misakey/helpers/getSearchParams';
import getNextSearch from '@misakey/helpers/getNextSearch';
import mapDates from '@misakey/helpers/mapDates';

import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import BoxControls from 'components/dumb/Box/Controls';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ToggleButtonGroupMailType from 'components/smart/ToggleButtonGroup/MailType/WithSearchParams';
import PreMail from 'components/dumb/Pre/Mail';
import { BUTTON_STANDINGS } from 'components/dumb/Button';

import Navigation from 'components/dumb/Navigation';
import clsx from 'clsx';
import { IS_PLUGIN } from 'constants/plugin';
import { getStyleForContainerScroll } from 'components/dumb/Screen';

// CONSTANTS
const PROVIDERS = {
  [GMAIL.key]: GMAIL_CONFIG,
};

const SEND_CONFIG = {
  [GMAIL.key]: sendGmailMessage,
};

const NAV_BAR_HEIGHT = 57;

// HELPERS
const scriptSrcProp = prop('scriptSrc');
const scriptOnLoadProp = propOr(noop, 'onLoad');
const scriptOnAlreadyLoadedProp = propOr(noop, 'onAlreadyLoaded');

// HOOKS
const useStyles = makeStyles((theme) => ({
  spanNoWrap: {
    whiteSpace: 'nowrap',
  },
  container: {
    ...getStyleForContainerScroll(theme, NAV_BAR_HEIGHT),
    padding: theme.spacing(2),
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
  databox,
  entity,
  mailProvider,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const { search, pathname } = useLocation();

  const searchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const recontact = useMemo(
    () => (isNil(searchParams.recontact)
      ? false
      : Boolean(searchParams.recontact)),
    [searchParams],
  );

  const reopen = useMemo(
    () => (isNil(searchParams.reopen)
      ? false
      : Boolean(searchParams.reopen)),
    [searchParams],
  );

  const groupMailTypeProps = useMemo(
    () => {
      if (reopen) {
        return {
          values: RECONTACT_MAIL_TYPES,
          defaultValue: LEGAL_RECONTACT,
        };
      }
      if (recontact) {
        return {
          values: RECONTACT_MAIL_TYPES,
          defaultValue: LEGAL_RECONTACT,
        };
      }
      return {};
    },
    [recontact, reopen],
  );

  const mailType = useMemo(
    () => searchParams.mailType,
    [searchParams],
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

  const exitRecontact = useMemo(
    () => {
      let newMailType;
      switch (mailType) {
        case LEGAL_RECONTACT:
          newMailType = LEGAL;
          break;
        case FRIENDLY_RECONTACT:
          newMailType = FRIENDLY;
          break;
        case CORDIAL_RECONTACT:
          newMailType = CORDIAL;
          break;
        default:
          return null;
      }

      return {
        pathname,
        search: getNextSearch(search, new Map([
          ['recontact', undefined],
          ['reopen', undefined],
          ['mailType', newMailType],
        ])),
      };
    },
    [search, pathname, mailType],
  );

  const subject = useMemo(
    () => t('common:emailSubject'),
    [t],
  );
  const body = useMemo(
    () => t(`common:emailBody.${mailType}`, { dpoEmail, databoxURL, mainDomain, ...mapDates(databox) }),
    [databoxURL, databox, mainDomain, dpoEmail, mailType, t],
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

  const skipTo = useMemo(
    () => ((isNil(mainDomain))
      ? null
      : ({
        pathname: generatePath(
          routes.citizen.application.vault,
          { mainDomain },
        ),
        search: getNextSearch(search, new Map([['recontact', undefined], ['mailType', undefined]])),
      })),
    [mainDomain, search],
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

  const secondary = useMemo(
    () => (recontact
      ? {
        component: Link,
        to: skipTo,
        text: t('common:skip'),
      }
      : null),
    [recontact, skipTo, t],
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
        gutterBottom={!IS_PLUGIN}
      />
      <Container maxWidth="md" className={clsx({ [classes.container]: IS_PLUGIN })}>
        <Subtitle>
          {t('screens:contact.preview.subtitle')}
        </Subtitle>
        <Box mt={3}>
          <ToggleButtonGroupMailType {...groupMailTypeProps} />
        </Box>
        {!isNil(exitRecontact) && (
          <BoxControls
            mt={2}
            mb={-2}
            primary={{
              size: 'small',
              standing: BUTTON_STANDINGS.TEXT,
              text: t('screens:contact.preview.exitRecontact'),
              component: Link,
              to: exitRecontact,
            }}
          />
        )}
        <PreMail mailto={mailto} subject={subject} body={body} />
        {!isNil(nextTo) && (
          <BoxControls
            mt={2}
            primary={primary}
            secondary={secondary}
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
  databox: PropTypes.shape(DataboxSchema.propTypes),
  // CONNECT
  mailProvider: PropTypes.string,
};

ContactPreview.defaultProps = {
  entity: null,
  databoxURL: null,
  databox: null,
  mailProvider: null,
};

// @FIXME use mail provider preferency once we can configure it in account
// CONNECT
// const mapStateToProps = (state) => ({
//   mailProvider: contactSelectors.getMailProviderPreferency(state),
// });

export default withTranslation(['common', 'screens'])(ContactPreview);
