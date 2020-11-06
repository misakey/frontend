import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import BoxesSchema from 'store/schemas/Boxes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import DialogBoxClose from 'components/smart/Dialog/Boxes/Close';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// HOOKS
const useStyles = makeStyles((theme) => ({
  primaryText: {
    color: theme.palette.text.primary,
  },
}));

// COMPONENTS
const ListItemBoxClose = ({ box, t }) => {
  const classes = useStyles();
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);

  const toggleCloseDialog = useCallback(
    () => {
      setIsCloseDialogOpen((current) => !current);
    }, [setIsCloseDialogOpen],
  );

  return (
    <>
      <ListItem
        button
        divider
        onClick={toggleCloseDialog}
        aria-label={t('boxes:read.details.menu.close.primary')}
      >
        <ListItemText
          primary={t('boxes:read.details.menu.close.primary')}
          secondary={t('boxes:read.details.menu.close.secondary')}
          primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
          secondaryTypographyProps={{ color: 'textPrimary' }}
        />
        <ChevronRightIcon className={classes.primaryText} />
      </ListItem>
      <DialogBoxClose
        box={box}
        open={isCloseDialogOpen}
        onClose={toggleCloseDialog}
      />
    </>

  );
};

ListItemBoxClose.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('boxes')(ListItemBoxClose);
