import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { ACCEPTED_TYPES } from 'constants/file/image';
import routes from 'routes';

import Container from '@material-ui/core/Container';
import FileField from 'components/dumb/Form/Field/File';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ScreenAction from 'components/dumb/Screen/Action';

// HOOKS
const useOnChange = (name, previewName, setValues, setTouched, history) => useCallback(
  (file, preview) => {
    setValues({
      [name]: file,
      [previewName]: preview,
    });
    setTouched({
      [name]: true,
      [previewName]: true,
    }, false);
    history.replace(routes.account.profile.avatar._);
  },
  [history, name, previewName, setTouched, setValues],
);

// COMPONENTS
// @FIXME: I used Formik#setFieldValue, because I couldn't trigger change with field#onChange
// find a way to use Field#onChange and trigger form change if possible
const AccountAvatarUpload = ({
  name,
  previewName,
  state,
  t,
  setValues,
  setTouched,
  history,
}) => {
  const onChange = useOnChange(name, previewName, setValues, setTouched, history);

  return (
    <ScreenAction
      title={t('account:avatar.upload.title')}
      state={state}
      appBarProps={{ withSearchBar: false }}
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('account:avatar.upload.subtitle')}
        </Subtitle>
        <FileField
          accept={ACCEPTED_TYPES}
          onChange={onChange}
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
  setValues: PropTypes.func.isRequired,
  setTouched: PropTypes.func.isRequired,
  // ROUTER
  history: PropTypes.object.isRequired,
};

AccountAvatarUpload.defaultProps = {
  state: {},
};

export default withTranslation('account_new')(AccountAvatarUpload);
