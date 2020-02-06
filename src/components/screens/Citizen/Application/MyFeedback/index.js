import React, { useState, useMemo, useCallback } from 'react';
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
import pick from '@misakey/helpers/pick';

import ButtonSubmit from 'components/dumb/Button/Submit';

import BoxControls from 'components/dumb/Box/Controls';
import SplashScreen from 'components/dumb/SplashScreen';
import Screen from 'components/dumb/Screen';
import Navigation from 'components/dumb/Navigation';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import withMyFeedback from 'components/smart/withMyFeedback';
import FieldText from 'components/dumb/Form/Field/Text';
import FieldRating from 'components/dumb/Form/Field/Rating';
import ScreenError from 'components/dumb/Screen/Error';

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
  application, userId, enqueueSnackbar, setError, history, t, rating, dispatchClearAvgRating,
) => useCallback(
  (form, { setSubmitting }) => {
    const { id, mainDomain } = application;
    return postFeedback(id, userId, form, rating)
      .then(() => {
        enqueueSnackbar(t('screens:feedback.me.success'), { variant: 'success' });
        dispatchClearAvgRating(mainDomain, history);
      })
      .catch(({ httpStatus }) => {
        setError(httpStatus);
      })
      .finally(() => { setSubmitting(false); });
  },
  [application, userId, enqueueSnackbar, setError, history, t, rating, dispatchClearAvgRating],
);

// COMPONENTS
// @FIXME move to @misakey/ui
const ApplicationMyFeedback = ({
  application,
  userId,
  rating,
  isFetchingRating,
  history,
  match: { params },
  t,
  deleteMyFeedback,
  dispatchClearAvgRating,
  screenProps,
}) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [error, setError] = useState();

  const { mainDomain } = params;

  const goBackPath = useMemo(
    () => (isNil(mainDomain)
      ? null
      : generatePath(routes.citizen.application.feedback, { mainDomain })),
    [mainDomain],
  );

  const initialValues = useMemo(
    () => (isNil(rating) ? INITIAL_VALUES : pickInitialValues(rating)),
    [rating],
  );

  const onDelete = useCallback(
    () => {
      deleteMyFeedback()
        .then(() => {
          if (history.length > 1) {
            history.goBack();
          } else {
            history.push(goBackPath);
          }
        });
    },
    [goBackPath, history, deleteMyFeedback],
  );

  const onSubmit = useOnSubmit(
    application,
    userId,
    enqueueSnackbar,
    setError,
    history,
    t,
    rating,
    dispatchClearAvgRating,
  );

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <Screen {...screenProps}>
      <Navigation
        history={history}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('screens:feedback.me.title')}
      />
      {(isFetchingRating) ? (
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
              {({ isSubmitting, isValid }) => (
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
                    primary={(
                      <ButtonSubmit
                        text={t('feedback.submit')}
                        isSubmitting={isSubmitting}
                        isValid={isValid}
                      />
                    )}
                    secondary={!isNil(rating) ? (
                      <Button onClick={onDelete} className={classes.deleteButton}>
                        {t('delete')}
                      </Button>
                    ) : undefined}
                  />
                </Form>
              )}
            </Formik>
          </Box>
        </Container>
      )}
    </Screen>
  );
};

ApplicationMyFeedback.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  rating: PropTypes.shape({
    value: PropTypes.number,
    comment: PropTypes.string,
  }),
  isFetchingRating: PropTypes.bool,
  deleteMyFeedback: PropTypes.func.isRequired,
  userId: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    length: PropTypes.number.isRequired,
  }).isRequired,
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  t: PropTypes.func.isRequired,
  // CONNECT
  dispatchClearAvgRating: PropTypes.func.isRequired,
  screenProps: PropTypes.object.isRequired,
};

ApplicationMyFeedback.defaultProps = {
  isFetchingRating: true,
  rating: null,
  userId: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  // @FIXME implement a less tricky way to force update of page rose screen
  dispatchClearAvgRating: (mainDomain, history) => {
    const entities = [{ id: mainDomain, changes: { avgRating: null } }];
    dispatch(updateEntities(entities, ApplicationSchema.entity));
    history.push(generatePath(routes.citizen.application.feedback, { mainDomain }));
  },
});

export default connect(null, mapDispatchToProps)(withMyFeedback()(withTranslation(['common', 'screens', 'fields'])(ApplicationMyFeedback)));
