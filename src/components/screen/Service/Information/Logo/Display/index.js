import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Field } from 'formik';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from 'components/dumb/Navigation';
import Button from '@material-ui/core/Button';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';

import routes from 'routes';

import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';
import generatePath from '@misakey/helpers/generatePath';

import './index.scss';


// CONSTANTS
const APP_BAR_PROPS = {
  color: 'inherit',
  elevation: 0,
  position: 'static',
};
const FIELD_PATH = ['field', 'value'];

// HELPERS
const getPreview = path(FIELD_PATH);

// COMPONENTS
const ServiceLogoDisplay = ({ t, isSubmitting, isValid, service, history }) => {
  const { logoUri, mainDomain, name } = useMemo(() => (isNil(service) ? {} : service), [service]);

  const linkTo = useMemo(
    () => (!isNil(mainDomain) ? generatePath(routes.service.information.logo.upload, { mainDomain }) : ''),
    [mainDomain],
  );

  const pushPath = useMemo(
    () => generatePath(routes.service.information._, { mainDomain }),
    [mainDomain],
  );

  if (isNil(service)) { return null; }
  return (
    <div className="Display">
      <div className="header">
        <Navigation history={history} appBarProps={APP_BAR_PROPS} pushPath={pushPath} hideBackButton={false} title={t('service:information.logo.title')} />
        <Typography variant="body2" color="textSecondary" align="left" className="subtitle">
          {t('service:information.logo.subtitle')}
        </Typography>
      </div>
      <Container maxWidth="sm" className="content">
        <Field
          name="preview"
          render={(fieldProps) => {
            const preview = getPreview(fieldProps);
            const image = isNil(preview) ? logoUri : preview;
            return (
              <AvatarDetailed
                image={image}
                text={name}
              />
            );
          }}
        />
        <div className="controls">
          <Button
            variant="contained"
            to={linkTo}
            component={Link}
            aria-label={t('common:update')}
          >
            {t('common:update')}
          </Button>
          <ButtonSubmit disabled={isSubmitting || !isValid} aria-label={t('common:submit')} />
        </div>
      </Container>
    </div>
  );
};

ServiceLogoDisplay.propTypes = {
  t: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,

  service: PropTypes.shape({
    logoUri: PropTypes.string,
    name: PropTypes.string,
    mainDomain: PropTypes.string,
  }),
  history: PropTypes.object.isRequired,

};

ServiceLogoDisplay.defaultProps = {
  service: null,
};

export default withTranslation(['common', 'service'])(ServiceLogoDisplay);
