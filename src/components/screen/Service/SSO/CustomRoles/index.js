import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';


import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import BoxSection from '@misakey/ui/Box/Section';
import Navigation from 'components/dumb/Navigation';


// CONSTANTS
const APP_BAR_PROPS = {
  color: 'inherit',
  elevation: 0,
  position: 'static',
  maxWidth: 'sm',
  component: Container,
};

const PARENT_ROUTE = routes.service.sso._;

// COMPONENTS
const SSOCustomRoles = ({
  t,
  service,
  history,
}) => {
  const [roles] = useState([]);

  const rolesEmpty = useMemo(() => roles.length === 0, [roles]);

  const pushPath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  if (isNil(service)) { return null; }

  return (
    <>
      <Navigation history={history} appBarProps={APP_BAR_PROPS} pushPath={pushPath} hideBackButton={false} title={t('service:sso.customRoles.title')}>
        <IconButton edge="end" type="button" color="secondary" disabled>
          <AddIcon />
        </IconButton>
      </Navigation>
      <Container maxWidth="sm" className="screen">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('service:sso.customRoles.subtitle')}
        </Typography>
        {rolesEmpty && (
          <BoxSection className="box" mt={3}>
            <Typography variant="h6" color="textPrimary" className="title" gutterBottom>
              {t('fields:customRoles.empty.label')}
            </Typography>
            <Box mt={3} display="flex" justifyContent="center">
              <Button
                type="submit"
                variant="contained"
                color="secondary"
                disabled
              >
                {t('fields:customRoles.empty.action')}
              </Button>
            </Box>
          </BoxSection>
        )}
      </Container>
    </>
  );
};

SSOCustomRoles.propTypes = {
  service: PropTypes.shape({ mainDomain: PropTypes.string }),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
};

SSOCustomRoles.defaultProps = {
  service: null,
};

export default withTranslation(['service', 'fields', 'common'])(SSOCustomRoles);
