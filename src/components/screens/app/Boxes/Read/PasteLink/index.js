import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import { withTranslation, Trans } from 'react-i18next';
import routes from 'routes';
import { useHistory } from 'react-router-dom';

import isNil from '@misakey/helpers/isNil';
import Formik from '@misakey/ui/Formik';

import { makeStyles } from '@material-ui/core/styles/';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';

import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import FormField from '@misakey/ui/Form/Field';
import BoxControls from '@misakey/ui/Box/Controls';
import Redirect from 'components/dumb/Redirect';
import { getBoxInvitationLinkFieldValidationSchema } from 'constants/validationSchemas/boxes';
import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
import ChipUser from 'components/dumb/Chip/User';
import Box from '@material-ui/core/Box';
import BoxesSchema from 'store/schemas/Boxes';
import Title from '@misakey/ui/Typography/Title';

const FIELD_NAME = 'invitationLink';
const INITIAL_VALUES = { [FIELD_NAME]: '' };

// HOOKS
const useStyles = makeStyles((theme) => ({
  form: {
    alignSelf: 'center',
    [theme.breakpoints.up('sm')]: {
      width: '50%',
    },
    [theme.breakpoints.down('sm')]: {
      width: '100%',
    },
  },
}));

function PasteBoxLinkScreen({ t, box, isDrawerOpen, drawerWidth }) {
  const classes = useStyles();
  const [redirectTo, setRedirectTo] = useState(null);
  const history = useHistory();

  const { title, avatarUrl, id } = useMemo(() => box, [box]);

  const boxInvitationLinkFieldValidationSchema = useMemo(
    () => getBoxInvitationLinkFieldValidationSchema(id), [id],
  );

  const onSubmit = useCallback(({ [FIELD_NAME]: link }) => {
    const { pathname, hash } = new URL(link);
    setRedirectTo(`${pathname}${hash}`);
  }, []);

  const onDelete = useCallback(() => {
    history.push(routes.boxes._);
  }, [history]);

  if (!isNil(redirectTo)) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <>
      <AppBarDrawer
        side={SIDES.LEFT}
        disableOffset
        drawerWidth={drawerWidth}
        isDrawerOpen={isDrawerOpen}
      >
        <OpenDrawerAccountButton />
      </AppBarDrawer>
      <Box
        m={3}
        display="flex"
        height="100%"
        flexDirection="column"
        justifyContent="center"
      >
        <Box
          component={Trans}
          display="flex"
          justifyContent="center"
          alignItems="center"
          i18nKey="boxes:pasteLink.text"
          overflow="hidden"
          flexWrap="wrap"
        >
          <Title align="center" gutterBottom={false}>La clé pour</Title>
          <Box display="flex" flexWrap="nowrap" p={1}>
            <ChipUser
              displayName={title}
              avatarUrl={avatarUrl}
              onDelete={onDelete}
            />
          </Box>
          <Title align="center" gutterBottom={false}>
            est perdue. Pouvez-vous copier-coller le lien d&apos;invitation&nbsp;?
          </Title>
        </Box>
        <Formik
          validationSchema={boxInvitationLinkFieldValidationSchema}
          initialValues={INITIAL_VALUES}
          onSubmit={onSubmit}
        >
          <Box display="flex" width="100%" justifyContent="center">
            <Form className={classes.form}>
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
            </Form>
          </Box>

        </Formik>
      </Box>
    </>
  );
}

PasteBoxLinkScreen.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  t: PropTypes.bool.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  drawerWidth: PropTypes.string.isRequired,
};


export default withTranslation(['common', 'boxes'])(PasteBoxLinkScreen);
