import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { ACCEPTED_TYPES } from 'constants/file/image';
import routes from 'routes';

import generatePath from '@misakey/helpers/generatePath';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import FileField from 'components/dumb/Form/Field/File';

import Navigation from 'components/dumb/Navigation';

const FIELD = 'logo';
const PREVIEW = 'preview';

// HOOKS
const useOnChange = (mainDomain, setValues, setTouched, history) => useCallback((file, preview) => {
  setValues({
    [FIELD]: file,
    [PREVIEW]: preview,
  });
  setTouched({
    [FIELD]: true,
    [PREVIEW]: true,
  }, false);
  history.push(generatePath(routes.admin.service.information.logo._, { mainDomain }));
}, [setValues, setTouched, history, mainDomain]);

// COMPONENTS
// @FIXME: I used Formik#setValues, because I couldn't trigger change with field#onChange
// find a way to use Field#onChange and trigger form change if possible
const ServiceLogoUpload = ({ service, t, setValues, setTouched, history }) => {
  const onChange = useOnChange(service.mainDomain, setValues, setTouched, history);

  const pushPath = useMemo(
    () => generatePath(routes.admin.service.information.logo._, { mainDomain: service.mainDomain }),
    [service.mainDomain],
  );

  return (
    <div id="ServiceInformationLogoUpload">
      <Navigation
        history={history}
        pushPath={pushPath}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('service:information.logo.upload.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('service:information.logo.upload.subtitle')}
        </Typography>
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
  // formik
  setValues: PropTypes.func.isRequired,
  setTouched: PropTypes.func.isRequired,
  // ROUTER
  history: PropTypes.object.isRequired,
};

ServiceLogoUpload.defaultProps = {
  service: null,
};

export default withTranslation('service')(ServiceLogoUpload);
