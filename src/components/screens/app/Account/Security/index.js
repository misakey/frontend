import React, { useMemo } from 'react';
import routes from 'routes';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import IdentitySchema from 'store/schemas/Identity';

import isNil from '@misakey/helpers/isNil';
import ScreenAction from 'components/dumb/Screen/Action';
import Divider from '@material-ui/core/Divider';
import Container from '@material-ui/core/Container';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import AccountPassword from 'components/screens/app/Account/Security/Password';
import AccountMFA from 'components/screens/app/Account/Security/MFA';

// COMPONENTS
const AccountSecurity = ({ t, identity, isFetching }) => {
  const { id } = useParams();

  const isLoading = useMemo(
    () => isFetching || isNil(identity),
    [identity, isFetching],
  );

  const accountHome = useGeneratePathKeepingSearchAndHash(routes.identities._, { id });

  const navigationProps = useMemo(
    () => ({
      homePath: accountHome,
    }),
    [accountHome],
  );

  return (
    <ScreenAction
      title={t('account:security.title')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md">
        <AccountPassword identity={identity} />
        <Divider style={{ margin: '2rem 0' }} />
        <AccountMFA identity={identity} />
      </Container>
    </ScreenAction>
  );
};

AccountSecurity.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,

  // withTranslation HOC
  t: PropTypes.func.isRequired,
};

AccountSecurity.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation('account')(AccountSecurity);
