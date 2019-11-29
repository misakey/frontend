import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import ServiceSchema from 'store/schemas/Service';

import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';
import generatePath from '@misakey/helpers/generatePath';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import BoxSection from 'components/dumb/Box/Section';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListDataItem from 'components/dumb/List/Data/Item';
import LimitedList from 'components/dumb/List/Limited';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Screen from 'components/dumb/Screen';

// CONSTANTS
const MAX_LIST_ITEMS = 3;

// HOOKS
const useLinkTo = (key, mainDomain) => useMemo(
  () => generatePath(routes.admin.service.sso[key], { mainDomain }),
  [key, mainDomain],
);

// COMPONENTS
const FieldItem = ({ field, mainDomain, t, ...props }) => {
  const [key, value] = Object.entries(field)[0];
  const linkTo = useLinkTo(key, mainDomain);

  return (
    <ListDataItem
      ariaAction={t(`fields:${key}.action`)}
      linkTo={linkTo}
      label={t(`fields:${key}.label`)}
      text={{ primary: value }}
      action={<ChevronRightIcon className="icon" />}
      {...props}
    />
  );
};
FieldItem.propTypes = {
  field: PropTypes.objectOf(PropTypes.string).isRequired,
  mainDomain: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

const ServiceSSOHome = ({ appBarProps, service, t }) => {
  const mainDomain = useMemo(() => (isNil(service) ? null : service.mainDomain), [service]);
  const allowedCorsOrigins = useMemo(
    () => (isNil(service) ? null : service.allowedCorsOrigins),
    [service],
  );
  const redirectUris = useMemo(() => (isNil(service) ? null : service.redirectUris), [service]);

  const allowedCorsOriginsList = useMemo(
    () => (isArray(allowedCorsOrigins) ? allowedCorsOrigins : []), [allowedCorsOrigins],
  );
  const redirectUriList = useMemo(
    () => (isArray(redirectUris) ? redirectUris : []), [redirectUris],
  );

  const linkToAllowedOrigins = useLinkTo('allowedOrigins', mainDomain);
  const linkToRedirectUris = useLinkTo('redirectUri', mainDomain);
  const linkToProductionSetup = useLinkTo('productionSetup', mainDomain);

  if (service) {
    return (
      <Screen appBarProps={appBarProps}>
        <Container maxWidth="md" id="ServiceSSOHome">
          <Typography variant="h4" component="h3" align="center">
            {t('service:sso.title')}
          </Typography>
          <BoxSection my={3} p={0}>
            <Box p={3}>
              <Typography variant="h6">
                {t('service:sso.home.title')}
              </Typography>
              <Typography variant="body2" color="textSecondary" className="subtitle">
                {t('service:sso.home.subtitle')}
              </Typography>
            </Box>
            <List>
              <ListDataItem
                ariaAction={t('fields:mainDomain.action')}
                label={t('fields:mainDomain.label')}
                text={{ primary: mainDomain }}
                disabled
              />
              <ListDataItem
                ariaAction={t('fields:allowedCorsOrigins.action')}
                label={t('fields:allowedCorsOrigins.label')}
                linkTo={linkToAllowedOrigins}
                action={<ChevronRightIcon className="icon" />}
              >
                <LimitedList
                  items={allowedCorsOriginsList}
                  limit={MAX_LIST_ITEMS}
                  emptyText={t('fields:allowedCorsOrigins.empty')}
                  extraText={t('fields:allowedCorsOrigins.placeholder')}
                  renderListItem={
                    (corsItem) => (
                      <ListItem key={corsItem} dense disableGutters>
                        <ListItemText>{corsItem}</ListItemText>
                      </ListItem>
                    )
                  }
                />
              </ListDataItem>
              <ListDataItem
                ariaAction={t('fields:redirectUris.action')}
                label={t('fields:redirectUris.label')}
                linkTo={linkToRedirectUris}
                action={<ChevronRightIcon className="icon" />}
              >
                <LimitedList
                  items={redirectUriList}
                  limit={MAX_LIST_ITEMS}
                  emptyText={t('fields:redirectUris.empty')}
                  extraText={t('fields:redirectUris.placeholder')}
                  renderListItem={
                    (uriItem) => (
                      <ListItem key={uriItem} dense disableGutters>
                        <ListItemText>{uriItem}</ListItemText>
                      </ListItem>
                    )
                  }
                />
              </ListDataItem>
              <ListDataItem
                ariaAction={t('service:sso.productionSetup.action')}
                label={t('service:sso.productionSetup.title')}
                linkTo={linkToProductionSetup}
                action={<ChevronRightIcon className="icon" />}
              >
                <Typography variant="body2" color="secondary">
                  {t('mode.setup', 'Setup mode')}
                </Typography>
              </ListDataItem>
              <FieldItem
                field={{ customRoles: t('fields:customRoles.placeholder') }}
                mainDomain={mainDomain}
                t={t}
              />
            </List>
          </BoxSection>
        </Container>
      </Screen>
    );
  }

  return null;
};

ServiceSSOHome.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
  service: PropTypes.shape(ServiceSchema.propTypes),
  // withTranslation
  t: PropTypes.func.isRequired,
};

ServiceSSOHome.defaultProps = {
  appBarProps: null,
  service: null,
};

export default withTranslation(['common', 'service', 'fields'])(ServiceSSOHome);
