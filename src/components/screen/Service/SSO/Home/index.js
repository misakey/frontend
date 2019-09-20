import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';


import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';
import generatePath from '@misakey/helpers/generatePath';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import BoxSection from '@misakey/ui/Box/Section';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ListDataItem from 'components/dumb/List/Data/Item';
import LimitedList from 'components/dumb/List/Limited';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';


import './index.scss';

// CONSTANTS
const MAX_LIST_ITEMS = 3;

// HOOKS
const useStyles = makeStyles(theme => ({
  box: {
    marginTop: theme.spacing(3),
  },
}));

const useLinkTo = (key, mainDomain) => useMemo(
  () => generatePath(routes.service.sso[key], { mainDomain }),
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

const ServiceSSOHome = ({ service, t }) => {
  const classes = useStyles();

  const {
    mainDomain,
    allowedCorsOrigins,
    redirectUri,
  } = useMemo(() => (isNil(service) ? {} : service), [service]);

  const allowedCorsOriginsList = useMemo(
    () => (isArray(allowedCorsOrigins) ? allowedCorsOrigins : []), [allowedCorsOrigins],
  );
  const redirectUriList = useMemo(
    () => (isArray(redirectUri) ? redirectUri : []), [redirectUri],
  );

  const linkToAllowedOrigins = useLinkTo('allowedOrigins', mainDomain);
  const linkToRedirectUris = useLinkTo('redirectUri', mainDomain);
  const linkToProductionSetup = useLinkTo('productionSetup', mainDomain);

  if (service) {
    return (
      <Container className="card">
        <Typography variant="h4" component="h3" align="center">
          {t('service:sso.title')}
        </Typography>
        <BoxSection className={classes.box}>
          <Typography variant="h6">
            {t('service:sso.home.title')}
          </Typography>
          <Typography variant="body2" color="textSecondary" className="subtitle">
            {t('service:sso.home.subtitle')}
          </Typography>
          <List className="details">
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
                  corsItem => (
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
                  uriItem => (
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
              <Typography variant="body2" className="accent">
                Setup mode
              </Typography>
            </ListDataItem>
            <FieldItem field={{ customRoles: t('fields:customRoles.placeholder') }} mainDomain={mainDomain} t={t} />
          </List>
        </BoxSection>
      </Container>
    );
  }

  return null;
};

ServiceSSOHome.propTypes = {

  service: PropTypes.shape({
    name: PropTypes.string,
    logoUri: PropTypes.string,
    mainDomain: PropTypes.string,
    domains: PropTypes.arrayOf(PropTypes.object),
    shortDesc: PropTypes.string,
    longDesc: PropTypes.string,
  }),

  // withTranslation
  t: PropTypes.func.isRequired,
};

ServiceSSOHome.defaultProps = {
  service: null,
};

export default withTranslation(['service', 'fields'])(ServiceSSOHome);
