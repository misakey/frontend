import { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { Link } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import { AVATAR_SIZE, APPBAR_HEIGHT } from '@misakey/ui/constants/sizes';
import BoxesSchema from 'store/schemas/Boxes';

import { makeStyles } from '@material-ui/core/styles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useBoxRights from 'hooks/useBoxRights';

import AppBarDrawer from 'components/smart/Screen/Drawer/AppBar';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import BoxAvatar from '@misakey/ui/Avatar/Box';
import ElevationScroll from 'components/dumb/ElevationScroll';
import ListItemShare from 'components/smart/ListItem/Boxes/Share';
import ListItemLeave from 'components/smart/ListItem/Boxes/Leave';
import ListItemDelete from 'components/smart/ListItem/Boxes/Delete';
import ListItemMemberPublicLink from 'components/smart/ListItem/Member/PublicLink';
import ListItemBoxMute from 'components/smart/ListItem/Boxes/Mute';

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
    boxSizing: 'border-box',
    maxHeight: `calc(100% - ${APPBAR_HEIGHT}px)`,
    overflow: 'auto',
  },
  subheader: {
    backgroundColor: theme.palette.background.default,
  },
  primaryText: {
    color: theme.palette.text.primary,
  },
}));

function BoxDetails({ box, belongsToCurrentUser, t }) {
  const classes = useStyles();
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();

  const {
    id,
    title,
    members = [],
  } = useMemo(() => box, [box]);

  const goBack = useGeneratePathKeepingSearchAndHash(routes.boxes.read._, { id });
  // const routeFiles = useGeneratePathKeepingSearchAndHash(routes.boxes.read.files, { id });

  // @FIXME factorize rules
  const { canDelete, canLeave } = useBoxRights(box, belongsToCurrentUser);

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer position="static" disableOffset>
          <IconButtonAppBar
            aria-label={t('common:goBack')}
            edge="start"
            component={Link}
            to={goBack}
          >
            <ArrowBack />
          </IconButtonAppBar>
        </AppBarDrawer>
      </ElevationScroll>
      <Box p={CONTENT_SPACING} pt={0} ref={(ref) => setContentRef(ref)} className={classes.content}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <BoxAvatar
            classes={{ root: classes.avatar }}
            title={title || ''}
          />
          <Typography variant="h6" align="center" color="textPrimary">
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
          {/* <ListItem
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
          </ListItem> */}
          <ListItemShare box={box} />
          <ListItemBoxMute box={box} />
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
          </ListItem>
          {canLeave && <ListItemLeave box={box} />}
          {canDelete && <ListItemDelete box={box} />}
          <List subheader={(
            <ListSubheader className={classes.subheader}>
              <Typography noWrap variant="overline" color="textSecondary">
                {t('boxes:read.details.menu.members.title')}
              </Typography>
            </ListSubheader>
          )}
          >
            {members.map((member) => (
              <ListItemMemberPublicLink
                key={member.identifierValue}
                member={member}
                box={box}
                belongsToCurrentUser={belongsToCurrentUser}
              />
            ))}
          </List>
        </List>
      </Box>
    </>

  );
}

BoxDetails.propTypes = {
  t: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  belongsToCurrentUser: PropTypes.bool,
};

BoxDetails.defaultProps = {
  belongsToCurrentUser: false,
};

export default withTranslation(['common', 'boxes'])(BoxDetails);
