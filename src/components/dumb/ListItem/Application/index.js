import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import ApplicationSchema from 'store/schemas/Application';

import { bulkSelectionToggleSelected } from 'store/actions/bulkSelection';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import ApplicationImg from 'components/dumb/Application/Img';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Chip from '@material-ui/core/Chip';
import IconButtonWithRequestCreation from 'components/smart/Requests/New/with/IconButton';
import Badge from '@material-ui/core/Badge';

import MailOutlineIcon from '@material-ui/icons/MailOutline';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import { WORKSPACE } from 'constants/workspaces';

const useStyles = makeStyles(() => ({
  option: {
    color: 'inherit',
    textDecoration: 'none',
    flexGrow: 1,
  },
}));

function ApplicationListItem({
  application,
  isSelectable,
  dispatchBulkContactToggleSelected,
  selectedApplications,
  isAuthenticated,
  withBlobCount,
  t,
  ...rest
}) {
  const classes = useStyles();
  const workspace = useLocationWorkspace(true);

  const { id, mainDomain, logoUri, dpoEmail, name, blobCount = 0, published } = application;

  const displayQuickContact = useMemo(
    () => workspace === WORKSPACE.CITIZEN && (!isEmpty(dpoEmail) || !isAuthenticated),
    [dpoEmail, isAuthenticated, workspace],
  );

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
          <ApplicationImg
            src={logoUri}
            applicationName={name}
          />
        ) : (
          <Badge
            badgeContent={<HourglassEmptyIcon color="primary" />}
            color="default"
            overlap="circle"
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <ApplicationImg
              src={logoUri}
              applicationName={name}
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
      {(withBlobCount && blobCount > 0) && (
        <Chip color="secondary" label={blobCount} size="small" clickable />
      )}
      {/* @FIXME: when refacto the bulk contact, maybe those namings are not relevant anymore */}
      {!withBlobCount && isSelectable && displayQuickContact && (
        <ListItemSecondaryAction>
          <IconButtonWithRequestCreation
            color="secondary"
            edge="end"
            aria-label={t('common:send')}
            component={IconButton}
            producerId={id}
          >
            <MailOutlineIcon />
          </IconButtonWithRequestCreation>
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
}

ApplicationListItem.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  isSelectable: PropTypes.bool,
  // CONNECT
  selectedApplications: PropTypes.arrayOf(PropTypes.string),
  isAuthenticated: PropTypes.bool,
  dispatchBulkContactToggleSelected: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  withBlobCount: PropTypes.bool,
};

ApplicationListItem.defaultProps = {
  application: null,
  isSelectable: true,
  selectedApplications: [],
  isAuthenticated: false,
  withBlobCount: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  selectedApplications: state.bulkSelection.selected,
  isAuthenticated: !!state.auth.token,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchBulkContactToggleSelected:
    (applicationId) => dispatch(bulkSelectionToggleSelected(applicationId)),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation('common')(ApplicationListItem));
