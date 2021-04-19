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
const MenuItemCopyEvent = forwardRef(({ t, event, component: Component }, ref) => {
  const value = useDecryptedEventText(event);

  const onClick = useCopy(value);

  return (
    <Component ref={ref} onClick={onClick}>
      <ListItemIcon>
        <CopyIcon />
      </ListItemIcon>
      <ListItemText primary={t('common:copy')} />
    </Component>
  );
});

MenuItemCopyEvent.propTypes = {
  component: PropTypes.elementType,
  event: PropTypes.shape(EventSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

MenuItemCopyEvent.defaultProps = {
  component: ContextMenuItem,
};

export default withTranslation('common', { withRef: true })(MenuItemCopyEvent);
