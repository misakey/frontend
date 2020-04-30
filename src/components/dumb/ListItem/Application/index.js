import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ApplicationAvatar from 'components/dumb/Avatar/Application';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Badge from '@material-ui/core/Badge';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';

const useStyles = makeStyles(() => ({
  option: {
    color: 'inherit',
    textDecoration: 'none',
    flexGrow: 1,
  },
}));

function ApplicationListItem({
  application,
  secondaryAction,
  t,
  ...rest
}) {
  const classes = useStyles();

  const { mainDomain, logoUri, name, published } = application;

  const secondaryText = useMemo(
    () => (published ? mainDomain : t('components:list.applications.pending')),
    [published, mainDomain, t],
  );

  return (
    <ListItem
      className={classes.option}
      {...omitTranslationProps(rest)}
    >
      <ListItemAvatar>
        { published ? (
          <ApplicationAvatar
            src={logoUri}
            name={name}
          />
        ) : (
          <Badge
            badgeContent={<HourglassEmptyIcon color="primary" />}
            color="default"
            overlap="circle"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <ApplicationAvatar
              src={logoUri}
              name={name}
            />
          </Badge>
        )}
      </ListItemAvatar>
      <ListItemText
        primary={name}
        secondary={secondaryText}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block' }}
      />
      {secondaryAction}
    </ListItem>
  );
}

ApplicationListItem.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  secondaryAction: PropTypes.node,
  // CONNECT
  // withTranslation
  t: PropTypes.func.isRequired,
};

ApplicationListItem.defaultProps = {
  application: null,
  secondaryAction: null,
};

export default withTranslation('components')(ApplicationListItem);
