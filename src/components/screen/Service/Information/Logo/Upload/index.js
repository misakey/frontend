import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { ACCEPTED_TYPES } from 'constants/file/image';
import routes from 'routes';

import generatePath from '@misakey/helpers/generatePath';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import FileField from '@misakey/ui/Form/Field/File';

import Navigation from '@misakey/ui/Navigation';

import './index.scss';

// CONSTANTS
const APP_BAR_PROPS = {
  color: 'inherit',
  elevation: 0,
  position: 'static',
};

const FIELD = 'logo';
const PREVIEW = 'preview';

// HOOKS
const useOnChange = (mainDomain, setFieldValue, history) => useCallback((file, preview) => {
  setFieldValue(FIELD, file);
  setFieldValue(PREVIEW, preview);
  history.push(generatePath(routes.service.information.logo._, { mainDomain }));
}, [mainDomain, setFieldValue, history]);

// COMPONENTS
// @FIXME: I used Formik#setFieldValue, because I couldn't trigger change with field#onChange
// find a way to use Field#onChange and trigger form change if possible
const ServiceLogoUpload = ({ service, t, setFieldValue, history }) => {
  const onChange = useOnChange(service.mainDomain, setFieldValue, history);

  return (
    <div className="Upload">
      <div className="header">
        <Navigation history={history} appBarProps={APP_BAR_PROPS} pushPath={routes.service.information.logo._} hideBackButton={false} title={t('service:logo.upload.title')} />
        <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
          {t('service:logo.upload.subtitle')}
        </Typography>
      </div>

      <Container maxWidth="sm" className="content">
        <FileField
          accept={ACCEPTED_TYPES}
          onChange={onChange}
        />
      </Container>

    </div>
  );
};
ServiceLogoUpload.propTypes = {
  service: PropTypes.shape({ mainDomain: PropTypes.string }),
  t: PropTypes.func.isRequired,
  setFieldValue: PropTypes.func.isRequired,
  // ROUTER
  history: PropTypes.object.isRequired,
};

ServiceLogoUpload.defaultProps = {
  service: null,
};

export default withTranslation('service')(ServiceLogoUpload);
