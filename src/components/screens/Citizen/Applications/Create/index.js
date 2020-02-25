import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Formik, Field, Form } from 'formik';
import { makeStyles } from '@material-ui/core/styles';

import { mainDomainValidationSchema } from 'constants/validationSchemas/information';

import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';

import useSuspenseMaterialFix from '@misakey/hooks/useSuspenseMaterialFix';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Navigation from 'components/dumb/Navigation';
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';
import Screen from 'components/dumb/Screen';
import withApplicationCreate from 'components/smart/withApplicationCreate';


// CONSTANTS
const MAIN_DOMAIN_FIELD_NAME = 'mainDomain';

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
  history,
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
    (values, formikBag) => onCreateApplication(values, formikBag, t('screens:applications.create.success')),
    [onCreateApplication, t],
  );

  return (
    <Screen>
      <Navigation
        toolbarProps={{ maxWidth: 'md' }}
        history={history}
        title={t('screens:applications.create.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" align="left">
          {t('screens:applications.create.subtitle')}
        </Typography>
        <Formik
          validationSchema={mainDomainValidationSchema}
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
    </Screen>
  );
};

ApplicationsCreate.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  onCreateApplication: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};


export default withApplicationCreate()(withTranslation(['screens', 'common', 'fields'])(ApplicationsCreate));
