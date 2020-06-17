import React, { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from 'routes';
import { withTranslation } from 'react-i18next';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxAvatar from 'components/dumb/Avatar/Box';
import Title from 'components/dumb/Typography/Title';
import Subtitle from 'components/dumb/Typography/Subtitle';
import BoxMessageEvent from 'components/dumb/Event/Box/Message';
import BoxInformationEvent from 'components/dumb/Event/Box/Information';
import ElevationScroll from 'components/dumb/ElevationScroll';

import MenuIcon from '@material-ui/icons/Menu';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import useGroupEventsByDate from 'hooks/useGroupEventsByDate';
import useGeneratePathKeepingSearch from '@misakey/hooks/useGeneratePathKeepingSearch';
import isNil from '@misakey/helpers/isNil';

import BoxesSchema from 'store/schemas/Boxes';
import IdentitySchema from 'store/schemas/Identity';

import EVENTS_TYPE from 'constants/app/boxes/events';
import BoxEventsFooter from './Footer';

const CONTENT_SPACING = 2;
const APPBAR_HEIGHT = 64;
const FOOTER_HEIGHT = 64;

const useStyles = makeStyles((theme) => ({
  avatar: {
    [theme.breakpoints.down('sm')]: {
      height: '35px',
      width: '35px',
    },
  },
  content: ({ footerHeight }) => ({
    overflow: 'auto',
    height: `calc(100vh - ${APPBAR_HEIGHT}px - ${footerHeight}px - ${theme.spacing(CONTENT_SPACING) * 2}px)`,
  }),
}));

function BoxEvents({ drawerWidth, isDrawerOpen, toggleDrawer, box, identity, t }) {
  // useRef seems buggy with ElevationScroll
  const [contentRef, setContentRef] = useState();
  const lastEventRef = useRef(null);
  const [footerHeight, setFooterHeight] = useState(FOOTER_HEIGHT);
  const classes = useStyles({ footerHeight });

  const routeDetails = useGeneratePathKeepingSearch(routes.boxes.read.details, { id: box.id });

  const { avatarUri, title, events: boxEvents, members } = useMemo(() => box, [box]);
  const isFromCurrentUser = useCallback(
    (eventIdentifier) => identity.identifier.value === eventIdentifier.value,
    [identity.identifier],
  );

  const eventsByDate = useGroupEventsByDate(boxEvents);

  const onChange = useCallback((newHeight) => {
    setFooterHeight(
      (current) => (current !== newHeight ? newHeight : current),
    );
  }, []);

  const scrollToBottom = useCallback(() => {
    if (!isNil(lastEventRef) && !isNil(lastEventRef.current)) {
      lastEventRef.current.scrollIntoView();
    }
  }, []);

  useEffect(scrollToBottom, [eventsByDate]);

  return (
    <>
      <ElevationScroll target={contentRef}>
        <AppBarDrawer drawerWidth={drawerWidth}>
          {!isDrawerOpen && (
            <IconButtonAppBar
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleDrawer}
            >
              <MenuIcon />
            </IconButtonAppBar>
          )}
          <Box display="flex" flexGrow={1} overflow="hidden" alignItems="center">
            <Box display="flex" flexDirection="column">
              <Title gutterBottom={false} noWrap>
                {title}
              </Title>
              <Subtitle>
                {t('boxes:read.details.menu.members.count', { count: members.length })}
              </Subtitle>
            </Box>
            <IconButtonAppBar
              aria-label="box-details"
              aria-controls="menu-appbar"
              component={Link}
              to={routeDetails}
            >
              <KeyboardArrowDownIcon />
            </IconButtonAppBar>

          </Box>

          <IconButtonAppBar
            aria-label="box-details"
            aria-controls="menu-appbar"
            component={Link}
            to={routeDetails}
            edge="end"
          >
            <BoxAvatar
              classes={{ root: classes.avatar }}
              src={avatarUri}
              title={title || ''}
            />
          </IconButtonAppBar>
        </AppBarDrawer>
      </ElevationScroll>
      <Box ref={(ref) => setContentRef(ref)} p={2} className={classes.content}>
        {eventsByDate.map(({ date, events }) => (
          <Box display="flex" flexDirection="column" py={1} key={date}>
            <Typography component={Box} alignSelf="center">{date}</Typography>
            {
              events.map((event) => {
                if (EVENTS_TYPE.information.includes(event.type)) {
                  return (
                    <BoxInformationEvent
                      key={event.id}
                      event={event}
                      getIsFromCurrentUser={isFromCurrentUser}
                    />
                  );
                }
                if (EVENTS_TYPE.message.includes(event.type)) {
                  return (
                    <BoxMessageEvent
                      key={event.id}
                      event={event}
                      getIsFromCurrentUser={isFromCurrentUser}
                    />
                  );
                }
                return null;
              })
            }
            <div ref={lastEventRef} />
          </Box>
        ))}
      </Box>
      <BoxEventsFooter
        box={box}
        drawerWidth={drawerWidth}
        isDrawerOpen={isDrawerOpen}
        onTextareaSizeChange={onChange}
      />
    </>

  );
}

BoxEvents.propTypes = {
  drawerWidth: PropTypes.string.isRequired,
  isDrawerOpen: PropTypes.bool.isRequired,
  toggleDrawer: PropTypes.func.isRequired,
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  identity: PropTypes.shape(IdentitySchema.propTypes),
  t: PropTypes.func.isRequired,
};

BoxEvents.defaultProps = {
  identity: null,
};

export default withTranslation('boxes')(BoxEvents);
