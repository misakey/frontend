import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';

import { useTranslation } from 'react-i18next';
import { useDialogBoxesDeleteContext } from 'components/smart/Dialog/Boxes/Delete/Context';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import DeleteIcon from '@material-ui/icons/Delete';

// HOOKS
const useStyles = makeStyles(() => ({
  buttonLabel: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

// COMPONENTS
const IconButtonBoxesDelete = forwardRef(({ box, ...props }, ref) => {
  const { t } = useTranslation('boxes');
  const classes = useStyles();

  const label = useMemo(
    () => t('boxes:read.details.menu.delete.primary'),
    [t],
  );

  const { onOpen } = useDialogBoxesDeleteContext();

  return (
    <Button
      ref={ref}
      onClick={onOpen}
      variant="text"
      classes={{ label: classes.buttonLabel }}
      aria-label={label}
      {...props}
    >
      <DeleteIcon color="action" />
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
    </Button>
  );
});

IconButtonBoxesDelete.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default IconButtonBoxesDelete;
