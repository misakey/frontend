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
const useOnChange = (name, previewName, setFieldValue, setFieldTouched, history) => useCallback(
  (file, preview) => {
    setFieldValue(name, file);
    setFieldTouched(name, true, false);
    setFieldValue(previewName, preview);
    setFieldTouched(previewName, true, false);
    history.push(routes.account.profile.avatar._);
  },
  [name, previewName, setFieldValue, setFieldTouched, history],
);

// COMPONENTS
// @FIXME: I used Formik#setFieldValue, because I couldn't trigger change with field#onChange
// find a way to use Field#onChange and trigger form change if possible
const AccountAvatarUpload = ({
  name,
  previewName,
  state,
  t,
  setFieldValue,
  setFieldTouched,
  history,
}) => {
  const onChange = useOnChange(name, previewName, setFieldValue, setFieldTouched, history);

  return (
    <ScreenAction
      title={t('screens:account.avatar.upload.title')}
      state={state}
      pushPath={routes.account._}
      hideAppBar
    >
      <Container maxWidth="md">
        <Subtitle>
          {t('screens:account.avatar.upload.subtitle')}
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
  setFieldValue: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  // ROUTER
  history: PropTypes.object.isRequired,
};

AccountAvatarUpload.defaultProps = {
  state: {},
};

export default withTranslation('screens')(AccountAvatarUpload);
