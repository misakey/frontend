import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { ACCEPTED_TYPES } from 'constants/file/image';
import routes from 'routes';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import FileField from 'components/dumb/Form/Field/File';

import Navigation from 'components/dumb/Navigation';

import 'components/screens/Account/Avatar/Upload/index.scss';

const PREVIEW = 'preview';

// HOOKS
const useOnChange = (name, setFieldValue, setFieldTouched, history) => useCallback(
  (file, preview) => {
    setFieldValue(name, file);
    setFieldTouched(name, true, false);
    setFieldValue(PREVIEW, preview);
    setFieldTouched(PREVIEW, true, false);
    history.push(routes.account.profile.avatar._);
  },
  [name, setFieldValue, setFieldTouched, history],
);

// COMPONENTS
// @FIXME: I used Formik#setFieldValue, because I couldn't trigger change with field#onChange
// find a way to use Field#onChange and trigger form change if possible
const AccountAvatarUpload = ({ name, t, setFieldValue, setFieldTouched, history }) => {
  const onChange = useOnChange(name, setFieldValue, setFieldTouched, history);

  return (
    <div className="Upload">
      <Navigation
        history={history}
        goBackPath={routes.account.profile.avatar._}
        title={t('profile:avatar.upload.title')}
        toolbarProps={{ maxWidth: 'md' }}
      />

      <Container maxWidth="md" className="content">
        <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
          {t('profile:avatar.upload.subtitle')}
        </Typography>
        <FileField
          accept={ACCEPTED_TYPES}
          onChange={onChange}
        />
      </Container>

    </div>
  );
};
AccountAvatarUpload.propTypes = {
  name: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  setFieldTouched: PropTypes.func.isRequired,
  // ROUTER
  history: PropTypes.object.isRequired,
};

export default withTranslation('button')(AccountAvatarUpload);
