import React, { useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';
import routes from 'routes';

import { useHistory } from 'react-router-dom';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogBoxesDelete from 'components/smart/Dialog/Boxes/Delete';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// COMPONENTS
const ListItemBoxDelete = ({ box, t }) => {
  const [open, setOpen] = useState(false);

  const { replace } = useHistory();

  const onClick = useCallback(
    () => {
      setOpen(true);
    },
    [setOpen],
  );

  const onClose = useCallback(
    () => {
      setOpen(false);
    },
    [setOpen],
  );


  const onSuccess = useCallback(
    () => {
      onClose();
      replace(routes.boxes._);
      return Promise.resolve();
    },
    [replace, onClose],
  );

  return (
    <>
      <ListItem
        button
        divider
        onClick={onClick}
        aria-label={t('boxes:read.details.menu.delete.primary')}
      >
        <ListItemText
          primary={t('boxes:read.details.menu.delete.primary')}
          secondary={t('boxes:read.details.menu.delete.secondary')}
          primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
          secondaryTypographyProps={{ color: 'textPrimary' }}
        />
        <ChevronRightIcon />
      </ListItem>
      <DialogBoxesDelete
        open={open}
        onClose={onClose}
        onSuccess={onSuccess}
        box={box}
      />
    </>
  );
};

ListItemBoxDelete.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('boxes')(ListItemBoxDelete);
