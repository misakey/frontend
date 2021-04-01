import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { Link, useRouteMatch } from 'react-router-dom';

import routes from 'routes';

import isNil from '@misakey/core/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { useTranslation } from 'react-i18next';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Tabs from '@misakey/ui/Tabs';
import Tab from '@misakey/ui/Tab';

// CONSTANTS
const TABS = {
  discussion: 'discussion',
  files: 'files',
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  tabRoot: {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

// COMPONENTS
const AppBarMenuTabs = ({ boxId }) => {
  const classes = useStyles();
  const routeFilesMatch = useRouteMatch(routes.boxes.read.files);
  const isRouteFile = useMemo(
    () => !isNil(routeFilesMatch),
    [routeFilesMatch],
  );
  const { t } = useTranslation('boxes');

  const tabSelected = useMemo(() => (isRouteFile ? TABS.files : TABS.discussion), [isRouteFile]);

  const routeFiles = useGeneratePathKeepingSearchAndHash(routes.boxes.read.files, { id: boxId });
  const routeEvents = useGeneratePathKeepingSearchAndHash(routes.boxes.read._, { id: boxId });

  return (
    <Tabs
      value={tabSelected}
      aria-label={t('boxes:read.menu.label')}
      indicatorColor="background"
      textColor="background"
    >
      <Tab
        classes={{ root: classes.tabRoot }}
        label={t(`boxes:read.menu.${TABS.discussion}`)}
        component={Link}
        to={routeEvents}
        value={TABS.discussion}
      // size="small"
      />
      <Tab
        classes={{ root: classes.tabRoot }}
        label={t(`boxes:read.menu.${TABS.files}`)}
        component={Link}
        value={TABS.files}
        to={routeFiles}
      // size="small"
      />
    </Tabs>
  );
};

AppBarMenuTabs.propTypes = {
  boxId: PropTypes.string.isRequired,
};

export default AppBarMenuTabs;
