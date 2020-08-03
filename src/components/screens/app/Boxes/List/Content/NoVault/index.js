import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';
import { Route } from 'react-router-dom';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import ListItemBoxesCurrent from 'components/smart/ListItem/Boxes/Current';
import Typography from '@material-ui/core/Typography';

// COMPONENTS
const NoVault = forwardRef(({ t }, ref) => (
  <>
    <Route
      path={routes.boxes.read._}
      component={ListItemBoxesCurrent}
    />
    <Box
      m={1}
      ref={ref}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Typography variant="body2" color="textSecondary" align="center">
        {t('boxes:list.closedVault.create')}
      </Typography>
      <Box>
        <ButtonWithDialogPassword
          standing={BUTTON_STANDINGS.TEXT}
          size="small"
          text={t('common:createVault')}
        />
      </Box>
    </Box>
  </>
));

NoVault.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(NoVault);
