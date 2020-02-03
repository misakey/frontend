import React, { useMemo, useCallback } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { normalize } from 'normalizr';
import { useSnackbar } from 'notistack';

import { generatePath, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import { IS_PLUGIN } from 'constants/plugin';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import { openInNewTab } from 'helpers/plugin';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import { receiveEntities } from '@misakey/store/actions/entities';

import ApplicationSchema from 'store/schemas/Application';
import API from '@misakey/api';

import Title from 'components/dumb/Typography/Title';
import { BUTTON_STANDINGS } from 'components/dumb/Button';

import Button from '@material-ui/core/Button';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Card from 'components/dumb/Card';
import Chip from '@material-ui/core/Chip';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import CardSimpleTextButton from 'components/dumb/Card/Simple/TextButton';
import withDialogConnect from 'components/smart/Dialog/Connect/with';
import useHandleGenericHttpErrors from 'hooks/useHandleGenericHttpErrors';

const useStyles = makeStyles(() => ({
  summaryRoot: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 4,
    paddingBottom: 4,
  },
  summaryContent: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  domainsList: {
    padding: 0,
  },
  detailsRoot: {
    paddingTop: 0,
  },
}));


// COMPONENTS
const ButtonWithDialogConnect = withDialogConnect(Button);

const APPLICATION_CREATE_ENDPOINT = {
  method: 'POST',
  path: '/application-info',
  auth: true,
};

const createApplication = (mainDomain) => API
  .use(APPLICATION_CREATE_ENDPOINT)
  .build(null, objectToSnakeCase({ mainDomain }))
  .send();

const useOnCreateApplication = (
  mainDomain,
  dispatchApplicationCreate,
  enqueueSnackbar,
  handleGenericHttpErrors,
  t,
) => useCallback(() => createApplication(mainDomain)
  .then((response) => {
    const application = objectToCamelCase(response);
    enqueueSnackbar(t('screens:applications.create.success'), { variant: 'success' });
    dispatchApplicationCreate(application);
  })
  .catch(handleGenericHttpErrors),
[dispatchApplicationCreate, enqueueSnackbar, handleGenericHttpErrors, mainDomain, t]);

const ApplicationInfoMore = ({
  application,
  dispatchApplicationCreate,
  t,
  toggleLinked,
  isLinked,
  isAuthenticated,
}) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const domains = useMemo(
    () => (isNil(application.domains) ? [] : application.domains),
    [application],
  );

  const { isUnknown } = useMemo(() => (application), [application]);

  const reportButton = useMemo(
    () => {
      if (IS_PLUGIN) {
        return {
          standing: BUTTON_STANDINGS.OUTLINED,
          text: t('screens:application.info.more.report.button'),
          onClick: () => openInNewTab('mailto:feedback@misakey.com'),
        };
      }
      return {
        standing: BUTTON_STANDINGS.OUTLINED,
        text: t('screens:application.info.more.report.button'),
        component: 'a',
        href: 'mailto:feedback@misakey.com',
      };
    },
    [t],
  );

  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const onCreateApplication = useOnCreateApplication(
    application.mainDomain,
    dispatchApplicationCreate,
    enqueueSnackbar,
    handleGenericHttpErrors,
    t,
  );

  if (isUnknown) {
    return (
      <>
        <Title>
          {t('screens:application.info.more.title')}
        </Title>

        {isUnknown && (
        <CardSimpleTextButton
          text={t('screens:application.info.more.create.text')}
          button={{
            standing: BUTTON_STANDINGS.OUTLINED,
            text: t('screens:application.info.more.create.button'),
            component: ButtonWithDialogConnect,
            onClick: onCreateApplication,
          }}
          my={2}
        />
        )}
      </>
    );
  }

  return (
    <>
      <Title>
        {t('screens:application.info.more.title')}
      </Title>

      {!IS_PLUGIN && (
        <CardSimpleTextButton
          text={t('screens:application.info.more.dpo.text')}
          button={{
            standing: BUTTON_STANDINGS.OUTLINED,
            text: t('screens:application.info.more.dpo.button'),
            component: Link,
            to: generatePath(routes.dpo.service._, { mainDomain: application.mainDomain }),
          }}
          my={2}
        />
      )}

      <CardSimpleTextButton
        text={t('screens:application.info.more.report.text')}
        button={reportButton}
        my={2}
      />

      <Card my={2}>
        <ExpansionPanel>
          <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            classes={{
              root: classes.summaryRoot,
              content: classes.summaryContent,
            }}
          >
            <Typography>{t('screens:application.info.more.domains.text')}</Typography>
            <Chip
              label={t('screens:application.info.more.domains.count', { count: domains.length })}
              variant="outlined"
            />
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.detailsRoot}>
            <List aria-label="list domains" className={classes.domainsList} disablePadding>
              {domains.map((domain) => (
                <ListItem key={domain.uri}>
                  <ListItemText primary={domain.uri} />
                </ListItem>
              ))}
            </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </Card>

      {isAuthenticated && (
        <CardSimpleTextButton
          text={t('screens:application.info.more.favorite.text')}
          button={{
            standing: BUTTON_STANDINGS.OUTLINED,
            text: t(`common:${(isLinked) ? 'remove' : 'add'}`),
            onClick: toggleLinked,
          }}
          my={2}
        />
      )}
    </>
  );
};

ApplicationInfoMore.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  dispatchApplicationCreate: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  toggleLinked: PropTypes.func.isRequired,
  isLinked: PropTypes.bool,
};

ApplicationInfoMore.defaultProps = {
  isAuthenticated: false,
  isLinked: false,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchApplicationCreate: (application) => {
    const normalized = normalize(application, ApplicationSchema.entity);
    const { entities } = normalized;
    dispatch(receiveEntities(entities));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens'])(ApplicationInfoMore));
