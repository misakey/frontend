import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Formik, Field, Form } from 'formik';
import { makeStyles } from '@material-ui/core/styles';

import { createApplicationCitizenValidationSchema } from 'constants/validationSchemas/contribution';

import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';

import useSuspenseMaterialFix from '@misakey/hooks/useSuspenseMaterialFix';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import ScreenAction from 'components/dumb/Screen/Action';
import withApplicationCreate from 'components/smart/withApplicationCreate';


// CONSTANTS
const MAIN_DOMAIN_FIELD_NAME = 'mainDomain';
const NAVIGATION_PROPS = {
  showGoBack: false,
};

// HOOKS
const useStyles = makeStyles(() => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
}));

// COMPONENTS
const ApplicationsCreate = ({
  onCreateApplication,
  t,
}) => {
  const classes = useStyles();

  // WARNING: this is an ugly hook for workaround, use it with precaution
  const { ref, key } = useSuspenseMaterialFix();

  const { search } = useLocation();

  const { prefill } = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const isPrefilled = useMemo(() => !isNil(prefill), [prefill]);

  const initialValues = useMemo(
    () => ({ [MAIN_DOMAIN_FIELD_NAME]: isPrefilled ? prefill : '' }),
    [isPrefilled, prefill],
  );

  const onSubmit = useCallback(
    (values, formikBag) => onCreateApplication(values, formikBag, t('citizen:applications.create.success')),
    [onCreateApplication, t],
  );

  return (

    <ScreenAction
      title={t('citizen:applications.create.title')}
      navigationProps={NAVIGATION_PROPS}
    >
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" align="left">
          {t('citizen:applications.create.subtitle')}
        </Typography>
        <Formik
          validationSchema={createApplicationCitizenValidationSchema}
          onSubmit={onSubmit}
          initialValues={initialValues}
          validateOnMount={isPrefilled}
          enableReinitialize
        >
          <Container maxWidth="sm">
            <Form className={classes.form}>
              <Field
                type="text"
                inputRef={ref}
                key={key}
                name={MAIN_DOMAIN_FIELD_NAME}
                inputProps={{
                  autoComplete: 'off',
                }}
                component={FieldText}
                label={t('fields:mainDomain.altLabel')}
                helperText={t('fields:mainDomain.helperText')}
              />
              <ButtonSubmit text={t('common:submit')} />
            </Form>
          </Container>
        </Formik>
      </Container>
    </ScreenAction>
  );
};

ApplicationsCreate.propTypes = {
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  onCreateApplication: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};


export default withApplicationCreate()(withTranslation(['citizen', 'common', 'fields'])(ApplicationsCreate));
