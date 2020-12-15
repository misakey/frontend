import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Link, useRouteMatch } from 'react-router-dom';

import routes from 'routes';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

const TABS = {
  discussion: 'discussion',
  files: 'files',
};


// COMPONENTS
const AppBarMenuTabs = ({ boxId }) => {
  const isRouteFile = useRouteMatch(routes.boxes.read.files);
  const { t } = useTranslation('boxes');

  const tabSelected = useMemo(() => (isRouteFile ? TABS.files : TABS.discussion), [isRouteFile]);

  const routeFiles = useGeneratePathKeepingSearchAndHash(routes.boxes.read.files, { id: boxId });
  const routeEvents = useGeneratePathKeepingSearchAndHash(routes.boxes.read._, { id: boxId });

  return (
    <Box display="flex" justifyContent="center">
      <Tabs
        indicatorColor="primary"
        textColor="primary"
        value={tabSelected}
        aria-label={t('boxes:read.menu.label')}
      >
        <Tab
          label={t(`boxes:read.menu.${TABS.discussion}`)}
          component={Link}
          to={routeEvents}
          value={TABS.discussion}
        />
        <Tab
          label={t(`boxes:read.menu.${TABS.files}`)}
          component={Link}
          value={TABS.files}
          to={routeFiles}
        />
      </Tabs>
    </Box>
  );
};

AppBarMenuTabs.propTypes = {
  boxId: PropTypes.string.isRequired,
};

export default AppBarMenuTabs;
