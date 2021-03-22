import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isSelfOrg from 'helpers/isSelfOrg';

import useOrgId from 'hooks/useOrgId';

import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import ButtonDrawerOrganization from 'components/smart/IconButton/Drawer/Organization';

import AddIcon from '@material-ui/icons/Add';

// CONSTANTS
const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

// COMPONENTS
const IconButtonCreate = withDialogCreate(
  IconButtonAppBar,
);

function ListHeader({ t, isFullWidth, ...props }) {
  const orgId = useOrgId();
  const selfOrgSelected = useMemo(
    () => isSelfOrg(orgId),
    [orgId],
  );

  return (
    <AppBarStatic
      color="primary"
      toolbarProps={TOOLBAR_PROPS}
      {...omitTranslationProps(props)}
    >
      <ButtonDrawerOrganization />
      <Subtitle gutterBottom={false} color="background">{t('boxes:documentTitle')}</Subtitle>
      <BoxFlexFill />
      {selfOrgSelected && (
        <IconButtonCreate
          aria-label={t('boxes:list.empty.create')}
          edge="end"
          color="background"
        >
          <AddIcon />
        </IconButtonCreate>
      )}
    </AppBarStatic>
  );
}

ListHeader.propTypes = {
  isFullWidth: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ListHeader.defaultProps = {
  isFullWidth: false,
};

export default withTranslation(['common', 'boxes'])(ListHeader);
