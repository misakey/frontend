import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import moment from 'moment';

import API from '@misakey/api';

import { IS_PLUGIN } from 'constants/plugin';
import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';
import UserEmailSchema from 'store/schemas/UserEmail';
import { setDataboxMeta, setUrlAccessRequest } from 'store/actions/databox';

import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';
import getNextSearch from '@misakey/helpers/getNextSearch';
import mapDates from '@misakey/helpers/mapDates';
import propEq from '@misakey/helpers/propEq';
import prop from '@misakey/helpers/prop';
import find from '@misakey/helpers/find';
import compose from '@misakey/helpers/compose';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import encodeMailto from 'helpers/encodeMailto';
import { updateEntities, removeEntities } from '@misakey/store/actions/entities';
import useFetchCallback from '@misakey/hooks/useFetch/callback';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useMailtoProps from 'hooks/useMailtoProps';

import Container from '@material-ui/core/Container';
import ExpansionPanelContactFrom from 'components/smart/ExpansionPanel/Contact/From';
import CardContactTo from 'components/dumb/Card/Contact/To';
import CardContactSubject from 'components/smart/Card/Contact/Subject';
import CardContactBody from 'components/dumb/Card/Contact/Body';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import { getStyleForContainerScroll } from 'components/dumb/Screen';
import ScreenAction from 'components/dumb/Screen/Action';
import ContactConfig from 'components/screens/Citizen/Contact/Config';
import ContactConfirm from 'components/screens/Citizen/Contact/Confirm';
import BoxEllipsisApplication from 'components/dumb/Box/Ellipsis/Application';

import AddIcon from '@material-ui/icons/Add';
import withUserEmails from 'components/smart/withUserEmails';
import { OPEN, DRAFT } from 'constants/databox/status';
import MenuChangeStatus from './ChangeStatusMenu';

// CONSTANTS
const NAV_BAR_HEIGHT = 57;
const CONFIG_KEY = 'config';
const CONFIRM_KEY = 'confirm';
const HOME_PATH = routes.citizen._;

const patchRequest = (id) => API
  .use(API.endpoints.application.box.update)
  .build({ id }, { status: OPEN })
  .send();

const deleteRequest = (id) => API
  .use(API.endpoints.application.box.delete)
  .build({ id })
  .send();

const fetchAccessRequest = (id) => API.use(API.endpoints.application.box.requestAccess)
  .build({ id })
  .send();

// HELPERS
const isUserEmailActive = propEq('active', true);
const getEmailId = prop('userEmailId');
const getDataboxMeta = compose(
  ({ dpoEmail, owner }) => ({ dpoEmail, owner: objectToCamelCase(owner) }),
  objectToCamelCase,
);

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

// COMPONENTS
const DraftRequest = ({
  dispatch,
  request,
  application,
  userEmails,
  userId,
  contactEmail,
  isFetchingRequest,
  t,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const { search, pathname, ...locationRest } = useLocation();
  const { replace } = useHistory();

  const searchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const { urlAccess, id, status } = useMemo(() => request || {}, [request]);

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
    () => t('citizen:contact.email.subject.value'),
    [t],
  );

  const body = useMemo(
    () => t(
      `citizen:contact.email.body.${mailType}`,
      {
        dpoEmail,
        databoxURL: urlAccess,
        mainDomain,
        ...mapDates(request),
      },
    ),
    [t, mailType, dpoEmail, urlAccess, mainDomain, request],
  );

  const initialEmail = useMemo(
    () => {
      if (!isNil(userEmails)) {
        const { email } = find(userEmails, ['id', getEmailId(request)]) || {};
        return email;
      }
      return null;
    },
    [userEmails, request],
  );

  const onPassToOpen = useCallback(
    () => patchRequest(id),
    [id],
  );

  const onPassToOpenSuccess = useCallback(
    () => {
      const sentAt = moment().toISOString();
      const entities = [{ id, changes: { status: OPEN, sentAt } }];
      dispatch(updateEntities(entities, DataboxSchema));
    },
    [dispatch, id],
  );

  const { wrappedFetch: handlePassToOpen } = useFetchCallback(
    onPassToOpen,
    { onSuccess: onPassToOpenSuccess },
  );

  const onDone = useCallback(
    async () => {
      if (status === DRAFT) {
        await handlePassToOpen();
      }
      replace({ pathname });
    },
    [handlePassToOpen, pathname, replace, status],
  );

  const onDelete = useCallback(
    () => deleteRequest(id),
    [id],
  );

  const onDeleteSuccess = useCallback(
    () => {
      const entities = [{ id }];
      return Promise.resolve(dispatch(removeEntities(entities, DataboxSchema)))
        .then(() => {
          enqueueSnackbar(t('citizen:requests.read.delete.success'), { variant: 'success' });
          replace({ pathname: HOME_PATH });
        });
    },
    [dispatch, enqueueSnackbar, id, replace, t],
  );

  const { wrappedFetch: handleDelete } = useFetchCallback(
    onDelete,
    { onSuccess: onDeleteSuccess },
  );

  // @FIXME add type portability only when erasing is implemented
  const shouldFetchAccessRequest = useMemo(
    () => (!isNil(id) && isNil(urlAccess) /* && type === PORTABILITY */),
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
      gutterBottom: !IS_PLUGIN,
    }),
    [],
  );

  const mailto = useMemo(
    () => encodeMailto(dpoEmail, subject, body),
    [dpoEmail, subject, body],
  );

  const onClick = useCallback(
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

  const mailtoProps = useMailtoProps(mailto, onClick);

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
    () => ({
      ...mailtoProps,
      standing: BUTTON_STANDINGS.MAIN,
      text: t('common:send'),
    }),
    [mailtoProps, t],
  );

  const { isFetching: isFetchingAccessRequest } = useFetchEffect(
    getAccessRequest,
    { shouldFetch: shouldFetchAccessRequest },
    { onSuccess: onGetAccessRequestSuccess },
  );

  const items = useMemo(
    () => ([<BoxEllipsisApplication application={application} key="applicationAvatar" />]),
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
        <>
          {status === DRAFT && (
            <MenuChangeStatus onPassToOpen={handlePassToOpen} onDelete={handleDelete} />
          )}
          <Button {...primary} />
        </>
      )}
    >
      <Container maxWidth="md" className={clsx({ [classes.container]: IS_PLUGIN })}>
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
        <CardContactSubject my={2} subject={subject} />
        <CardContactBody>
          {body}
        </CardContactBody>
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
    </ScreenAction>
  );
};

DraftRequest.propTypes = {
  t: PropTypes.func.isRequired,
  application: PropTypes.shape(ApplicationSchema.propTypes),
  request: PropTypes.shape(DataboxSchema.propTypes),
  isFetchingRequest: PropTypes.bool.isRequired,
  // withUserEmails
  userEmails: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
  userId: PropTypes.string,
  // CONNECT
  contactEmail: PropTypes.string,
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
});

export default connect(mapStateToProps)(
  withUserEmails((withTranslation(['common', 'citizen'])(DraftRequest))),
);
