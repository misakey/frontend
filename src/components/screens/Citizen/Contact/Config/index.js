import React, { useMemo, useCallback, lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useLocation, useHistory, useRouteMatch } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { normalize } from 'normalizr';

import API from '@misakey/api';
import { stepAddEmailValidationSchemas, confirmEmailValidationSchema } from 'constants/validationSchemas/profile';
import MANUAL_TYPE from 'constants/mail-providers/manual';
import errorTypes from '@misakey/ui/constants/errorTypes';
import UserEmailByUserIdSchema from 'store/schemas/UserEmail/ByUserId';
import UserEmailSchema from 'store/schemas/UserEmail';
import DataboxSchema from 'store/schemas/Databox';
import { setContactEmail } from 'store/actions/screens/contact';
import { setDataboxOwnerEmail } from 'store/actions/databox';
import { receiveEntities, updateEntities } from '@misakey/store/actions/entities';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { getDetails, getCode } from '@misakey/helpers/apiError';
import getSearchParams from '@misakey/helpers/getSearchParams';
import getNextSearch from '@misakey/helpers/getNextSearch';
import fromPairs from '@misakey/helpers/fromPairs';
import isNil from '@misakey/helpers/isNil';
import uniqBy from '@misakey/helpers/uniqBy';
import pick from '@misakey/helpers/pick';
import prop from '@misakey/helpers/prop';
import always from '@misakey/helpers/always';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { patchDataboxUserEmail } from 'helpers/fetchDatabox';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import Dialog from '@material-ui/core/Dialog';
import RouteFormik from 'components/smart/Route/Formik';
import RouteSearch from 'components/smart/Route/Search';
import SplashScreen from '@misakey/ui/Screen/Splash';
import Navigation from 'components/dumb/AppBar/Navigation';

// LAZY
const ContactConfigIdentifier = lazy(() => import('components/screens/Citizen/Contact/Config/Identifier'));
const ContactConfigProvider = lazy(() => import('components/screens/Citizen/Contact/Config/Provider'));
const ContactConfigConfirm = lazy(() => import('components/screens/Citizen/Contact/Config/Confirm'));

// CONSTANTS
const { conflict, forbidden } = errorTypes;

const INITIAL_VALUES = {
  type: '',
  email: '',
  userEmailId: '',
  code: '',
};

const MODAL_STEPS = {
  provider: 'provider',
  identifier: 'identifier',
  confirm: 'confirm',
};

const PREVIOUS_STEP = {
  [MODAL_STEPS.provider]: undefined,
  [MODAL_STEPS.identifier]: MODAL_STEPS.provider,
  [MODAL_STEPS.confirm]: MODAL_STEPS.identifier,
};

const PATH_VALIDATION_SCHEMA = {
  [MODAL_STEPS.provider]: stepAddEmailValidationSchemas[0],
  [MODAL_STEPS.identifier]: stepAddEmailValidationSchemas[1],
  [MODAL_STEPS.confirm]: confirmEmailValidationSchema,
};

const CREATE_USER_EMAIL_ENDPOINT = {
  method: 'POST',
  path: '/user-emails',
  auth: true,
};

const CONFIRM_USER_EMAIL_ENDPOINT = {
  method: 'POST',
  path: '/user-emails/confirm',
  auth: true,
};

const ASK_CONFIRM_ENDPOINT = {
  method: 'POST',
  path: '/user-emails/confirm/ask',
  auth: true,
};

// HELPERS
const idProp = prop('id');
const pickIdentifierProps = pick(['type', 'email']);
const uniqById = (list) => uniqBy(list, 'id');

const createUserEmail = (form, userId) => API
  .use(CREATE_USER_EMAIL_ENDPOINT)
  .build(null, objectToSnakeCase({ ...form, userId }))
  .send();

const confirmUserEmail = (form) => API
  .use(CONFIRM_USER_EMAIL_ENDPOINT)
  .build(null, objectToSnakeCase(form))
  .send();

const fetchAskConfirm = (form) => API
  .use(ASK_CONFIRM_ENDPOINT)
  .build(undefined, objectToSnakeCase(form))
  .send();

