import React, { useCallback, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import { openVaultValidationSchema } from 'constants/validationSchemas/auth';
import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';
import useLoadSecretsWithPassword from '@misakey/crypto/hooks/useLoadSecretsWithPassword';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import FormField from '@misakey/ui/Form/Field';

import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import AppBarDrawer, { SIDES } from 'components/dumb/AppBar/Drawer';
import ChipUser from 'components/dumb/Chip/User';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import BoxControls from '@misakey/ui/Box/Controls';
import Box from '@material-ui/core/Box';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import useSignOut from '@misakey/auth/hooks/useSignOut';
import { UserManagerContext } from '@misakey/auth/components/OidcProvider';
import Title from '@misakey/ui/Typography/Title';

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

// CONSTANTS
const { invalid } = errorTypes;
const INITIAL_VALUES = {
  [PREHASHED_PASSWORD]: '',
};

// COMPONENTS
function VaultLocked({ t, drawerWidth, isDrawerOpen }) {
  const classes = useStyles();
  const openVaultWithPassword = useLoadSecretsWithPassword();
  const userManagerContext = useContext(UserManagerContext);
  const logout = useSignOut(userManagerContext.userManager);

  const currentUser = useSelector(getCurrentUserSelector);
  const { displayName, avatarUrl } = useMemo(() => currentUser || {}, [currentUser]);

  const onSubmit = useCallback(
    ({ [PREHASHED_PASSWORD]: password }, { setFieldError }) => openVaultWithPassword(password)
      .catch(() => {
        setFieldError(PREHASHED_PASSWORD, invalid);
      }),
    [openVaultWithPassword],
  );

  return (
    <>
      <AppBarDrawer side={SIDES.LEFT} drawerWidth={drawerWidth} isDrawerOpen={isDrawerOpen}>
        <OpenDrawerAccountButton />
      </AppBarDrawer>
      <Box
        m={3}
        display="flex"
        flexGrow={1}
        flexDirection="column"
        justifyContent="center"
      >
        <Box
          component={Trans}
          display="flex"
          justifyContent="center"
          alignItems="center"
          overflow="hidden"
          flexWrap="wrap"
          i18nKey="boxes:vault.lockedScreen.text"
        >
          <Title align="center" gutterBottom={false}>Quel est le mot de passe pour votre coffre-fort </Title>
          <Box display="flex" flexWrap="nowrap" p={1}>
            <ChipUser
              displayName={displayName}
              avatarUrl={avatarUrl}
              onDelete={logout}
            />
          </Box>
          <Title align="center" gutterBottom={false}>&nbsp;?</Title>
        </Box>
        <Formik
          onSubmit={onSubmit}
          initialValues={INITIAL_VALUES}
          validationSchema={openVaultValidationSchema}
        >
          <Box display="flex" width="100%" justifyContent="center">
            <Form className={classes.form}>
              <FormField
                name={PREHASHED_PASSWORD}
                component={FieldTextPasswordRevealable}
                helperText={null}
                inputProps={{ 'data-matomo-ignore': true }}
                fullWidth
                autoFocus
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

VaultLocked.propTypes = {
  t: PropTypes.func.isRequired,
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
};

export default withTranslation(['common', 'boxes'])(VaultLocked);
