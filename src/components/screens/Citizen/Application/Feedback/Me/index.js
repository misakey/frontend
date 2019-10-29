import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';

import { generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { Formik, Field, Form } from 'formik';
import { makeStyles } from '@material-ui/core/styles';

import API from '@misakey/api';
import routes from 'routes';


import ApplicationSchema from 'store/schemas/Application';
import { ratingForm } from 'constants/validationSchemas/ratings';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import isNil from '@misakey/helpers/isNil';
import pick from '@misakey/helpers/pick';

import Navigation from '@misakey/ui/Navigation';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import withMyFeedback from 'components/smart/withMyFeedback';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import FieldText from '@misakey/ui/Form/Field/Text';
import FieldRating from 'components/dumb/Form/Field/Rating';
import TypographySubtitle from 'components/dumb/Typography/Subtitle';
import ScreenError from 'components/dumb/Screen/Error';

import './index.scss';

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

// HELPERS
const pickInitialValues = pick([VALUE_FIELD, COMMENT_FIELD]);

const postFeedback = (applicationId, userId, form) => API
  .use(POST_RATING_ENDPOINT)
  .build(null, objectToSnakeCase({ userId, applicationId, ...form }))
  .send();


// HOOKS
const useStyles = makeStyles((theme) => ({
  overflowContent: {
    // view height - navigation gutter - navigation border - navigation height - appbar height
    height: `calc(100vh - ${theme.spacing(3)}px - 1px - 4rem - 4rem)`,
    overflow: 'auto',
  },
  ratingRoot: {
    fontSize: theme.typography.h2.fontSize,
  },
  ratingIconFilled: {
    color: theme.palette.secondary.main,
  },
  textInputMultiline: {
    overflow: 'hidden',
  },
}));

const useOnSubmit = (application, userId, enqueueSnackbar, setError, history, t) => useCallback(
  (form, { setSubmitting }) => {
    const { id, mainDomain } = application;
    return postFeedback(id, userId, form)
      .then(() => {
        enqueueSnackbar(t('screens:feedback.me.success'), { variant: 'success' });
        history.push(generatePath(routes.citizen.application.info, { mainDomain }));
      })
      .catch(({ httpStatus }) => {
        setError(httpStatus);
      })
      .finally(() => { setSubmitting(false); });
  },
  [application, userId, enqueueSnackbar, setError, history, t],
);

// COMPONENTS
// @FIXME move to @misakey/ui
const FeedbackMeScreen = ({ application, userId, rating, history, match: { params }, t }) => {
  const classes = useStyles();

  const { enqueueSnackbar } = useSnackbar();

  const [error, setError] = useState();

  const { mainDomain } = params;

  const goBackPath = useMemo(
    () => (isNil(mainDomain)
      ? null
      : generatePath(routes.citizen.application.info, { mainDomain })),
    [mainDomain],
  );

  const initialValues = useMemo(
    () => (isNil(rating) ? INITIAL_VALUES : pickInitialValues(rating)),
    [rating],
  );

  const onCancel = useCallback(
    () => {
      if (history.length > 1) {
        history.goBack();
      } else {
        history.push(goBackPath);
      }
    },
    [goBackPath, history],
  );

  const onSubmit = useOnSubmit(application, userId, enqueueSnackbar, setError, history, t);

  if (error) {
    return <ScreenError httpStatus={error} />;
  }

  return (
    <div>
      <Navigation
        history={history}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('screens:feedback.me.title')}
      />
      <div className={classes.overflowContent}>
        <Container
          maxWidth="md"
        >
          <TypographySubtitle>
            {t('screens:feedback.me.subtitle')}
          </TypographySubtitle>
          <Box my={3}>
            <Formik
              validationSchema={ratingForm}
              onSubmit={onSubmit}
              initialValues={initialValues}
              enableReinitialize
            >
              {({ isSubmitting, isValid }) => (
                <Form className="form">
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
                  <Box my={3} className="controls">
                    <Button onClick={onCancel}>
                      {t('cancel')}
                    </Button>
                    <ButtonSubmit Icon={null} text={t('feedback.submit')} isSubmitting={isSubmitting} isValid={isValid} />
                  </Box>
                </Form>
              )}
            </Formik>
          </Box>
        </Container>
      </div>
    </div>
  );
};

FeedbackMeScreen.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  rating: PropTypes.shape({
    value: PropTypes.number,
    comment: PropTypes.string,
  }),
  userId: PropTypes.string,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
    goBack: PropTypes.func.isRequired,
    length: PropTypes.number.isRequired,
  }).isRequired,
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  t: PropTypes.func.isRequired,
};

FeedbackMeScreen.defaultProps = {
  rating: null,
  userId: null,
};

export default withMyFeedback()(withTranslation(['common', 'screens', 'fields'])(FeedbackMeScreen));
