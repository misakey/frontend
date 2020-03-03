import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { connect } from 'react-redux';
import { useHistory, useLocation, generatePath, Link } from 'react-router-dom';
import moment from 'moment';

import API from '@misakey/api';
import routes from 'routes';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { OPEN, DONE, CLOSED } from 'constants/databox/status';

import withDialogConnect from 'components/smart/Dialog/Connect/with';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';
import { updateDatabox } from 'store/actions/databox';
import { contactDataboxURL } from 'store/actions/screens/contact';

import { getDetailPairsHead } from '@misakey/helpers/apiError';
import getNextSearch from '@misakey/helpers/getNextSearch';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import prop from '@misakey/helpers/prop';

import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import DialogDataboxArchive from 'components/dumb/Dialog/Databox/Archive';
import DialogDataboxReopen from 'components/dumb/Dialog/Databox/Reopen';
import Title from 'components/dumb/Typography/Title';
import CardSimpleText from 'components/dumb/Card/Simple/Text';
import CardSimpleDoubleButton from 'components/dumb/Card/Simple/DoubleButton';
import DataboxContent from 'components/smart/Databox/Content';
import { IS_PLUGIN } from 'constants/plugin';


// CONSTANTS
const PATCH_DATABOX_ENDPOINT = {
  method: 'PATCH',
  path: '/databoxes/:id',
  auth: true,
};

const DIALOGS = {
  ARCHIVE: 'ARCHIVE',
  REOPEN: 'REOPEN',
};

const { forbidden, conflict } = errorTypes;

// HELPERS
const getStatus = prop('status');

const closeDatabox = (id, body) => API
  .use(PATCH_DATABOX_ENDPOINT)
  .build({ id }, body)
  .send();

const reopenDatabox = (id) => API
  .use(PATCH_DATABOX_ENDPOINT)
  .build({ id }, { status: OPEN })
  .send();

const requestDataboxAccess = (id) => API
  .use(API.endpoints.application.box.requestAccess)
  .build({ id })
  .send();

const idProp = prop('id');
const createdAtProp = prop('createdAt');

// HOOKS
const useOnReopenMailTo = (mainDomain, dispatchContact, history, search) => useCallback(
  (token) => {
    const href = IS_PLUGIN ? window.env.APP_URL : window.env.href;
    const databoxURL = parseUrlFromLocation(`${routes.requests}#${token}`, href).href;
    const nextSearch = getNextSearch(search, new Map([['reopen', true]]));
    dispatchContact(databoxURL, mainDomain, nextSearch, history);
  },
  [mainDomain, dispatchContact, history, search],
);

// COMPONENTS
const DialogConnectButton = withDialogConnect(Button);


