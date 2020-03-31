import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import SearchApplicationsPopoverNavigation from 'components/smart/Search/Applications/Popover/Navigation';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import withUserContributionDialog from 'components/smart/Dialog/UserContribution/with';
import { USER_CONTRIBUTION_TYPE } from 'components/smart/Dialog/UserContribution';

import AlternateEmailIcon from '@material-ui/icons/AlternateEmail';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// CONSTANTS
const DIALOG_PROPS = {
  userContributionType: USER_CONTRIBUTION_TYPE.dpoEmail,
};

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarColoredRoot: {
    backgroundColor: theme.palette.secondary.main,
  },
  navigationRoot: {
    border: 'none',
  },
  iconRoot: {
    width: 40,
    height: 40,
  },
}));

// COMPONENTS
const ListItemWithUserContributionDialog = withUserContributionDialog(ListItem);

const SearchApplicationsPopoverNoContact = ({ entity, t }) => {
  const classes = useStyles();

  const { manualGdprTutorial, name: appName } = useMemo(
    () => entity || {},
    [entity],
  );

  const hasTutorial = useMemo(
    () => !isNil(manualGdprTutorial),
    [manualGdprTutorial],
  );

  return (
    <>
      <SearchApplicationsPopoverNavigation className={classes.navigationRoot} />
      <List disablePadding>
        <ListItem divider>
          <ListItemIcon>
            <ReportProblemOutlinedIcon classes={{ root: classes.iconRoot }} color="secondary" />
          </ListItemIcon>
          <ListItemText
            primary={t('citizen:noContact.title')}
            secondary={t('citizen:noContact.subtitle')}
          />
        </ListItem>
        <ListItemWithUserContributionDialog
          button
          dialogProps={DIALOG_PROPS}
          entity={entity}
        >
          <ListItemAvatar>
            <Avatar className={classes.avatarColoredRoot}>
              <AlternateEmailIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText
            primary={t('citizen:userContribution.button.title')}
            secondary={t('citizen:userContribution.button.subtitle')}
          />
          <ChevronRightIcon />
        </ListItemWithUserContributionDialog>
        {hasTutorial && (
          <ListItem
            button
            component="a"
            href={manualGdprTutorial}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemAvatar>
              <Avatar>
                <HelpOutlineIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={t('citizen:noContact.external.title')}
              secondary={t('citizen:noContact.external.subtitle', { appName })}
            />
            <ChevronRightIcon />
          </ListItem>
        )}
      </List>
    </>
  );
};

SearchApplicationsPopoverNoContact.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
};

SearchApplicationsPopoverNoContact.defaultProps = {
  entity: null,
};

export default withTranslation('citizen')(SearchApplicationsPopoverNoContact);
