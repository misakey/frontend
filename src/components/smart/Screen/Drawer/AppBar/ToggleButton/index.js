import { useTranslation } from 'react-i18next';

import IconButtonAppBar from 'components/dumb/IconButton/Appbar';

import ArrowBack from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';
import { useScreenDrawerContext } from '../..';

// COMPONENTS
function ToggleDrawerButton() {
  const { t } = useTranslation('common');
  const { toggleDrawer, isDrawerOpen } = useScreenDrawerContext();

  if (isDrawerOpen) { return null; }

  return (
    <Box display="flex" alignItems="center" pl={2} pr={1}>
      <IconButtonAppBar
        aria-label={t('common:openAccountDrawer')}
        edge="start"
        onClick={toggleDrawer}
      >
        <ArrowBack />
      </IconButtonAppBar>
    </Box>
  );
}

export default ToggleDrawerButton;
