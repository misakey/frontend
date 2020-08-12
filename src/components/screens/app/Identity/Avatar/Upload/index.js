import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useHistory, useParams } from 'react-router-dom';
import FormField from '@misakey/ui/Form/Field';
import { withTranslation } from 'react-i18next';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import { ACCEPTED_TYPES } from 'constants/file/image';
import routes from 'routes';

import Container from '@material-ui/core/Container';
import FileField from 'components/dumb/Form/Field/File';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import ScreenAction from 'components/dumb/Screen/Action';

// COMPONENTS
const AccountAvatarUpload = ({
  name,
  previewName,
  state,
  t,
}) => {
  const { push } = useHistory();
  const { id } = useParams();

  const homePath = useGeneratePathKeepingSearchAndHash(routes.accounts._, { id });
  const avatarPath = useGeneratePathKeepingSearchAndHash(routes.accounts.avatar._, { id });

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
      state={state}
      navigationProps={navigationProps}
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
AccountAvatarUpload.propTypes = {
  name: PropTypes.string.isRequired,
  previewName: PropTypes.string.isRequired,
  state: PropTypes.object,
  // withTranslation
  t: PropTypes.func.isRequired,
};

AccountAvatarUpload.defaultProps = {
  state: {},
};

export default withTranslation('account')(AccountAvatarUpload);
