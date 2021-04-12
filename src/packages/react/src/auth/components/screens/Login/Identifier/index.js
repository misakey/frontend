import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';
import { APPBAR_HEIGHT, AVATAR_SIZE, LARGE_MULTIPLIER, LARGE } from '@misakey/ui/constants/sizes';

import isEmpty from '@misakey/core/helpers/isEmpty';
import isNil from '@misakey/core/helpers/isNil';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import TitleBold from '@misakey/ui/Typography/Title/Bold';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import AvatarClientSso from '@misakey/ui/Avatar/Client/Sso';
import CardSsoWithSlope from '@misakey/react/auth/components/Card/Sso/WithSlope';
import AvatarBox from '@misakey/ui/Avatar/Box';
import TransRequireAccess from '@misakey/ui/Trans/RequireAccess';
import CardUser from '@misakey/ui/Card/User';
import AuthLoginIdentifierForm from './Form';
import AuthLoginIdentifierNoAccount from './NoAccount';

// CONSTANTS
const SLOPE_PROPS = {
  // @FIXME approximate spacing to align card content with slope
  height: APPBAR_HEIGHT + AVATAR_SIZE * LARGE_MULTIPLIER + 116,
};

// COMPONENTS
const AuthLoginIdentifier = ({
  loginChallenge,
  identity,
  userPublicData,
  client,
  identifier,
  resourceName,
  isLoading,
}) => {
  const { name } = useSafeDestr(client);

  const displayForm = useMemo(() => isNil(identity) && !isLoading, [identity, isLoading]);
  const displayNoAccount = useMemo(() => !isNil(identity) && !isLoading, [identity, isLoading]);

  return (
    <CardSsoWithSlope
      avatar={!isEmpty(resourceName) && resourceName !== name ? (
        <AvatarBox title={resourceName} size={LARGE} />
      ) : (
        <AvatarClientSso client={client} />
      )}
      slopeProps={SLOPE_PROPS}
      avatarSize={LARGE}
    >
      <TitleBold align="center" gutterBottom={false}>
        <Trans i18nKey="auth:login.identifier.title" values={{ resourceName: isEmpty(resourceName) ? name : resourceName }}>
          <span>{'{{resourceName}}'}</span>
        </Trans>
      </TitleBold>
      <Subtitle align="center">
        <TransRequireAccess i18nKey="auth:login.identifier.requireAccess.title" />
      </Subtitle>
      {isLoading && <CardUser my={3} {...userPublicData} />}
      {displayForm && (
        <AuthLoginIdentifierForm
          loginChallenge={loginChallenge}
          identifier={identifier}
        />
      )}
      {displayNoAccount && <AuthLoginIdentifierNoAccount userPublicData={userPublicData} />}
    </CardSsoWithSlope>
  );
};

AuthLoginIdentifier.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  loginChallenge: PropTypes.string.isRequired,
  identifier: PropTypes.string.isRequired,
  identity: SSO_PROP_TYPES.identity,
  userPublicData: PropTypes.object.isRequired,
  client: SSO_PROP_TYPES.client.isRequired,
  resourceName: PropTypes.string,
};

AuthLoginIdentifier.defaultProps = {
  resourceName: '',
  identity: null,
};

export default withTranslation(['auth', 'common'])(AuthLoginIdentifier);
