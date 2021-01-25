import React, { forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import EventSchema from 'store/schemas/Boxes/Events';

import useDecryptedEventText from 'hooks/useDecryptedEventText';
import useCopy from '@misakey/hooks/useCopy';

import ContextMenuItem from '@misakey/ui/Menu/ContextMenu/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';

import CopyIcon from '@material-ui/icons/FilterNone';

// COMPONENTS
const MenuItemCopyEvent = forwardRef(({ t, event }, ref) => {
  const value = useDecryptedEventText(event);

  const onClick = useCopy(value);

  return (
    <ContextMenuItem ref={ref} onClick={onClick}>
      <ListItemIcon>
        <CopyIcon />
      </ListItemIcon>
      <ListItemText primary={t('common:copy')} />
    </ContextMenuItem>
  );
});

MenuItemCopyEvent.propTypes = {
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('common', { withRef: true })(MenuItemCopyEvent);
