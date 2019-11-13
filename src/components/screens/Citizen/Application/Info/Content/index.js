import React, { useCallback, useState, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { generatePath } from 'react-router-dom';

import routes from 'routes';
import { connect } from 'react-redux';

import ApplicationSchema from 'store/schemas/Application';

import { withUserManager } from '@misakey/auth/components/OidcProvider';

import isArray from '@misakey/helpers/isArray';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import some from '@misakey/helpers/some';
import countries from 'i18n-iso-countries';

import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import BoxSection from 'components/dumb/Box/Section';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import MUILink from '@material-ui/core/Link';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import LongText from 'components/dumb/LongText';
import GridListKeyValue from 'components/dumb/Grid/List/KeyValue';

import ApplicationInfoContentDomains from 'components/screens/Citizen/Application/Info/Content/Domains';
import Skeleton from '@material-ui/lab/Skeleton';
import MyFeedbackCard from 'components/dumb/Card/Feedback/My';
import SummaryFeedbackCard from 'components/dumb/Card/Feedback/Summary';
import withMyFeedback from 'components/smart/withMyFeedback';

import { redirectToApp } from 'helpers/plugin';

// CONSTANTS
const requiredLinksType = ['privacy_policy', 'tos', 'terms', 'legal_notice', 'cookies', 'personal_data', 'dpo_contact'];

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
  },
  titleWithButton: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  openInNew: {
    marginLeft: theme.spacing(1),
    display: 'none',
    [theme.breakpoints.up('md')]: {
      display: 'inherit',
    },
  },
  openInNewIconButton: {
    [theme.breakpoints.up('md')]: {
      display: 'none',
    },
  },
  button: {
    borderRadius: 0,
    borderTop: `1px solid ${theme.palette.grey.A100}`,
    padding: theme.spacing(2, 3),
  },
}));

// COMPONENTS
const getTranslationCustomizer = (prefix) => {
  const translatedValues = {
    serviceType: [
      'personal', 'public_organization', 'private_non_profit_organization',
      'private_for_profit_organization', 'collaborative',
    ],
    privacyJuridiction: ['eu', 'outside_eu'],
    mainIncome: [
      'advertising', 'volunteering', 'benefactions', 'trade_in_services',
      'trade_in_products', 'trade_in_data', 'public_funding', 'private_funding',
    ],
  };

  const match = (value, key) => {
    const whitelist = translatedValues[key];
    return whitelist && whitelist.includes(value);
  };
  const format = (value, key, t) => (
    <Typography variant="body2">
      {t(`screens:application.info${prefix}.values.${key}.${value}`)}
    </Typography>
  );

  return [match, format];
};

const getPrivacyShieldCustomizer = () => {
  const match = (value, key) => key === 'privacyJuridiction' && value === 'eu_us_privacy_shield';
  const format = (value, key, t) => (
    <Typography variant="body2">
      {t('screens:application.info.primary.values.privacyJuridiction.eu_us_privacy_shield')}
    </Typography>
  );

  return [match, format];
};

const getHomeCountryCustomizer = (lng) => {
  const match = (value, key) => key === 'homeCountry';
  const format = (value) => (
    <Typography variant="body2">
      {countries.getName(value, lng)}
    </Typography>
  );

  return [match, format];
};

const useSignInRedirect = (userManager, mainDomain) => useCallback(() => {
  // @FIXME: remove when auth inside plugin popup is implemented
  if (window.env.PLUGIN) {
    redirectToApp(generatePath(routes.citizen.application._, { mainDomain }));
  } else {
    userManager.signinRedirect();
  }
}, [userManager, mainDomain]);

const getMissingLinkCustomizer = (t, handleClick, isAuthenticated, signInRedirect) => {
  const match = (value, key) => requiredLinksType.includes(key) && isNil(value);
  const format = () => {
    if (isAuthenticated) {
      return (
        <MUILink onClick={handleClick} color="primary" component="button">
          {t('screens:application.info.userContribution.linkOpenDialog')}
        </MUILink>
      );
    }

    return (
      <MUILink onClick={signInRedirect} component="button">
        {t('screens:application.info.userContribution.missingLinkNotConnected')}
      </MUILink>
    );
  };

  return [match, format];
};

function OnLoading({ classes }) {
  return (
    <Container className={classes.root} maxWidth={false}>
      <BoxSection mb={3} p={0}>
        <Box p={3}>
          <Typography variant="h6" component="h5">
            <Skeleton variant="text" style={{ marginTop: 0 }} />
          </Typography>
          <Box mt={1}>
            <Skeleton variant="text" />
          </Box>
          <Box mt={2}>
            <Skeleton variant="rect" height={120} />
          </Box>
        </Box>
      </BoxSection>
    </Container>
  );
}

OnLoading.propTypes = { classes: PropTypes.objectOf(PropTypes.string).isRequired };

const WithMyFeedbackCard = withMyFeedback(
  ({ application: { mainDomain }, ...rest }) => ({ mainDomain, ...rest }),
)(MyFeedbackCard);