const CurrentDatabox = ({
  application,
  databox,
  onContributionDpoEmailClick,
  isAuthenticated,
  dispatchUpdateDatabox,
  dispatchContact,
  initCrypto,
  t,
  ...rest
}) => {
  // dialogs
  const [openDialog, setOpenDialog] = useState(null);

  const history = useHistory();
  const { search } = useLocation();

  const onArchiveDialog = useCallback(
    () => {
      setOpenDialog(DIALOGS.CLOSE);
    },
    [setOpenDialog],
  );

  const onReopenDialog = useCallback(
    () => {
      setOpenDialog(DIALOGS.REOPEN);
    },
    [setOpenDialog],
  );

  const onDialogClose = useCallback(
    () => {
      setOpenDialog(null);
    },
    [setOpenDialog],
  );

  const { enqueueSnackbar } = useSnackbar();

  const { dpoEmail, mainDomain, links } = useMemo(
    () => application || {},
    [application],
  );

  const dpoContactLink = useMemo(
    () => {
      if (isEmpty(links)) {
        return null;
      }
      const linkObject = links.find((link) => link.type === 'dpo_contact');
      return (isNil(linkObject) ? null : linkObject.value);
    },
    [links],
  );

  const databoxId = useMemo(
    () => idProp(databox),
    [databox],
  );

  const status = useMemo(
    () => getStatus(databox),
    [databox],
  );

  const openSince = useMemo(
    () => moment(createdAtProp(databox)).fromNow(),
    [databox],
  );

  const onError = useCallback(
    (translationKey) => {
      enqueueSnackbar(t(translationKey), { variant: 'error' });
    },
    [enqueueSnackbar, t],
  );

  const onArchive = useCallback(
    (form, { setSubmitting }) => {
      const body = { status: CLOSED, ...objectToSnakeCase(form) };
      closeDatabox(databoxId, body)
        .then(() => dispatchUpdateDatabox(databoxId, objectToCamelCase(body)))
        .catch((err) => {
          const { code } = err;
          if (code === forbidden) {
            return onError(t('common__new:httpStatus.error.forbidden'));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`citizen__new:application.info.vault.errors.conflict.archive.${key}`));
          }
          return onError(t('common__new:httpStatus.error.default'));
        })
        .finally(() => {
          setSubmitting(false);
          onDialogClose();
        });
    },
    [databoxId, dispatchUpdateDatabox, onError, t, onDialogClose],
  );

  const onAcceptDpoReason = useCallback(
    () => {
      const body = { status: CLOSED };
      closeDatabox(databoxId, body)
        .then(() => dispatchUpdateDatabox(databoxId, objectToCamelCase(body)))
        .catch((err) => {
          const { code } = err;
          if (code === forbidden) {
            return onError(t('common__new:httpStatus.error.forbidden'));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`citizen__new:application.info.vault.errors.conflict.archive.${key}`));
          }
          return onError(t('common__new:httpStatus.error.default'));
        });
    },
    [databoxId, dispatchUpdateDatabox, onError, t],
  );

  const onReopenMailTo = useOnReopenMailTo(mainDomain, dispatchContact, history, search);

  const onReopen = useCallback(
    () => {
      reopenDatabox(databoxId)
        .then(() => {
          dispatchUpdateDatabox(databoxId, { status: OPEN });
          return requestDataboxAccess(databoxId)
            .then((response) => onReopenMailTo(response.token));
        })
        .catch((err) => {
          const { code } = err;
          if (code === forbidden) {
            return onError(t('common__new:httpStatus.error.forbidden'));
          }
          const [key, errorType] = getDetailPairsHead(err);
          if (errorType === conflict) {
            return onError(t(`citizen__new:application.info.vault.errors.conflict.reopen.${key}`));
          }
          return onError(t('common__new:httpStatus.error.default'));
        })
        .finally(() => {
          onDialogClose();
        });
    },
    [databoxId, dispatchUpdateDatabox, onDialogClose, onError, onReopenMailTo, t],
  );

  if (!isAuthenticated || (isEmpty(databox) && !isEmpty(dpoEmail))) {
    return (
      <div {...omitTranslationProps(rest)}>
        <Title>
          {t('citizen__new:application.info.vault.currentDatabox.title')}
        </Title>
        <CardSimpleText
          text={t('citizen__new:application.info.vault.currentDatabox.none')}
          highlight
          my={2}
          button={(
            <DialogConnectButton
              component={Link}
              text={t('citizen__new:application.info.vault.currentDatabox.contact')}
              standing={BUTTON_STANDINGS.MAIN}
              size="small"
              to={generatePath(routes.citizen.application.contact._, { mainDomain })}
            />
          )}
        />
      </div>
    );
  }

  if (isEmpty(dpoEmail)) {
    return (
      <div {...omitTranslationProps(rest)}>
        <Title>
          {t('citizen__new:application.info.vault.currentDatabox.titleNoDpo')}
        </Title>
        <CardSimpleText
          text={t('citizen__new:application.info.vault.currentDatabox.addDPO')}
          my={2}
          button={{
            text: t('common__new:add'),
            standing: BUTTON_STANDINGS.MAIN,
            onClick: onContributionDpoEmailClick,
          }}
        />
        {!isNil(dpoContactLink) && (
          <CardSimpleText
            text={t('citizen__new:application.info.vault.currentDatabox.contactForm.text')}
            my={2}
            button={{
              text: t('citizen__new:application.info.vault.currentDatabox.contactForm.button'),
              standing: BUTTON_STANDINGS.OUTLINED,
              component: 'a',
              rel: 'noreferrer noopener',
              target: '_blank',
              href: dpoContactLink,
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div {...omitTranslationProps(rest)}>
      <DialogDataboxArchive
        open={openDialog === DIALOGS.CLOSE}
        onClose={onDialogClose}
        onSuccess={onArchive}
      />
      <DialogDataboxReopen
        open={openDialog === DIALOGS.REOPEN}
        onClose={onDialogClose}
        onSuccess={onReopen}
      />
      <Title>
        {t('citizen__new:application.info.vault.currentDatabox.title')}
      </Title>
      <CardSimpleDoubleButton
        my={2}
        highlight={status !== DONE}
        text={t('citizen__new:application.info.vault.currentDatabox.openSince', { since: openSince })}
        primary={(status !== DONE) ? {
          standing: BUTTON_STANDINGS.MAIN,
          text: t('common__new:resendEmail'),
          size: 'small',
          component: Link,
          to: {
            pathname: generatePath(routes.citizen.application.contact._, { mainDomain }),
            search: getNextSearch(search, new Map([['recontact', true]])),
          },
        } : null}
        secondary={(status !== DONE) ? {
          standing: BUTTON_STANDINGS.CANCEL,
          text: t('common__new:archive'),
          onClick: onArchiveDialog,
          size: 'small',
        } : null}
      />
      {(status === DONE) && (
        <CardSimpleDoubleButton
          my={2}
          highlight
          text={t(`common__new:databox.dpoComment.${databox.dpoComment}`)}
          secondary={{
            standing: BUTTON_STANDINGS.CANCEL,
            text: t('common__new:refuse'),
            onClick: onReopenDialog,
            size: 'small',
          }}
          primary={{
            standing: BUTTON_STANDINGS.MAIN,
            text: t('common__new:accept'),
            onClick: onAcceptDpoReason,
            size: 'small',
          }}
        />
      )}
      <DataboxContent
        databox={databox}
        application={application}
        onContributionDpoEmailClick={onContributionDpoEmailClick}
        initCrypto={initCrypto}
      />

    </div>
  );
};

CurrentDatabox.propTypes = {
  t: PropTypes.func.isRequired,
  application: PropTypes.shape(ApplicationSchema.propTypes),
  databox: PropTypes.shape(DataboxSchema.propTypes),
  onContributionDpoEmailClick: PropTypes.func.isRequired,
  initCrypto: PropTypes.func.isRequired,

  // CONNECT
  isAuthenticated: PropTypes.bool,
  dispatchUpdateDatabox: PropTypes.func.isRequired,
  dispatchContact: PropTypes.func.isRequired,
};

CurrentDatabox.defaultProps = {
  application: null,
  databox: null,
  isAuthenticated: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  isAuthenticated: !!state.auth.token,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateDatabox: (databoxId, changes) => dispatch(updateDatabox(databoxId, changes)),
  dispatchContact: (databoxURL, mainDomain, search, history) => {
    dispatch(contactDataboxURL(databoxURL, mainDomain));
    const pathname = generatePath(
      routes.citizen.application.contact.preview,
      { mainDomain },
    );
    history.push({ pathname, search });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withTranslation(['common__new', 'citizen__new'])(CurrentDatabox),
);
