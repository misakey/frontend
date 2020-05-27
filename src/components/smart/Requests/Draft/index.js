import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import moment from 'moment';

import API from '@misakey/api';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';
import UserEmailSchema from 'store/schemas/UserEmail';
import { setDataboxMeta, setUrlAccessRequest, updateDatabox } from 'store/actions/databox';
import { draftActionCreators } from 'store/reducers/userRequests/pagination';

import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';
import getNextSearch from '@misakey/helpers/getNextSearch';
import propEq from '@misakey/helpers/propEq';
import prop from '@misakey/helpers/prop';
import find from '@misakey/helpers/find';
import compose from '@misakey/helpers/compose';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import encodeMailto from 'helpers/encodeMailto';
import { removeEntities } from '@misakey/store/actions/entities';

import useFetchCallback from '@misakey/hooks/useFetch/callback';

import { ThemeProvider } from '@material-ui/core/styles';
import useMailtoProps from 'hooks/useMailtoProps';

import Container from '@material-ui/core/Container';
import ExpansionPanelContactFrom from 'components/smart/ExpansionPanel/Contact/From';
import ExpansionPanelContactRequestType from 'components/smart/ExpansionPanel/Contact/RequestType';

import CardContactTo from 'components/dumb/Card/Contact/To';
import BoxContactMailType from 'components/smart/Box/Contact/MailType';
import CardContactBody from 'components/dumb/Card/Contact/Body';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ScreenAction from 'components/dumb/Screen/Action';
import ContactConfig from 'components/screens/Citizen/Contact/Config';
import ContactConfirm from 'components/screens/Citizen/Contact/Confirm';
import BoxEllipsisApplicationLink from 'components/dumb/Box/Ellipsis/Application/Link';

import AddIcon from '@material-ui/icons/Add';
import withUserEmails from 'components/smart/withUserEmails';
import { OPEN, DRAFT } from 'constants/databox/status';
import { UNKNOWN } from 'constants/databox/type';
import { SENDING } from 'constants/databox/event';
import MenuChangeStatus from './ChangeStatusMenu';

// CONSTANTS
const CONFIG_KEY = 'config';
const CONFIRM_KEY = 'confirm';
const HOME_PATH = routes.citizen._;

const patchRequest = (id) => API
  .use(API.endpoints.request.update)
  .build({ id }, { status: OPEN })
  .send();

const deleteRequest = (id) => API
  .use(API.endpoints.request.delete)
  .build({ id })
  .send();

const fetchAccessRequest = (id) => API.use(API.endpoints.request.requestAccess)
  .build({ id })
  .send();

// HELPERS
const isUserEmailActive = propEq('active', true);
const getDataboxMeta = compose(
  ({ dpoEmail, owner }) => ({ dpoEmail, owner: objectToCamelCase(owner) }),
  objectToCamelCase,
);

