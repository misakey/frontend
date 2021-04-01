import React, { useMemo, useCallback } from 'react';

import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import FormField from '@misakey/ui/Form/Field';
import { withTranslation } from 'react-i18next';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import { ACCEPTED_TYPES } from '@misakey/ui/constants/file/image';
import authRoutes from '@misakey/react/auth/routes';

import Container from '@material-ui/core/Container';
import FileField from '@misakey/ui/Form/Field/File';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import ScreenAction from '@misakey/ui/Screen/Action';

// COMPONENTS
const IdentityAvatarUpload = ({
  name,
  previewName,
  isLoading,
  t,
}) => {
  const { push } = useHistory();
  const { id } = useParams();

  // @FIXME until we change structure, parent is public profile
  const homePath = useGeneratePathKeepingSearchAndHash(authRoutes.identities.public, { id });
  const avatarPath = useGeneratePathKeepingSearchAndHash(authRoutes.identities.avatar._, { id });

  const navigationProps = useMemo(
    () => ({
      homePath,
    }),
    [homePath],
  );

  const onUpload = useCallback(
    () => {
      push(avatarPath);
    },
    [avatarPath, push],
  );

  return (
    <ScreenAction
      title={t('account:avatar.upload.title')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('account:avatar.upload.subtitle')}
        </Subtitle>
        <FormField
          component={FileField}
          accept={ACCEPTED_TYPES}
          name={name}
          previewName={previewName}
          onUpload={onUpload}
        />
      </Container>
    </ScreenAction>
  );
};
IdentityAvatarUpload.propTypes = {
  name: PropTypes.string.isRequired,
  previewName: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

IdentityAvatarUpload.defaultProps = {
  isLoading: false,
};

export default withTranslation('account')(IdentityAvatarUpload);
