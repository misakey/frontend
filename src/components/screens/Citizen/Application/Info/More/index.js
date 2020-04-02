import React, { useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import { generatePath, Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import { IS_PLUGIN } from 'constants/plugin';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import { openInNewTab } from '@misakey/helpers/plugin';

import ApplicationSchema from 'store/schemas/Application';

import Title from 'components/dumb/Typography/Title';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

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

import CardSimpleText from 'components/dumb/Card/Simple/Text';

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

const ApplicationInfoMore = ({
  application,
  t,
  toggleLinked,
  isLinked,
  isAuthenticated,
}) => {
  const classes = useStyles();

  const domains = useMemo(
    () => (isNil(application.domains) ? [] : application.domains),
    [application],
  );

  const reportButton = useMemo(
    () => {
      if (IS_PLUGIN) {
        return {
          standing: BUTTON_STANDINGS.OUTLINED,
          size: 'small',
          text: t('citizen:application.info.more.report.button'),
          onClick: () => openInNewTab('mailto:feedback@misakey.com'),
        };
      }
      return {
        standing: BUTTON_STANDINGS.OUTLINED,
        size: 'small',
        text: t('citizen:application.info.more.report.button'),
        component: 'a',
        href: 'mailto:feedback@misakey.com',
      };
    },
    [t],
  );

  return (
    <>
      <Title>
        {t('citizen:application.info.more.title')}
      </Title>

      {!IS_PLUGIN && (
        <CardSimpleText
          text={t('citizen:application.info.more.dpo.text')}
          button={{
            standing: BUTTON_STANDINGS.OUTLINED,
            size: 'small',
            text: t('citizen:application.info.more.dpo.button'),
            component: Link,
            to: generatePath(routes.dpo.service._, { mainDomain: application.mainDomain }),
          }}
          my={2}
        />
      )}

      <CardSimpleText
        text={t('citizen:application.info.more.report.text')}
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
            <Typography>{t('citizen:application.info.more.domains.text')}</Typography>
            <Chip
              label={t('citizen:application.info.more.domains.count', { count: domains.length })}
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
        <CardSimpleText
          text={t('citizen:application.info.more.favorite.text')}
          button={{
            standing: BUTTON_STANDINGS.OUTLINED,
            size: 'small',
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
  t: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool,
  toggleLinked: PropTypes.func.isRequired,
  isLinked: PropTypes.bool,
};

ApplicationInfoMore.defaultProps = {
  isAuthenticated: false,
  isLinked: false,
};

export default withTranslation(['common', 'citizen'])(ApplicationInfoMore);
