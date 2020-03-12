import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import isArray from '@misakey/helpers/isArray';
import generatePath from '@misakey/helpers/generatePath';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import BoxSection from '@misakey/ui/Box/Section';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import ListItemData from 'components/dumb/ListItem/Data';
import LimitedList from 'components/dumb/List/Limited';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Screen from 'components/dumb/Screen';

// CONSTANTS
const MAX_DOMAIN = 3;

// COMPONENTS
const FieldItem = ({ field, mainDomain, t }) => {
  const [key, value] = Object.entries(field)[0];
  const linkTo = useMemo(
    () => generatePath(routes.admin.service.information[key], { mainDomain }),
    [mainDomain, key],
  );

  return (
    <ListItemData
      ariaAction={t(`fields:${key}.action`)}
      linkTo={linkTo}
      label={t(`fields:${key}.label`)}
      text={{ primary: value }}
      action={<ChevronRightIcon className="icon" />}
    />
  );
};
FieldItem.propTypes = {
  field: PropTypes.objectOf(PropTypes.string).isRequired,
  mainDomain: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

const ServiceInformationHome = ({ appBarProps, service, t }) => {
  const {
    name,
    logoUri,
    mainDomain,
    domains,
    shortDesc,
    longDesc,
  } = useMemo(() => (isNil(service) ? {} : service), [service]);

  const domainsList = useMemo(() => (isArray(domains) ? domains : []), [domains]);

  const logoLinkTo = useMemo(
    () => (!isNil(mainDomain) ? generatePath(routes.admin.service.information.logo._, { mainDomain }) : ''),
    [mainDomain],
  );

  if (service) {
    return (
      <Screen appBarProps={appBarProps}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h3" align="center">
            {t('admin:information.title')}
          </Typography>
          <BoxSection my={3} p={0}>
            <Box p={3}>
              <Typography variant="h6">
                {t('admin:information.home.title')}
              </Typography>
              <Typography variant="body2" color="textSecondary" className="subtitle">
                {t('admin:information.home.subtitle')}
              </Typography>
            </Box>
            <List className="details">
              <FieldItem field={{ name }} mainDomain={mainDomain} t={t} />
              <ListItemData
                ariaAction={t('fields:logo.action')}
                label={t('fields:logo.label')}
                text={{ primary: t('fields:logo.placeholder') }}
                action={(<AvatarColorized text={name} image={logoUri} />)}
                linkTo={logoLinkTo}
              />
              <ListItemData
                ariaAction={t('fields:mainDomain.action')}
                label={t('fields:mainDomain.label')}
                text={{ primary: mainDomain }}
                disabled
              />
              <ListItemData
                ariaAction={t('fields:otherDomains.action')}
                label={t('fields:otherDomains.label')}
                disabled
              >
                <LimitedList
                  items={domainsList}
                  limit={MAX_DOMAIN}
                  extraText={t('fields:otherDomains.placeholder')}
                  renderListItem={
                    (domainItem) => (
                      <ListItem key={domainItem.id} dense disableGutters>
                        <ListItemText>{domainItem.uri}</ListItemText>
                      </ListItem>
                    )
                  }
                />
              </ListItemData>
              <FieldItem field={{ shortDesc }} mainDomain={mainDomain} t={t} />
              <FieldItem field={{ longDesc }} mainDomain={mainDomain} t={t} />
            </List>
          </BoxSection>
        </Container>
      </Screen>
    );
  }

  return null;
};

ServiceInformationHome.propTypes = {
  appBarProps: PropTypes.shape({
    shift: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.node),
  }),
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

ServiceInformationHome.defaultProps = {
  appBarProps: null,
  service: null,
};

export default withTranslation(['admin', 'fields'])(ServiceInformationHome);
