import React, { useCallback, useState, useMemo } from 'react';
import { withTranslation, Trans } from 'react-i18next';
import PropTypes from 'prop-types';

import { generatePath, Link } from 'react-router-dom';

import routes from 'routes';

import { connect } from 'react-redux';

import ApplicationSchema from 'store/schemas/Application';

import API from '@misakey/api';

import isArray from '@misakey/helpers/isArray';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import { redirectToApp } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';
import useAsync from '@misakey/hooks/useAsync';


import { makeStyles } from '@material-ui/core/styles';
import BoxSection from 'components/dumb/Box/Section';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import MUILink from '@material-ui/core/Link';

import OpenInNewIcon from '@material-ui/icons/OpenInNew';

import GridListKeyValue from 'components/dumb/Grid/List/KeyValue';
import PluginDownloadCard from 'components/dumb/Card/PluginDownload';

import ApplicationInfoContentDomains from 'components/screens/Citizen/Application/Info/Content/Domains';
import Skeleton from '@material-ui/lab/Skeleton';
import MyFeedbackCard from 'components/dumb/Card/Feedback/My';
import SummaryFeedbackCard from 'components/dumb/Card/Feedback/Summary';
import Card from 'components/dumb/Card';
import withMyFeedback from 'components/smart/withMyFeedback';
import withDialogConnect from 'components/smart/Dialog/Connect/with';
import InfoContentSecurity from './Security';


// CONSTANTS
const requiredLinksType = ['privacy_policy', 'tos', 'terms', 'legal_notice', 'cookies', 'personal_data', 'dpo_contact'];
const COUNT_DATABOXES_ENDOINT = {
  method: 'HEAD',
  path: '/databoxes',
  auth: true,
};

// HELPERS
const fetchNumberOfDataboxes = () => {
  const endpoint = COUNT_DATABOXES_ENDOINT;
  return API
    .use(endpoint)
    .build()
    .send({ rawRequest: true });
};

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
  boxRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  claimButtonRoot: {
    alignSelf: 'flex-end',
  },
  typographyEmphasis: {
    color: theme.palette.secondary.main,
  },
}));

const useShouldFetch = (isFetching, error, entity, isAuthenticated) => useMemo(
  () => isAuthenticated && !isFetching && isNil(error) && entity === -1,
  [isFetching, error, entity, isAuthenticated],
);

const useGetCountDataboxes = (
  shouldFetch, setFetching, setError, setDataboxesCount,
) => useCallback(
  () => {
    if (shouldFetch) {
      setFetching(true);
      return fetchNumberOfDataboxes()
        .then((response) => {
          setDataboxesCount(parseInt(response.headers.get('X-Total-Count'), 10));
        })
        .catch(({ httpStatus }) => {
          setError(httpStatus);
        })
        .finally(() => {
          setFetching(false);
        });
    }
    return null;
  },
  [shouldFetch, setFetching, setError, setDataboxesCount],
);

// COMPONENTS
const ConnectLink = withDialogConnect(MUILink);

const getMissingLinkCustomizer = (t, handleClick) => {
  const match = (value, key) => requiredLinksType.includes(key) && isNil(value);

  const format = () => (
    <ConnectLink onClick={handleClick} color="primary" component="button">
      {t('screens:application.info.userContribution.linkOpenDialog')}
    </ConnectLink>
  );

  return [match, format];
};

function OnLoading(props) {
  return (
    <BoxSection mb={3} p={0} {...props}>
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
  );
}

const WithMyFeedbackCard = withMyFeedback(
  ({ application: { mainDomain }, ...rest }) => ({ mainDomain, ...rest }),
)(MyFeedbackCard);

