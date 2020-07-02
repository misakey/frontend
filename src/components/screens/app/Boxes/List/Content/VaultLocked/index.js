import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { boxInvitationLinkFieldValidationSchema } from 'constants/validationSchemas/boxes';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';

import Formik from '@misakey/ui/Formik';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import ListItemBoxesCurrent from 'components/smart/ListItem/Boxes/Current';
import { Route } from 'react-router-dom';
import Title from 'components/dumb/Typography/Title';
import FieldText from 'components/dumb/Form/Field/Text';
import Redirect from 'components/dumb/Redirect';
import { Form, Field } from 'formik';

const FIELD_NAME = 'invitationLink';
const INITIAL_VALUES = { [FIELD_NAME]: '' };

// COMPONENTS
function VaultLocked({ t }) {
  const [redirectTo, setRedirectTo] = useState(null);

  const onSubmit = useCallback(({ [FIELD_NAME]: link }) => {
    const { pathname, hash } = new URL(link);
    setRedirectTo(`${pathname}${hash}`);
  }, []);

  const getOnPaste = useCallback((submitForm) => () => {
    setTimeout(submitForm, 0);
  }, []);

  if (!isNil(redirectTo)) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      <Route
        path={routes.boxes.read._}
        component={ListItemBoxesCurrent}
      />
      <Box m={3} display="flex" flexDirection="column" height="100%" alignItems="center" justifyContent="center">
        <Title align="center">{t('boxes:list.pasteUrl.title')}</Title>
        <Box my={2} width="80%">
          <Formik
            validationSchema={boxInvitationLinkFieldValidationSchema}
            onSubmit={onSubmit}
            initialValues={INITIAL_VALUES}
          >
            {({ submitForm }) => (
              <Form>
                <Field
                  component={FieldText}
                  name={FIELD_NAME}
                  variant="standard"
                  placeholder={t('boxes:list.pasteUrl.placeholder')}
                  inputProps={{ 'aria-label': t('boxes:list.pasteUrl.title') }}
                  onPaste={getOnPaste(submitForm)}
                  fullWidth
                />
              </Form>
            )}
          </Formik>

        </Box>
        <Title>{t('common:or')}</Title>
        <Title align="center">{t('boxes:list.open')}</Title>
        <Box>
          <ButtonWithDialogPassword text={t('common:decrypt')} />
        </Box>
      </Box>
    </>
  );
}

VaultLocked.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(VaultLocked);