// COMPONENTS
const DraftRequest = ({
  dispatch,
  request,
  application,
  onPreventRefetch,
  userEmails,
  userId,
  contactEmail,
  mailer,
  isFetchingRequest,
  themeforType,
  t,
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const { search, pathname, ...locationRest } = useLocation();
  const { replace } = useHistory();

  const searchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const {
    urlAccess,
    id,
    status,
    type,
    owner,
    userEmailId,
  } = useMemo(() => request || {}, [request]);

  const userEmail = useMemo(() => prop('email')(owner), [owner]);
  const isTypeUnknown = useMemo(() => type === UNKNOWN, [type]);
  const isDraft = useMemo(() => status === DRAFT, [status]);

  const options = useMemo(
    () => (userEmails || []).filter(isUserEmailActive),
    [userEmails],
  );

  const mailType = useMemo(
    () => searchParams.mailType,
    [searchParams],
  );

  const { dpoEmail, mainDomain, name } = useMemo(
    () => (isNil(application) ? {} : application),
    [application],
  );

  const subject = useMemo(
    () => (!isTypeUnknown ? t(`citizen:contact.email.subject.value.${type}`) : null),
    [isTypeUnknown, t, type],
  );

  const body = useMemo(
    () => t(
      `citizen:contact.email.body.${type}.${mailType}`,
      {
        dpoEmail,
        databoxURL: urlAccess,
        mainDomain,
        userEmail,
      },
    ),
    [t, type, mailType, dpoEmail, urlAccess, mainDomain, userEmail],
  );

  const initialEmail = useMemo(
    () => {
      if (!isNil(userEmails)) {
        const { email } = find(userEmails, ['id', userEmailId]) || {};
        return email;
      }
      return null;
    },
    [userEmails, userEmailId],
  );

  const onPassToOpen = useCallback(
    () => patchRequest(id),
    [id],
  );

  const onPassToOpenSuccess = useCallback(
    () => {
      const sentAt = moment().toISOString();
      return dispatch(updateDatabox(id, { status: OPEN, sentAt }, { action: SENDING, role: 'owner' }));
    },
    [dispatch, id],
  );

  const { wrappedFetch: handlePassToOpen } = useFetchCallback(
    onPassToOpen,
    { onSuccess: onPassToOpenSuccess },
  );

  const onDone = useCallback(
    async () => {
      if (isDraft) {
        await handlePassToOpen();
      }
      replace({ pathname });
    },
    [handlePassToOpen, isDraft, pathname, replace],
  );

  const onDelete = useCallback(
    () => deleteRequest(id),
    [id],
  );

  const onDeleteSuccess = useCallback(
    () => {
      const entities = [{ id }];
      onPreventRefetch();
      return Promise.resolve(
        dispatch(removeEntities(entities, DataboxSchema)),
        dispatch(draftActionCreators.removePaginatedId(id)),
      )
        .then(() => {
          enqueueSnackbar(t('citizen:requests.read.delete.success'), { variant: 'success' });
          replace({ pathname: HOME_PATH });
        });
    },
    [dispatch, enqueueSnackbar, id, onPreventRefetch, replace, t],
  );

  const { wrappedFetch: handleDelete } = useFetchCallback(
    onDelete,
    { onSuccess: onDeleteSuccess },
  );

  const shouldFetchAccessRequest = useMemo(
    () => !isNil(id) && isNil(urlAccess),
    [id, urlAccess],
  );

  const getAccessRequest = useCallback(
    () => fetchAccessRequest(id),
    [id],
  );

  const onGetAccessRequestSuccess = useCallback(
    ({ token, ...rest }) => Promise.all([
      dispatch(setUrlAccessRequest(id, token)),
      dispatch(setDataboxMeta(id, getDataboxMeta(rest))),
    ]),
    [dispatch, id],
  );

  const navigationProps = useMemo(
    () => ({
      homePath: HOME_PATH,
      toolbarProps: { maxWidth: 'md' },
      gutterBottom: true,
    }),
    [],
  );

  const mailto = useMemo(
    () => encodeMailto(dpoEmail, subject, body),
    [dpoEmail, subject, body],
  );

  const onClickMailto = useCallback(
    () => {
      replace({
        pathname,
        search: getNextSearch(search, new Map([
          [CONFIRM_KEY, 'ensure'],
        ])),
      });
    },
    [pathname, replace, search],
  );

  const onClickCopyPaste = useCallback(
    () => {
      replace({
        pathname,
        search: getNextSearch(search, new Map([
          [CONFIRM_KEY, 'copyPaste'],
        ])),
      });
    },
    [pathname, replace, search],
  );

  const mailtoProps = useMailtoProps(mailto, onClickMailto);

  const addEmailTo = useMemo(
    () => ({
      pathname,
      search: getNextSearch(search, new Map([
        [CONFIG_KEY, 'provider'],
      ])),
      ...locationRest,
    }),
    [pathname, search, locationRest],
  );

  const primary = useMemo(
    () => {
      const basePrimaryProps = {
        standing: BUTTON_STANDINGS.MAIN,
        text: t('common:send'),
      };

      if (mailer === 'mailto') {
        return ({
          ...mailtoProps,
          ...basePrimaryProps,
        });
      }
      return {
        ...basePrimaryProps,
        onClick: onClickCopyPaste,
      };
    },
    [mailtoProps, mailer, t, onClickCopyPaste],
  );

  const { isFetching: isFetchingAccessRequest } = useFetchEffect(
    getAccessRequest,
    { shouldFetch: shouldFetchAccessRequest },
    { onSuccess: onGetAccessRequestSuccess },
  );

  const items = useMemo(
    () => ([<BoxEllipsisApplicationLink application={application} key="applicationAvatar" />]),
    [application],
  );

  const screenProps = useMemo(
    () => ({
      state: { isFetching: isFetchingRequest || isFetchingAccessRequest },
      appBarProps: { items },
    }),
    [isFetchingAccessRequest, isFetchingRequest, items],
  );

  return (
    <ScreenAction
      {...screenProps}
      title={t('citizen:contact.preview.title')}
      navigationProps={navigationProps}
      navigation={(
        <ThemeProvider theme={themeforType}>
          {isDraft && (
            <MenuChangeStatus
              isValidRequest={!isTypeUnknown}
              onPassToOpen={handlePassToOpen}
              onDelete={handleDelete}
            />
          )}
          {!isTypeUnknown && <Button {...primary} />}
        </ThemeProvider>
      )}
    >
      <ThemeProvider theme={themeforType}>
        <Container maxWidth="md">
          <ExpansionPanelContactFrom
            databox={request}
            appName={name}
            initialEmail={initialEmail}
            contactEmail={contactEmail}
            options={options}
            addButton={(
              <Button
                startIcon={<AddIcon />}
                standing={BUTTON_STANDINGS.TEXT}
                text={t('citizen:contact.email.add')}
                component={Link}
                to={addEmailTo}
                replace
              />
          )}
          />
          <CardContactTo application={application} my={2} />
          <ExpansionPanelContactRequestType request={request} disabled={!isDraft} />
          {!isTypeUnknown && (
            <>
              <BoxContactMailType my={2} />
              <CardContactBody>
                {body}
              </CardContactBody>
            </>
          )}
          <ContactConfig
            searchKey={CONFIG_KEY}
            userId={userId}
            userEmails={userEmails}
            databox={request}
          />
          <ContactConfirm
            searchKey={CONFIRM_KEY}
            contactEmail={contactEmail}
            mailto={dpoEmail}
            subject={subject}
            body={body}
            onDone={onDone}
          />
        </Container>

      </ThemeProvider>

    </ScreenAction>
  );
};

DraftRequest.propTypes = {
  t: PropTypes.func.isRequired,
  application: PropTypes.shape(ApplicationSchema.propTypes),
  request: PropTypes.shape(DataboxSchema.propTypes),
  isFetchingRequest: PropTypes.bool.isRequired,
  onPreventRefetch: PropTypes.func.isRequired,
  themeforType: PropTypes.func.isRequired,
  // withUserEmails
  userEmails: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
  userId: PropTypes.string,
  // CONNECT
  contactEmail: PropTypes.string,
  mailer: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

DraftRequest.defaultProps = {
  application: null,
  request: null,
  userId: null,
  userEmails: null,
  contactEmail: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  contactEmail: state.screens.contact.contactEmail,
  mailer: state.devicePreferences.mailer,
});

export default connect(mapStateToProps)(
  withUserEmails((withTranslation(['common', 'citizen'])(DraftRequest))),
);
