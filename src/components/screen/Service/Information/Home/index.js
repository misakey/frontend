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
import ColorizedAvatar from '@misakey/ui/Avatar/Colorized';
import ListDataItem from 'components/dumb/List/Data/Item';
import LimitedList from 'components/dumb/List/Limited';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';


import './index.scss';

// CONSTANTS
const MAX_DOMAIN = 3;

// HOOKS
const useStyles = makeStyles(theme => ({
  box: {
    marginTop: theme.spacing(3),
  },
}));

// COMPONENTS
const FieldItem = ({ field, mainDomain, t }) => {
  const [key, value] = Object.entries(field)[0];
  const linkTo = useMemo(
    () => generatePath(routes.service.information[key], { mainDomain }),
    [mainDomain, key],
  );

  return (
    <ListDataItem
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

const ServiceInformationHome = ({ service, t }) => {
  const classes = useStyles();

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
    () => (!isNil(mainDomain) ? generatePath(routes.service.information.logo._, { mainDomain }) : ''),
    [mainDomain],
  );

  if (service) {
    return (
      <Container className="card">
        <Typography variant="h4" component="h3" align="center">
          {t('service:information.title')}
        </Typography>
        <BoxSection className={classes.box}>
          <Typography variant="h6">
            {t('service:information.home.title')}
          </Typography>
          <Typography variant="body2" color="textSecondary" className="subtitle">
            {t('service:information.home.subtitle')}
          </Typography>
          <List className="details">
            <FieldItem field={{ name }} mainDomain={mainDomain} t={t} />
            <ListDataItem
              ariaAction={t('fields:logo.action')}
              label={t('fields:logo.label')}
              text={{ primary: t('fields:logo.placeholder') }}
              action={(
                <ColorizedAvatar
                  text={name}
                  image={logoUri}
                />
              )}
              linkTo={logoLinkTo}
            />
            <ListDataItem
              ariaAction={t('fields:mainDomain.action')}
              label={t('fields:mainDomain.label')}
              text={{ primary: mainDomain }}
              disabled
            />
            <ListDataItem
              ariaAction={t('fields:otherDomains.action')}
              label={t('fields:otherDomains.label')}
              disabled
            >
              <LimitedList
                items={domainsList}
                limit={MAX_DOMAIN}
                extraText={t('fields:otherDomains.placeholder')}
                renderListItem={
                  domainItem => (
                    <ListItem key={domainItem.id} dense disableGutters>
                      <ListItemText>{domainItem.uri}</ListItemText>
                    </ListItem>
                  )
                }
              />
            </ListDataItem>
            <FieldItem field={{ shortDesc }} mainDomain={mainDomain} t={t} />
            <FieldItem field={{ longDesc }} mainDomain={mainDomain} t={t} />
          </List>
        </BoxSection>
      </Container>
    );
  }

  return null;
};

ServiceInformationHome.propTypes = {

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
  service: null,
};

export default withTranslation(['service', 'fields'])(ServiceInformationHome);
