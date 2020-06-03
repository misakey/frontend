import React, { useMemo, useState, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import routes from 'routes';

import AppBarDrawer from 'components/dumb/AppBar/Drawer';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import BoxAvatar from 'components/dumb/Avatar/Box';
import Title from 'components/dumb/Typography/Title';
import Subtitle from 'components/dumb/Typography/Subtitle';
import BoxMessageEvent from 'components/dumb/Event/Box/Message';
import BoxInformationEvent from 'components/dumb/Event/Box/Information';
import ElevationScroll from 'components/dumb/ElevationScroll';

import MenuIcon from '@material-ui/icons/Menu';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import useGroupEventsByDate from 'hooks/useGroupEventsByDate';

import BoxesSchema from 'store/schemas/Boxes';

import EVENTS_TYPE from 'constants/app/boxes/events';
import BoxEventsFooter from './Footer';

const CONTENT_SPACING = 2;
const APPBAR_HEIGHT = 64;

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

function BoxEvents({ drawerWidth, isDrawerOpen, toggleDrawer, box }) {
  const contentRef = useRef();
  const [footerHeight, setFooterHeight] = useState(64);
  const classes = useStyles({ footerHeight });

  const routeDetails = useMemo(
    () => generatePath(routes.boxes.read.details, { id: box.id }),
    [box.id],
  );

  const { avatarUri, title, purpose, events: boxEvents } = useMemo(() => box, [box]);

  const eventsByDate = useGroupEventsByDate(boxEvents);

  const onChange = useCallback((newHeight) => {
    setFooterHeight(
      (current) => (current !== newHeight ? newHeight : current),
    );
  }, []);

  return (
    <>
      <ElevationScroll target={contentRef.current}>
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
          <Box display="flex" flexDirection="column" flexGrow={1}>
            <Title gutterBottom={false}>
              {title}
            </Title>
            <Subtitle>
              {purpose}
            </Subtitle>
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
      <Box ref={contentRef} p={2} className={classes.content}>
        {eventsByDate.map(({ date, events }) => (
          <Box display="flex" flexDirection="column" py={1} key={date}>
            <Typography component={Box} alignSelf="center">{date}</Typography>
            {
              events.map((event) => {
                if (EVENTS_TYPE.information.includes(event.type)) {
                  return <BoxInformationEvent event={event} />;
                }
                if (EVENTS_TYPE.message.includes(event.type)) {
                  return <BoxMessageEvent event={event} />;
                }
                return null;
              })
            }
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
};

export default BoxEvents;
