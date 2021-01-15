import { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { APPBAR_SPACING } from '@misakey/ui/constants/sizes';
import { openVaultValidationSchema } from 'constants/validationSchemas/auth';
import { PREHASHED_PASSWORD } from '@misakey/auth/constants/method';
import { invalid } from '@misakey/ui/constants/errorTypes';
import { SIDES } from '@misakey/ui/constants/drawers';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import useLoadSecretsWithPassword from '@misakey/crypto/hooks/useLoadSecretsWithPassword';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';
import FormField from '@misakey/ui/Form/Field';

import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import AppBarDrawer from 'components/smart/Screen/Drawer/AppBar';
import FormHelperTextInCard from '@misakey/ui/FormHelperText/InCard';
import CardUserSignOut from '@misakey/auth/components/Card/User/SignOut';
import FieldPasswordRevealable from '@misakey/ui/Form/Field/Password/Revealable';
import BoxControls from '@misakey/ui/Box/Controls';
import Box from '@material-ui/core/Box';
import BoxContent from '@misakey/ui/Box/Content';
import Title from '@misakey/ui/Typography/Title';

// CONSTANTS
const INITIAL_VALUES = {
  [PREHASHED_PASSWORD]: '',
};

// HOOKS
const useStyles = makeStyles(() => ({
  cardOverflowVisible: {
    overflow: 'visible',
  },
}));

// COMPONENTS
function VaultLocked({ t }) {
  const classes = useStyles();

  const openVaultWithPassword = useLoadSecretsWithPassword();

  const currentUser = useSelector(getCurrentUserSelector);
  const { displayName, avatarUrl, identifierValue } = useSafeDestr(currentUser);

  const onSubmit = useCallback(
    ({ [PREHASHED_PASSWORD]: password }, { setFieldError }) => openVaultWithPassword(password)
      .catch(() => {
        setFieldError(PREHASHED_PASSWORD, invalid);
      }),
    [openVaultWithPassword],
  );

  useUpdateDocHead(t('boxes:vault.lockedScreen.documentTitle'));

  return (
    <>
      <AppBarDrawer side={SIDES.LEFT}>
        <OpenDrawerAccountButton />
      </AppBarDrawer>
      <BoxContent
        mt={APPBAR_SPACING}
      >
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          overflow="hidden"
          flexWrap="wrap"
        >
          <Title align="center" gutterBottom={false}>{t('boxes:vault.lockedScreen.text')}</Title>
        </Box>
        <Formik
          onSubmit={onSubmit}
          initialValues={INITIAL_VALUES}
          validationSchema={openVaultValidationSchema}
        >
          <Box component={Form} display="flex" flexDirection="column" width="100%" justifyContent="center">
            <CardUserSignOut
              my={3}
              className={classes.cardOverflowVisible}
              avatarUrl={avatarUrl}
              displayName={displayName}
              identifier={identifierValue}
            >
              <FormField
                name={PREHASHED_PASSWORD}
                variant="filled"
                component={FieldPasswordRevealable}
                helperText={t('boxes:vault.lockedScreen.helperText')}
                margin="none"
                inputProps={{ 'data-matomo-ignore': true }}
                FormHelperTextProps={{ component: FormHelperTextInCard }}
                fullWidth
                autoFocus
              />
            </CardUserSignOut>
            <BoxControls
              primary={{
                type: 'submit',
                text: t('common:unlock'),
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
};

export default withTranslation(['common', 'boxes'])(VaultLocked);