const ApplicationInfoContent = ({
  entity,
  i18n,
  isLoading,
  t,
  onContributionLinkClick,
  userManager,
  isAuthenticated,
}) => {
  const classes = useStyles();

  const { homepage } = entity;
  const { language } = i18n;
  const [collapsed, collapse] = useState(true);

  const handleCollapse = useCallback(
    () => { collapse(true); },
    [collapse],
  );

  const mainDomain = useMemo(() => entity.mainDomain, [entity]);
  const signInRedirect = useSignInRedirect(userManager, mainDomain);

  const translationCustomizer = React.useMemo(() => getTranslationCustomizer('.primary'), []);
  const privacyShieldCustomizer = React.useMemo(() => getPrivacyShieldCustomizer(), []);
  const homeCountryCustomizer = React.useMemo(() => getHomeCountryCustomizer(language), [language]);
  const missingLinkCustomizer = React.useMemo(
    () => getMissingLinkCustomizer(
      t,
      onContributionLinkClick,
      isAuthenticated,
      signInRedirect,
    ),
    [t, onContributionLinkClick, isAuthenticated, signInRedirect],
  );

  // @FIXME: define if we want that behaviour or not.
  // It seems better to me to have all infos displayed at start
  // React.useEffect(() => { collapse(false); }, [entity.mainDomain]);

  const mainInfo = {
    serviceType: entity.serviceType,
    mainIncome: entity.mainIncome,
    privacyJuridiction: entity.privacyJuridiction,
    homeCountry: entity.homeCountry,
  };

  // @FIXME: fix the js-common component to work if all keys of object are null
  let otherInfo = {
    privacy_policy: null,
    tos: null,
    pleaseFixMe: 'ASAP',
  };

  if (isArray(entity.links)) {
    const links = {};
    entity.links.forEach(({ type, value }) => {
      if (otherInfo[type] !== undefined) {
        links[type] = value;
      }
    });


    otherInfo = { ...otherInfo, ...links };
  }

  const renderMainInfo = React.useMemo(
    () => some(mainInfo, (info) => !isEmpty(info)),
    [mainInfo],
  );

  const renderOtherInfo = React.useMemo(
    () => some(otherInfo, (info) => !isEmpty(info)),
    [otherInfo],
  );

  const renderDomains = React.useMemo(
    () => !isEmpty(entity.domains),
    [entity.domains],
  );

  if (isLoading) { return <OnLoading classes={classes} />; }

  if (isEmpty(entity)) { return null; }

  return (
    <Container className={classes.root} maxWidth={false}>
      <BoxSection mb={3} p={0}>
        <Box p={3}>
          <Typography variant="h6" component="h5" className={classes.titleWithButton}>
            {t('screens:application.info.desc.title')}
            {homepage && (
              <>
                <Button
                  href={homepage}
                  className={classes.openInNew}
                  target="_blank"
                >
                  <Box component="span" mr={1}>
                    {t('screens:application.info.desc.openInNew')}
                  </Box>
                  <OpenInNewIcon />
                </Button>
                <IconButton
                  aria-label={t('screens:application.info.desc.openInNew')}
                  href={homepage}
                  className={classes.openInNewIconButton}
                  target="_blank"
                  edge="end"
                >
                  <OpenInNewIcon />
                </IconButton>
              </>
            )}
          </Typography>
          <Box mt={1}>
            <LongText color="textSecondary">
              {entity.longDesc}
            </LongText>
          </Box>
          {renderMainInfo && (
            <Box mt={2}>
              <GridListKeyValue
                t={t}
                cols={2}
                object={mainInfo}
                keyPrefix="screens:application.info.primary.keys."
                customizers={[
                  translationCustomizer,
                  privacyShieldCustomizer,
                  homeCountryCustomizer,
                ]}
              />
            </Box>
          )}
        </Box>
        <Collapse in={collapsed}>
          {renderOtherInfo && (
            <Box px={3} pb={2}>
              <GridListKeyValue
                t={t}
                cols={2}
                object={otherInfo}
                hideNil={false}
                hideEmpty={false}
                omitKeys={['pleaseFixMe']}
                keyPrefix="screens:application.info.secondary.keys."
                customizers={[missingLinkCustomizer]}
              />
            </Box>
          )}
          {renderDomains && <ApplicationInfoContentDomains entity={entity} />}
        </Collapse>
        {(!collapsed && (renderOtherInfo || renderDomains)) && (
          <Button onClick={handleCollapse} color="secondary" fullWidth className={classes.button}>
            {t('seeMore', 'See more')}
          </Button>
        )}
      </BoxSection>
      <Box mb={3}>
        {isAuthenticated && <WithMyFeedbackCard application={entity} />}
      </Box>
      <Box mb={3}>
        <SummaryFeedbackCard application={entity} />
      </Box>
    </Container>
  );
};

ApplicationInfoContent.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  i18n: PropTypes.shape({ language: PropTypes.string }).isRequired,
  isLoading: PropTypes.bool,
  onContributionLinkClick: PropTypes.func.isRequired,
  userManager: PropTypes.object.isRequired,
  isAuthenticated: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

ApplicationInfoContent.defaultProps = {
  isLoading: false,
  isAuthenticated: false,
};

export default connect(
  (state) => ({
    auth: state.auth,
    isAuthenticated: !!state.auth.token,
  }),
)(withUserManager(withTranslation(['common', 'screens'])(ApplicationInfoContent)));
