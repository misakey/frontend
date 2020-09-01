import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import { withTranslation } from 'react-i18next';

import { getBoxInvitationLinkFieldValidationSchema } from 'constants/validationSchemas/boxes';
import { APPBAR_SPACING } from '@misakey/ui/constants/sizes';
import { SIDES } from '@misakey/ui/constants/drawers';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import Formik from '@misakey/ui/Formik';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import { Link } from 'react-router-dom';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import AppBar from '@misakey/ui/AppBar';
import FormField from '@misakey/ui/Form/Field';
import BoxControls from '@misakey/ui/Box/Controls';
import Redirect from '@misakey/ui/Redirect';
import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import BoxesSchema from 'store/schemas/Boxes';
import Title from '@misakey/ui/Typography/Title';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import BoxContent from '@misakey/ui/Box/Content';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const FIELD_NAME = 'invitationLink';
const INITIAL_VALUES = { [FIELD_NAME]: '' };


// COMPONENTS
function PasteBoxLinkScreen({ t, box }) {
  const [redirectTo, setRedirectTo] = useState(null);

  const { id } = useSafeDestr(box);

  const boxInvitationLinkFieldValidationSchema = useMemo(
    () => getBoxInvitationLinkFieldValidationSchema(id), [id],
  );

  const onSubmit = useCallback(({ [FIELD_NAME]: link }) => {
    const { pathname, hash } = new URL(link);
    setRedirectTo(`${pathname}${hash}`);
  }, []);

  if (!isNil(redirectTo)) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      <AppBar
        disableOffset
        position="static"
      >
        <IconButtonAppBar
          edge="start"
          aria-label={t('common:goBack')}
          component={Link}
          to={routes.boxes._}
        >
          <ArrowBackIcon />
        </IconButtonAppBar>
        <BoxFlexFill />
        <OpenDrawerAccountButton side={SIDES.RIGHT} />
      </AppBar>
      <BoxContent pt={APPBAR_SPACING}>
        <Box
          m={3}
          display="flex"
          height="100%"
          flexDirection="column"
        >
          <Title gutterBottom={false}>{t('boxes:pasteLink.broken.title')}</Title>
          <Subtitle>{t('boxes:pasteLink.broken.subtitle')}</Subtitle>
          <Formik
            validationSchema={boxInvitationLinkFieldValidationSchema}
            initialValues={INITIAL_VALUES}
            onSubmit={onSubmit}
          >
            <Box component={Form} display="flex" flexDirection="column" width="100%">
              <FormField
                prefix="boxes."
                component={FieldTextStandard}
                name={FIELD_NAME}
                fullWidth
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
  // withTranslation
  t: PropTypes.func.isRequired,
};

PasteBoxLinkScreen.defaultProps = {
  box: null,
};


export default withTranslation(['common', 'boxes'])(PasteBoxLinkScreen);
