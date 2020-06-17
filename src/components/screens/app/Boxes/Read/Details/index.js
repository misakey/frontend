import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import BoxAvatar from 'components/dumb/Avatar/Box';
import ElevationScroll from 'components/dumb/ElevationScroll';
import AvatarUser from '@misakey/ui/Avatar/User';
import useGeneratePathKeepingSearch from '@misakey/hooks/useGeneratePathKeepingSearch';
import { AVATAR_SIZE } from '@misakey/ui/constants/sizes';

// CONSTANTS
const CONTENT_SPACING = 2;

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    width: `calc(3 * ${AVATAR_SIZE}px)`,
    height: `calc(3 * ${AVATAR_SIZE}px)`,
    fontSize: theme.typography.h4.fontSize,
    margin: theme.spacing(2, 0),
  },
  content: {
    maxHeight: `calc(100vh - ${theme.mixins.toolbar.minHeight}px - ${theme.spacing(CONTENT_SPACING) * 2}px)`,
    overflow: 'auto',
  },
}));

function BoxDetails({ drawerWidth, box, t }) {
  const classes = useStyles();
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const goBack = useGeneratePathKeepingSearch(routes.boxes.read._, { id: box.id });
  const routeFiles = useGeneratePathKeepingSearch(routes.boxes.read.files, { id: box.id });
  const { avatarUrl: boxAvatarUrl, title, members } = useMemo(() => box, [box]);
  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer drawerWidth={drawerWidth}>
          <IconButtonAppBar
            color="inherit"
            aria-label="open drawer"
            edge="start"
            component={Link}
            to={goBack}
          >
            <ArrowBack />
          </IconButtonAppBar>
        </AppBarDrawer>
      </ElevationScroll>
      <Box p={CONTENT_SPACING} ref={(ref) => setContentRef(ref)} className={classes.content}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <BoxAvatar
            classes={{ root: classes.avatar }}
            src={boxAvatarUrl}
            title={title || ''}
          />
          <Typography variant="h6" align="center">
            {title}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {t('boxes:read.details.menu.members.count', { count: members.length })}
          </Typography>
        </Box>

        <List>
          <ListItem
            // button
            divider
            aria-label={t('boxes:read.details.menu.title')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.title')}
              secondary={title}
              primaryTypographyProps={{ variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ color: 'textPrimary' }}
            />
            {/* <ChevronRightIcon /> */}
          </ListItem>
          <ListItem
            button
            to={routeFiles}
            component={Link}
            divider
            aria-label={t('boxes:read.details.menu.files')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.files')}
              primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ noWrap: true, color: 'textPrimary' }}
            />
            <ChevronRightIcon />
          </ListItem>
          <ListItem
            // button
            // to={}
            // component={Link}
            divider
            aria-label={t('boxes:read.details.menu.encryption.primary')}
          >
            <ListItemText
              primary={t('boxes:read.details.menu.encryption.primary')}
              secondary={t('boxes:read.details.menu.encryption.secondary')}
              primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
              secondaryTypographyProps={{ color: 'textPrimary' }}
            />
            {/* <ChevronRightIcon /> */}
          </ListItem>
          <List subheader={(
            <ListSubheader>
              <Typography noWrap variant="overline" color="textSecondary">
                {t('boxes:read.details.menu.members.title')}
              </Typography>
            </ListSubheader>
          )}
          >
            {members.map(({ displayName, avatarUrl, identifier }) => (
              <ListItem key={identifier.value}>
                <ListItemAvatar>
                  <AvatarUser src={avatarUrl} />
                </ListItemAvatar>
                <ListItemText
                  primary={displayName}
                  secondary={identifier.value}
                />
              </ListItem>
            ))}
          </List>
        </List>
      </Box>
    </>

  );
}

BoxDetails.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  box: PropTypes.shape({ id: PropTypes.string.isRequired }).isRequired,
};

export default withTranslation('boxes')(BoxDetails);
