import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { Formik, Field, Form } from 'formik';
import { makeStyles } from '@material-ui/core/styles';

import { createApplicationDpoValidationSchema } from 'constants/validationSchemas/contribution';

import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';

import useSuspenseMaterialFix from '@misakey/hooks/useSuspenseMaterialFix';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import AppBarNavigation from 'components/dumb/AppBar/Navigation';
import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';
import Screen from 'components/dumb/Screen';
import withApplicationCreate from 'components/smart/withApplicationCreate';

// CONSTANTS
const MAIN_DOMAIN_FIELD_NAME = 'mainDomain';
const DPO_EMAIL_FIELD_NAME = 'dpoEmail';

// HOOKS
const useStyles = makeStyles(() => ({
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
}));

// COMPONENTS
const ServicesCreate = ({
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
    () => ({ [MAIN_DOMAIN_FIELD_NAME]: isPrefilled ? prefill : '', dpoEmail: '' }),
    [isPrefilled, prefill],
  );

  const onSubmit = useCallback(
    (values, formikBag) => onCreateApplication(values, formikBag, t('dpo:services.create.success')),
    [onCreateApplication, t],
  );

  return (
    <Screen>
      <AppBarNavigation
        toolbarProps={{ maxWidth: 'md' }}
        title={t('dpo:services.create.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" align="left">
          {t('dpo:services.create.subtitle')}
        </Typography>
        <Formik
          validationSchema={createApplicationDpoValidationSchema}
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
              <Field
                type="text"
                name={DPO_EMAIL_FIELD_NAME}
                inputProps={{
                  autoComplete: 'off',
                }}
                component={FieldText}
                label={t('fields:dpoEmail.label')}
                helperText={t('fields:dpoEmail.helperText')}
              />
              <ButtonSubmit text={t('common:next')} />
            </Form>
          </Container>
        </Formik>
      </Container>
    </Screen>
  );
};

ServicesCreate.propTypes = {
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  onCreateApplication: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withApplicationCreate()(withTranslation(['dpo', 'common', 'fields'])(ServicesCreate));
