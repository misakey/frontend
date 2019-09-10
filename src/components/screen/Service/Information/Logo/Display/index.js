import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Field } from 'formik';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Navigation from '@misakey/ui/Navigation';
import Button from '@material-ui/core/Button';
import ButtonSubmit from '@misakey/ui/Button/Submit';
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
          <Field
            name="preview"
            render={(fieldProps) => {
              const preview = getPreview(fieldProps);
              const image = isNil(preview) ? logoUri : preview;

              return <AvatarDetailed image={image} text={name} />;
            }}
          />
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