const ApplicationInfoContent = ({
  entity,
  isLoading,
  t,
  onContributionLinkClick,
  onContributionDpoEmailClick,
  isAuthenticated,
}) => {
  const classes = useStyles();

  const [error, setError] = useState();
  const [isFetching, setFetching] = useState(false);
  const [databoxesCount, setDataboxesCount] = useState(-1);


  const shouldFetch = useShouldFetch(isFetching, error, databoxesCount, isAuthenticated);
  const getCountDataboxes = useGetCountDataboxes(
    shouldFetch,
    setFetching,
    setError,
    setDataboxesCount,
  );

  useAsync(getCountDataboxes);

  const { homepage } = entity;

  const mainDomain = useMemo(() => entity.mainDomain, [entity]);

  const missingLinkCustomizer = React.useMemo(
    () => getMissingLinkCustomizer(t, onContributionLinkClick),
    [t, onContributionLinkClick],
  );

  // @FIXME: define if we want that behaviour or not.
  // It seems better to me to have all infos displayed at start

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

  const renderDomains = React.useMemo(
    () => !isEmpty(entity.domains),
    [entity.domains],
  );

  const dpoClaimRoute = useMemo(
    () => generatePath(routes.dpo.service.claim._, { mainDomain }),
    [mainDomain],
  );

  const redirectToDpoClaim = useCallback(() => redirectToApp(dpoClaimRoute), [dpoClaimRoute]);

  const dpoClaimButtonPrimaryProps = useMemo(
    () => ({
      to: (IS_PLUGIN) ? undefined : dpoClaimRoute,
      onClick: (IS_PLUGIN) ? redirectToDpoClaim : undefined,
    }),
    [redirectToDpoClaim, dpoClaimRoute],
  );

  if (isLoading) { return <OnLoading classes={{ root: classes.root }} />; }

  if (isEmpty(entity)) { return null; }

  return (
    <Box mt={3}>
      {!entity.published && (
        <BoxSection mb={3} p={3} classes={{ root: classes.boxRoot }}>
          <Typography variant="h6" component="h5" className={classes.titleWithButton}>
            {t('screens:application.info.desc.inProgress.title')}
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
                  rel="noopener noreferrer"
                  edge="end"
                >
                  <OpenInNewIcon />
                </IconButton>
              </>
            )}
          </Typography>
          <Box mt={1}>
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('screens:application.info.desc.inProgress.text.contribute')}
            </Typography>
            {/* @FIXME: uncomment when admin workspace is ready
            <Typography variant="body1" color="textSecondary" paragraph>
              {t('screens:application.info.desc.inProgress.text.claim')}
            </Typography> */}
          </Box>
          {/* @FIXME: uncomment when admin workspace is ready
              @FIXME: on plugin the button should redirect to web app in new tab
            <Button
            component={Link}
            to={adminClaimLink}
            variant="outlined"
            color="secondary"
            aria-label={t('common:claim.admin')}
            classes={{ root: classes.claimButtonRoot }}
          >
            {t('common:claim.admin')}
          </Button> */}
        </BoxSection>
      )}
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
                  rel="noopener noreferrer"
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
                  rel="noopener noreferrer"
                  edge="end"
                >
                  <OpenInNewIcon />
                </IconButton>
              </>
            )}
          </Typography>
        </Box>
        <Box px={3} pb={2}>
          <GridListKeyValue
            t={t}
            cols={2}
            object={otherInfo}
            hideNil={false}
            hideEmpty={false}
            omitKeys={['pleaseFixMe']}
            keyPrefix="screens:application.info.secondary.keys."
            customizers={[
              missingLinkCustomizer,
            ]}
          />
        </Box>
        {renderDomains && <ApplicationInfoContentDomains entity={entity} />}
      </BoxSection>
      {entity.published && (
        <>
          <InfoContentSecurity
            onContributionDpoEmailClick={onContributionDpoEmailClick}
            isAuthenticated={isAuthenticated}
            entity={entity}
          />
          <Box mb={3}>
            {isAuthenticated && <WithMyFeedbackCard application={entity} />}
          </Box>
          <Box mb={3}>
            <SummaryFeedbackCard application={entity} />
          </Box>
        </>
      )}
      {databoxesCount > 0 && (
        <Card py={5}>
          <Typography variant="h3" align="center">
            <Trans
              i18nKey="screens:application.info.databoxCount"
              count={databoxesCount}
            >
              Vous avez contacté
              <span className={classes.typographyEmphasis}>{'{{count}}'}</span>
              sites au total
            </Trans>
          </Typography>
        </Card>
      )}

      {!IS_PLUGIN && <PluginDownloadCard />}

      <Card
        my={2}
        title={t('screens:application.info.claimCallToAction.title')}
        primary={{
          variant: 'outlined',
          color: 'secondary',
          text: t('screens:application.info.claimCallToAction.button'),
          component: Link,
          ...dpoClaimButtonPrimaryProps,
        }}
      >
        <Typography>
          {t('screens:application.info.claimCallToAction.subtitle')}
        </Typography>
      </Card>

    </Box>
  );
};

ApplicationInfoContent.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  isLoading: PropTypes.bool,
  onContributionLinkClick: PropTypes.func.isRequired,
  onContributionDpoEmailClick: PropTypes.func.isRequired,
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
)(withTranslation(['common', 'screens'])(ApplicationInfoContent));
