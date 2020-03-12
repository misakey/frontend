import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Formik, Field, Form } from 'formik';
import { makeStyles } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

import API from '@misakey/api';
import routes from 'routes';

import { updateEntities } from '@misakey/store/actions/entities';
import ApplicationSchema from 'store/schemas/Application';
import { ratingValidationSchema } from 'constants/validationSchemas/ratings';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import pick from '@misakey/helpers/pick';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import { BUTTON_STANDINGS } from 'components/dumb/Button';

import BoxControls from 'components/dumb/Box/Controls';
import Screen from 'components/dumb/Screen';
import SplashScreen from '@misakey/ui/Screen/Splash';

import AppBarNavigation from 'components/dumb/AppBar/Navigation';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import withMyFeedback from 'components/smart/withMyFeedback';
import FieldText from 'components/dumb/Form/Field/Text';
import FieldRating from 'components/dumb/Form/Field/Rating';

// CONSTANTS
const VALUE_FIELD = 'value';
const COMMENT_FIELD = 'comment';
const INITIAL_VALUES = {
  [VALUE_FIELD]: 0,
  [COMMENT_FIELD]: '',
};

const POST_RATING_ENDPOINT = {
  method: 'POST',
  path: '/ratings',
  auth: true,
};

const UPDATE_RATING_ENDPOINT = {
  method: 'PATCH',
  path: '/ratings/:id',
  auth: true,
};

// HELPERS
const pickInitialValues = pick([VALUE_FIELD, COMMENT_FIELD]);
const getErrorDetails = compose(
  pickInitialValues,
  prop('details'),
);

const postFeedback = (applicationId, userId, form, rating) => {
  if (isNil(rating)) {
    return API
      .use(POST_RATING_ENDPOINT)
      .build(null, objectToSnakeCase({ userId, applicationId, ...form }))
      .send();
  }
  return API
    .use(UPDATE_RATING_ENDPOINT)
    .build({ id: rating.id }, objectToSnakeCase(form))
    .send();
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  ratingRoot: {
    fontSize: theme.typography.h2.fontSize,
    [theme.breakpoints.down('sm')]: {
      fontSize: theme.typography.h3.fontSize,
    },
    [theme.breakpoints.down('xs')]: {
      fontSize: theme.typography.h4.fontSize,
    },
  },
  ratingIconFilled: {
    color: theme.palette.secondary.main,
  },
  textInputMultiline: {
    overflow: 'hidden',
  },
  deleteButton: {
    color: red[500],
  },
  form: {
    textAlign: 'center',
  },
}));

const useOnSubmit = (
  application,
  userId,
  enqueueSnackbar,
  history,
  t,
  rating,
  dispatchClearRatings,
  handleGenericHttpErrors,
) => useCallback(
  (form, { setSubmitting, setFieldError }) => {
    const { id, mainDomain } = application;
    return postFeedback(id, userId, form, rating)
      .then(() => {
        enqueueSnackbar(t('citizen:application.feedback.success'), { variant: 'success' });
        dispatchClearRatings(mainDomain, history);
      })
      .catch((error) => {
        const details = getErrorDetails(error);
        if (isEmpty(details)) {
          return handleGenericHttpErrors(error);
        }
        const { [VALUE_FIELD]: valueError, [COMMENT_FIELD]: commentError } = details;
        if (!isNil(valueError)) {
          setFieldError(valueError);
        }
        if (!isNil(commentError)) {
          setFieldError(commentError);
        }
        return error;
      })
      .finally(() => { setSubmitting(false); });
  },
  [
    application,
    userId,
    enqueueSnackbar,
    history,
    t,
    rating,
    dispatchClearRatings,
    handleGenericHttpErrors,
  ],
);

// COMPONENTS
const ApplicationMyFeedback = ({
  application,
  userId,
  rating,
  isFetchingFeedback,
  history,
  match: { params },
  t,
  deleteMyFeedback,
  isDeletingFeedback,
  dispatchClearRatings,
  screenProps,
}) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const { mainDomain } = params;

  const initialValues = useMemo(
    () => (isNil(rating) ? INITIAL_VALUES : pickInitialValues(rating)),
    [rating],
  );

  const onDelete = useCallback(
    () => {
      deleteMyFeedback()
        .then(() => dispatchClearRatings(mainDomain, history));
    },
    [deleteMyFeedback, dispatchClearRatings, mainDomain, history],
  );

  const onSubmit = useOnSubmit(
    application,
    userId,
    enqueueSnackbar,
    history,
    t,
    rating,
    dispatchClearRatings,
    handleGenericHttpErrors,
  );

  return (
    <Screen {...screenProps}>
      <AppBarNavigation
        toolbarProps={{ maxWidth: 'md' }}
        title={t('citizen:application.feedback.title')}
      />
      {(isFetchingFeedback) ? (
        <SplashScreen />
      ) : (
        <Container maxWidth="md">
          <Box my={3}>
            <Formik
              validationSchema={ratingValidationSchema}
              onSubmit={onSubmit}
              initialValues={initialValues}
              enableReinitialize
            >
              <Form className={classes.form}>
                <Field
                  classes={{ root: classes.ratingRoot, iconFilled: classes.ratingIconFilled }}
                  name={VALUE_FIELD}
                  component={FieldRating}
                />
                <Field
                  type="text"
                  InputProps={{ classes: { multiline: classes.textInputMultiline } }}
                  name={COMMENT_FIELD}
                  component={FieldText}
                  multiline
                  placeholder={t('fields:comment.placeholder')}
                  helperText={t('fields:comment.helperText')}
                />
                <BoxControls
                  primary={{
                    text: t('common:publish'),
                  }}
                  secondary={!isNil(rating) ? {
                    standing: BUTTON_STANDINGS.TEXT,
                    isLoading: isDeletingFeedback,
                    onClick: onDelete,
                    className: classes.deleteButton,
                    text: t('common:delete'),
                  } : undefined}
                  formik
                />
              </Form>
            </Formik>
          </Box>
        </Container>
      )}
    </Screen>
  );
};

ApplicationMyFeedback.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  // withMyFeedback
  rating: PropTypes.shape({
    value: PropTypes.number,
    comment: PropTypes.string,
  }),
  isFetchingFeedback: PropTypes.bool,
  deleteMyFeedback: PropTypes.func.isRequired,
  isDeletingFeedback: PropTypes.bool,
  userId: PropTypes.string,
  // ROUTER
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    length: PropTypes.number.isRequired,
  }).isRequired,
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  dispatchClearRatings: PropTypes.func.isRequired,
  screenProps: PropTypes.object.isRequired,
};

ApplicationMyFeedback.defaultProps = {
  isFetchingFeedback: true,
  isDeletingFeedback: false,
  rating: null,
  userId: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  // @FIXME implement a less tricky way to force update of page rose screen
  dispatchClearRatings: (mainDomain, history) => {
    const entities = [{ id: mainDomain, changes: { avgRating: null, ratings: null } }];
    dispatch(updateEntities(entities, ApplicationSchema.entity));
    if (history.length > 1) {
      history.goBack();
    } else {
      history.push(generatePath(routes.citizen.application.feedback, { mainDomain }));
    }
  },
});

export default connect(null, mapDispatchToProps)(withMyFeedback()(withTranslation(['common', 'citizen', 'fields'])(ApplicationMyFeedback)));
