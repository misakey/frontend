import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Field } from 'formik';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from 'components/dumb/Navigation';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import ButtonSubmit from 'components/dumb/Button/Submit';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import BoxSection from '@misakey/ui/Box/Section';

import routes from 'routes';

import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';
import generatePath from '@misakey/helpers/generatePath';

const FIELD_PATH = ['field', 'value'];

// HELPERS
const getPreview = path(FIELD_PATH);

// COMPONENTS
const ServiceLogoDisplay = ({ t, isSubmitting, isValid, errors, service, history }) => {
  const { logoUri, mainDomain, name } = useMemo(() => (isNil(service) ? {} : service), [service]);

  const linkTo = useMemo(
    () => (!isNil(mainDomain) ? generatePath(routes.admin.service.information.logo.upload, { mainDomain }) : ''),
    [mainDomain],
  );

  const pushPath = useMemo(
    () => generatePath(routes.admin.service.information._, { mainDomain }),
    [mainDomain],
  );

  const errorList = useMemo(() => Object.entries(errors), [errors]);

  if (isNil(service)) { return null; }
  return (
    <div id="ServiceInformationLogoDisplay">
      <Navigation
        history={history}
        pushPath={pushPath}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('service:information.logo.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('service:information.logo.subtitle')}
        </Typography>
        <BoxSection>
          {/* @FIXME create a standard component based on material-ui for field */}
          <Field
            name="preview"
            render={(fieldProps) => {
              const preview = getPreview(fieldProps);
              const image = isNil(preview) ? logoUri : preview;

              return <AvatarDetailed image={image} text={name} />;
            }}
          />
          {errorList.map(([field, error]) => (
          // @FIXME use standard error display with a new Material Field
            <FormHelperText className="error" key={error} error>{t(`fields:${field}.error.${error}`)}</FormHelperText>
          ))}
          <Box display="flex" justifyContent="center">
            <Button
              to={linkTo}
              color="secondary"
              component={Link}
            >
              {t('common:update')}
            </Button>
            <Box
              disabled={isSubmitting || !isValid}
              component={ButtonSubmit}
              ml={1}
            >
              {t('common:submit')}
            </Box>
          </Box>
        </BoxSection>
      </Container>
    </div>
  );
};

ServiceLogoDisplay.propTypes = {
  t: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  isValid: PropTypes.bool.isRequired,
  errors: PropTypes.objectOf(PropTypes.string),
  service: PropTypes.shape({
    logoUri: PropTypes.string,
    name: PropTypes.string,
    mainDomain: PropTypes.string,
  }),
  history: PropTypes.object.isRequired,

};

ServiceLogoDisplay.defaultProps = {
  service: null,
  errors: {},
};

export default withTranslation(['common', 'service', 'fields'])(ServiceLogoDisplay);
