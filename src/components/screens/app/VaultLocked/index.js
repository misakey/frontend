import React, { useCallback, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { useSelector } from 'react-redux';

import { APPBAR_SPACING } from '@misakey/ui/constants/sizes';
import { openVaultValidationSchema } from 'constants/validationSchemas/auth';
import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';
import useLoadSecretsWithPassword from '@misakey/crypto/hooks/useLoadSecretsWithPassword';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { SIDES } from '@misakey/ui/constants/drawers';

import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import FormField from '@misakey/ui/Form/Field';

import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import ChipUser from '@misakey/ui/Chip/User';
import FieldTextPasswordRevealable from 'components/dumb/Form/Field/Text/Password/Revealable';
import BoxControls from '@misakey/ui/Box/Controls';
import Box from '@material-ui/core/Box';
import BoxContent from '@misakey/ui/Box/Content';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import useSignOut from '@misakey/auth/hooks/useSignOut';
import { UserManagerContext } from '@misakey/auth/components/OidcProvider';
import Title from '@misakey/ui/Typography/Title';

// CONSTANTS
const { invalid } = errorTypes;
const INITIAL_VALUES = {
  [PREHASHED_PASSWORD]: '',
};

// COMPONENTS
function VaultLocked({ t, isDrawerOpen }) {
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
      <AppBarDrawer side={SIDES.LEFT} isDrawerOpen={isDrawerOpen}>
        <OpenDrawerAccountButton />
      </AppBarDrawer>
      <BoxContent
        mt={APPBAR_SPACING}
      >
        <Box
          component={Trans}
          display="flex"
          justifyContent="flex-start"
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
          <Box component={Form} display="flex" flexDirection="column" width="100%" justifyContent="center">
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
          </Box>
        </Formik>
      </BoxContent>
    </>
  );
}

VaultLocked.propTypes = {
  t: PropTypes.func.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
};

export default withTranslation(['common', 'boxes'])(VaultLocked);
