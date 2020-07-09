import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';
import { useSelector } from 'react-redux';

import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';
import path from '@misakey/helpers/path';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import ListItemBoxesCurrent from 'components/smart/ListItem/Boxes/Current';
import { Route, useRouteMatch } from 'react-router-dom';
import Title from '@misakey/ui/Typography/Title';
import isNil from '@misakey/helpers/isNil';

// HELPERS
const paramsIdPath = path(['params', 'id']);

// COMPONENTS
function VaultLocked({ t }) {
  const { accountId } = useSelector(getCurrentUserSelector) || {};
  const match = useRouteMatch(routes.boxes.read._);
  const selectedId = useMemo(
    () => paramsIdPath(match),
    [match],
  );

  const buttonText = useMemo(
    () => (!isNil(accountId) ? t('common:openVault') : t('common:createVault')),
    [accountId, t],
  );
  const text = useMemo(
    () => {
      if (isNil(accountId)) {
        if (selectedId) {
          return t('boxes:list.closedVault.selected.create');
        }
        return t('boxes:list.closedVault.default.create');
      }
      if (selectedId) {
        return t('boxes:list.closedVault.selected.open');
      }
      return t('boxes:list.closedVault.default.open');
    },
    [accountId, selectedId, t],
  );
  return (
    <>
      <Route
        path={routes.boxes.read._}
        component={ListItemBoxesCurrent}
      />
      <Box m={3} display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
        <Title align="center">{text}</Title>
        <Box>
          <ButtonWithDialogPassword text={buttonText} />
        </Box>
      </Box>
    </>
  );
}

VaultLocked.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(VaultLocked);
