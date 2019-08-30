import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';


import generatePath from '@misakey/helpers/generatePath';
import isNil from '@misakey/helpers/isNil';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Navigation from 'components/dumb/Navigation';
import ButtonCopy from '@misakey/ui/Button/Copy';


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
const SSOMainDomain = ({
  t,
  service,
  history,
}) => {
  const pushPath = useMemo(
    () => (isNil(service) ? '' : generatePath(PARENT_ROUTE, { mainDomain: service.mainDomain })),
    [service],
  );

  if (isNil(service)) { return null; }

  const { mainDomain } = service;

  return (
    <>
      <Navigation history={history} appBarProps={APP_BAR_PROPS} pushPath={pushPath} hideBackButton={false} title={t('service:sso.mainDomain.title')} />
      <Container maxWidth="sm" className="screen">

        <Typography variant="body2" color="textSecondary" align="left" gutterBottom>
          {t('service:sso.mainDomain.subtitle')}
        </Typography>
        {mainDomain && (
          <div className="form">
            <TextField
              margin="normal"
              fullWidth
              variant="outlined"
              className="field"
              type="text"
              name="mainDomain"
              label={t('fields:mainDomain.label')}
              value={mainDomain}
              disabled
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <ButtonCopy
                      color="default"
                      mode="icon"
                      edge="end"
                      value={mainDomain}
                    />

                  </InputAdornment>
                ),
              }}
            />
          </div>
        )}
      </Container>
    </>
  );
};

SSOMainDomain.propTypes = {
  service: PropTypes.shape({ mainDomain: PropTypes.string }),
  // router props
  history: PropTypes.object.isRequired,
  // withTranslation HOC
  t: PropTypes.func.isRequired,
  // CONNECT dispatch
};

SSOMainDomain.defaultProps = {
  service: null,
};

export default withTranslation(['service', 'fields', 'common'])(SSOMainDomain);
