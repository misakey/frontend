import React from 'react';
import PropTypes from 'prop-types';

import ACCESS_LEVELS from '@misakey/ui/constants/accessLevels';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import IconSharing from '@misakey/ui/Icon/Sharing';


// HOOKS
const useStyles = makeStyles(() => ({
  wrapText: {
    whiteSpace: 'normal',
  },
}));

// COMPONENTS
const SelectItemAccessLevel = ({ value }) => {
  const { t } = useTranslation('boxes');
  const classes = useStyles();

  return (
    <>
      <ListItemIcon>
        <IconSharing value={value} />
      </ListItemIcon>
      <ListItemText
        className={classes.wrapText}
        primary={t(`boxes:read.share.level.${value}.title`)}
        secondary={t(`boxes:read.share.level.${value}.description`)}
        primaryTypographyProps={{ display: 'block' }}
        secondaryTypographyProps={{ display: 'block' }}
      />
    </>
  );
};

SelectItemAccessLevel.propTypes = {
  value: PropTypes.oneOf(ACCESS_LEVELS).isRequired,
};

export default SelectItemAccessLevel;