// COMPONENTS
const ContactConfig = ({
  searchKey, userId, userEmails, databox,
  dispatchActivateUserEmail, dispatchUpdateUserEmails,
  t, ...rest
}) => {
  const { path } = useRouteMatch();
  const { pathname, search } = useLocation();
  const { replace } = useHistory();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const { enqueueSnackbar } = useSnackbar();

  const start = useMemo(
    () => ({
      path,
      searchParams: {
        [searchKey]: 'provider',
      },
    }),
    [path, searchKey],
  );

  const searchKeySearchParam = useMemo(
    () => getSearchParams(search)[searchKey],
    [search, searchKey],
  );


  const navigationTitle = useMemo(
    () => t(`citizen__new:contact.configure.${searchKeySearchParam}.title`),
    [searchKeySearchParam, t],
  );

  const navigationHomePath = useMemo(
    () => {
      const nextSearchValue = PREVIOUS_STEP[searchKeySearchParam];
      return {
        pathname,
        search: getNextSearch(search, new Map([
          [searchKey, nextSearchValue],
        ])),
      };
    },
    [pathname, search, searchKey, searchKeySearchParam],
  );

  const validationSchema = useMemo(
    () => PATH_VALIDATION_SCHEMA[searchKeySearchParam],
    [searchKeySearchParam],
  );

  const searchParamsByStep = useMemo(
    () => {
      const modalStepConfigPairs = Object.values(MODAL_STEPS)
        .map((modalStep) => ([
          modalStep,
          { [searchKey]: modalStep },
        ]));
      return fromPairs(modalStepConfigPairs);
    },
    [searchKey],
  );

  const databoxId = useMemo(
    () => idProp(databox),
    [databox],
  );

  const confirmExistingUserEmail = useCallback(
    (userEmail) => {
      const { id, active } = userEmail;
      if (!active) {
        return fetchAskConfirm({ userEmailId: id })
          .then(() => userEmail)
          .catch((e) => {
            const errorCode = getCode(e);
            if (errorCode === conflict) {
              enqueueSnackbar(t('fields__new:contactConfigConfirm.code.error.conflict'), { variant: 'error' });
            } else {
              handleGenericHttpErrors(e);
            }
            return userEmail;
          });
      }
      return Promise.resolve(userEmail);
    },
    [enqueueSnackbar, handleGenericHttpErrors, t],
  );

  const onUpdateDataboxUserEmail = useCallback(
    (email, userEmailId) => Promise.all([
      patchDataboxUserEmail(databoxId, userEmailId),
      dispatchActivateUserEmail(email, userEmailId, databoxId),
    ]),
    [databoxId, dispatchActivateUserEmail],
  );

  const onClose = useCallback(
    () => {
      replace({
        pathname,
        search: getNextSearch(search, new Map([
          [searchKey, undefined],
        ])),
      });
    },
    [pathname, replace, search, searchKey],
  );

  const onProviderSubmit = useCallback(
    ({ type }) => {
      if (type === MANUAL_TYPE) {
        return Promise.resolve(
          replace({
            pathname,
            search: getNextSearch(search, new Map([
              [searchKey, MODAL_STEPS.identifier],
            ])),
          }),
        );
      }
      // @TODO handle screen navigation for gmail type
      return Promise.resolve();
    },
    [pathname, replace, search, searchKey],
  );

  const onIdentifierSubmit = useCallback(
    (values, { setErrors, setFieldValue }) => {
      const userEmail = userEmails.find(({ email }) => values.email === email);

      const promise = !isNil(userEmail)
        ? always(confirmExistingUserEmail(userEmail))
        : createUserEmail;

      return promise(pickIdentifierProps(values), userId)
        .then((response) => {
          const userEmailResponse = objectToCamelCase(response);
          dispatchUpdateUserEmails(userEmails, userEmailResponse, userId);
          return userEmailResponse;
        })
        .then((userEmailResponse) => {
          const { id, active, email } = userEmailResponse;
          if (active) {
            return Promise.all([
              onUpdateDataboxUserEmail(email, id),
              replace({
                pathname,
                search: getNextSearch(search, new Map([
                  [searchKey, undefined],
                ])),
              }),
            ]);
          }
          return Promise.all([
            setFieldValue('userEmailId', id),
            replace({
              pathname,
              search: getNextSearch(search, new Map([
                [searchKey, MODAL_STEPS.confirm],
              ])),
            })]);
        })
        .catch((e) => {
          const code = getCode(e);
          const { email } = getDetails(e);
          if (code === conflict && email === conflict) {
            setErrors({ email: conflict });
          } else {
            throw e;
          }
        });
    },
    [
      confirmExistingUserEmail, dispatchUpdateUserEmails, onUpdateDataboxUserEmail,
      pathname, replace, search, searchKey, userEmails, userId,
    ],
  );

  const onConfirmSubmit = useCallback(
    ({ email, userEmailId, code }, { setErrors }) => confirmUserEmail({ userEmailId, code })
      .then(() => Promise.all([
        onUpdateDataboxUserEmail(email, userEmailId),
        replace({
          pathname,
          search: getNextSearch(search, new Map([
            [searchKey, undefined],
          ])),
        }),
      ]))
      .catch((e) => {
        const errorCode = getCode(e);
        const { code: detailsCode } = getDetails(e);
        if (errorCode === forbidden && !isNil(detailsCode)) {
          setErrors({ code: detailsCode });
        } else {
          throw e;
        }
      }),
    [onUpdateDataboxUserEmail, pathname, replace, search, searchKey],
  );

  const onSubmit = useCallback(
    (values, actions) => {
      const { setSubmitting } = actions;

      let promise = Promise.resolve();

      if (searchKeySearchParam === MODAL_STEPS.provider) {
        promise = onProviderSubmit(values, actions);
      } else if (searchKeySearchParam === MODAL_STEPS.identifier) {
        promise = onIdentifierSubmit(values, actions);
      } else {
        promise = onConfirmSubmit(values, actions);
      }
      promise
        .catch((e) => {
          handleGenericHttpErrors(e);
        })
        .finally(() => { setSubmitting(false); });
    },
    [
      handleGenericHttpErrors,
      onConfirmSubmit,
      onIdentifierSubmit,
      onProviderSubmit,
      searchKeySearchParam,
    ],
  );

  if (isNil(searchKeySearchParam)) {
    return null;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
      <Dialog
        open
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        {...omitTranslationProps(rest)}
      >
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form>
            <Navigation
              title={navigationTitle}
              homePath={navigationHomePath}
              gutterBottom={false}
              replace
            />
            <RouteSearch
              route={RouteFormik}
              path={path}
              start={start}
              exact
              searchParams={searchParamsByStep[MODAL_STEPS.provider]}
              component={ContactConfigProvider}
            />
            <RouteSearch
              route={RouteFormik}
              path={path}
              start={start}
              exact
              searchParams={searchParamsByStep[MODAL_STEPS.identifier]}
              component={ContactConfigIdentifier}
            />
            <RouteSearch
              route={RouteFormik}
              path={path}
              start={start}
              exact
              searchParams={searchParamsByStep[MODAL_STEPS.confirm]}
              component={ContactConfigConfirm}
            />
          </Form>
        </Formik>
      </Dialog>
    </Suspense>
  );
};

ContactConfig.propTypes = {
  searchKey: PropTypes.string.isRequired,
  userId: PropTypes.string,
  userEmails: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
  databox: PropTypes.shape(DataboxSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  dispatchActivateUserEmail: PropTypes.func.isRequired,
  dispatchUpdateUserEmails: PropTypes.func.isRequired,
};

ContactConfig.defaultProps = {
  userId: null,
  userEmails: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateUserEmails: (userEmails, userEmail, userId) => {
    // @FIXME maybe implement a dedicated action in entities store
    // lodash syntax
    const nextUserEmails = uniqById([...userEmails, userEmail]);
    const normalized = normalize(
      { userEmails: nextUserEmails, userId },
      UserEmailByUserIdSchema.entity,
    );
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
  },
  dispatchActivateUserEmail: (email, userEmailId, databoxId) => {
    const entities = [{ id: userEmailId, changes: { active: true } }];

    return Promise.all([
      dispatch(updateEntities(entities, UserEmailSchema.entity)),
      dispatch(setDataboxOwnerEmail(databoxId, email)),
      dispatch(setContactEmail(email)),
    ]);
  },
});

export default connect(null, mapDispatchToProps)(withTranslation('citizen__new')(ContactConfig));
