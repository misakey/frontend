import React, { useCallback, useState, useMemo } from 'react';

import PropTypes from 'prop-types';
import { Form } from 'formik';
import { withTranslation } from 'react-i18next';

import { getBoxInvitationLinkFieldValidationSchema } from 'constants/validationSchemas/boxes';

import isNil from '@misakey/helpers/isNil';
import locationToString from '@misakey/helpers/locationToString';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import { useLocation } from 'react-router-dom';
import BoxEventsAppBar from 'components/screens/app/Boxes/Read/Events/AppBar';
import Formik from '@misakey/ui/Formik';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import FormField from '@misakey/ui/Form/Field';
import BoxControls from '@misakey/ui/Box/Controls';
import Redirect from '@misakey/ui/Redirect';
import FormFieldTextField from '@misakey/ui/Form/Field/TextFieldWithErrors';
import Box from '@material-ui/core/Box';
import BoxesSchema from 'store/schemas/Boxes';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import BoxContent from '@misakey/ui/Box/Content';

// CONSTANTS
const FIELD_NAME = 'invitationLink';
const INITIAL_VALUES = { [FIELD_NAME]: '' };


// COMPONENTS
function PasteBoxLinkScreen({ t, box, currentLinkMalformed }) {
  const [redirectTo, setRedirectTo] = useState(null);

  const { id } = useSafeDestr(box);

  const location = useLocation();
  const locationString = useMemo(
    () => locationToString(location),
    [location],
  );


  const boxInvitationLinkFieldValidationSchema = useMemo(
    () => getBoxInvitationLinkFieldValidationSchema(
      id,
      parseUrlFromLocation(locationString).toString(),
    ),
    [id, locationString],
  );

  const onSubmit = useCallback(
    ({ [FIELD_NAME]: link }) => {
      const { pathname: linkPathname, hash } = new URL(link);
      setRedirectTo(`${linkPathname}${hash}`);
      return Promise.resolve();
    },
    [setRedirectTo],
  );

  if (!isNil(redirectTo)) {
    return <Redirect to={redirectTo} forceRefresh />;
  }

  return (
    <>
      <AppBarStatic toolbarProps={{ px: 0 }}>
        <Box display="flex" flexDirection="column" width="100%" minHeight="inherit">
          <Box display="flex">
            <BoxEventsAppBar disabled box={box} belongsToCurrentUser={false} />
          </Box>
        </Box>
      </AppBarStatic>
      <BoxContent>
        <Box
          m={3}
          display="flex"
          height="100%"
          flexDirection="column"
        >
          <Title gutterBottom={false}>
            {currentLinkMalformed ? t('boxes:read.errors.malformed') : t('boxes:pasteLink.broken.title')}
          </Title>
          <Subtitle>{t('boxes:pasteLink.broken.subtitle')}</Subtitle>
          <Formik
            validationSchema={boxInvitationLinkFieldValidationSchema}
            initialValues={INITIAL_VALUES}
            onSubmit={onSubmit}
          >
            <Box component={Form} display="flex" flexDirection="column" width="100%">
              <FormField
                prefix="boxes."
                component={FormFieldTextField}
                name={FIELD_NAME}
                fullWidth
                variant="filled"
              />
              <BoxControls
                primary={{
                  type: 'submit',
                  text: t('common:next'),
                }}
                formik
              />
            </Box>
          </Formik>
        </Box>
      </BoxContent>
    </>
  );
}

PasteBoxLinkScreen.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes),
  currentLinkMalformed: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

PasteBoxLinkScreen.defaultProps = {
  box: null,
  currentLinkMalformed: false,
};


export default withTranslation(['common', 'boxes'])(PasteBoxLinkScreen);
