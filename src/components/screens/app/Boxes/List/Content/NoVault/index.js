import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';

import path from '@misakey/helpers/path';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import ListItemBoxesCurrent from 'components/smart/ListItem/Boxes/Current';
import { Route, useRouteMatch } from 'react-router-dom';
import Title from '@misakey/ui/Typography/Title';

// HELPERS
const paramsIdPath = path(['params', 'id']);

// COMPONENTS
const NoVault = forwardRef(({ t }, ref) => {
  const match = useRouteMatch(routes.boxes.read._);
  const selectedId = useMemo(
    () => paramsIdPath(match),
    [match],
  );

  const buttonText = useMemo(
    () => t('common:createVault'),
    [t],
  );
  const text = useMemo(
    () => {
      if (selectedId) {
        return t('boxes:list.closedVault.selected.create');
      }
      return t('boxes:list.closedVault.default.create');
    },
    [selectedId, t],
  );
  return (
    <>
      <Route
        path={routes.boxes.read._}
        component={ListItemBoxesCurrent}
      />
      <Box
        m={3}
        ref={ref}
        display="flex"
        flexDirection="column"
        height="100%"
        justifyContent="center"
        alignItems="center"
      >
        <Title align="center">{text}</Title>
        <Box>
          <ButtonWithDialogPassword text={buttonText} />
        </Box>
      </Box>
    </>
  );
});

NoVault.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(NoVault);
