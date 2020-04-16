import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { useHistory } from 'react-router-dom';
import { Field } from 'formik';
import { withTranslation } from 'react-i18next';

import { ACCEPTED_TYPES } from 'constants/file/image';
import routes from 'routes';

import Container from '@material-ui/core/Container';
import FileField from 'components/dumb/Form/Field/File';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ScreenAction from 'components/dumb/Screen/Action';

// CONSTANTS
const NAVIGATION_PROPS = {
  homePath: routes.account._,
};

// COMPONENTS
const AccountAvatarUpload = ({
  name,
  previewName,
  state,
  t,
}) => {
  const { push } = useHistory();

  const onUpload = useCallback(
    () => {
      push(routes.account.profile.avatar._);
    },
    [push],
  );

  return (
    <ScreenAction
      title={t('account:avatar.upload.title')}
      state={state}
      navigationProps={NAVIGATION_PROPS}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('account:avatar.upload.subtitle')}
        </Subtitle>
        <Field
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
  t: PropTypes.func.isRequired,
};

AccountAvatarUpload.defaultProps = {
  state: {},
};

export default withTranslation('account_new')(AccountAvatarUpload);
