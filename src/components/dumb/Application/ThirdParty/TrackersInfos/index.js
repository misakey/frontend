import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import HelpIcon from '@material-ui/icons/Help';
import Beenhere from '@material-ui/icons/Beenhere';
import Block from '@material-ui/icons/Block';
import IconButton from '@material-ui/core/IconButton';
import Popover from '@material-ui/core/Popover';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';

import 'components/dumb/Application/ThirdParty/TrackersInfos/TrackersInfos.scss';

const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.grey.A300,
    padding: '0.7rem',
    border: `1px solid ${theme.palette.grey.A400}`,
    maxHeight: '40%',
    maxWidth: '60%',
  },
  icon: {
    width: '0.8rem',
    height: '0.8rem',
    marginRight: '0.2rem',
  },
  typography: {
    fontSize: '0.6rem',
    alignItems: 'center',
    display: 'flex',
  },
  badge: {
    height: '1rem',
    minWidth: '1rem',
    fontSize: '0.7rem',
  },
}));

function TrackersInfos({ t, detected }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const classes = useStyles();

  function handleClick(event) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }
  const total = detected.reduce((tot, element) => (element.count + tot), 0);
  return (
    <div className="trackersInfos">
      <Tooltip title={t('screens:application.thirdParty.trackers.detected', { count: detected.length })}>
        <IconButton className="iconButton" onClick={handleClick}>
          <Badge badgeContent={total} color="secondary" classes={{ badge: classes.badge }}>
            <HelpIcon className="icon" color="primary" />
          </Badge>
        </IconButton>
      </Tooltip>
      <Popover
        id="trackersPopover"
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{ elevation: 0, className: classes.paper }}
      >
        { detected.map((element) => (
          <Typography
            key={element.url}
            variant="caption"
            component="div"
            classes={{ root: classes.typography }}
            noWrap
          >
            {element.blocked
              ? <Block color="error" classes={{ root: classes.icon }} />
              : <Beenhere color="primary" classes={{ root: classes.icon }} />}
            {`${element.count > 1 ? `(${element.count})` : ''} ${element.url.split('?')[0]}`}
          </Typography>
        )) }
      </Popover>
    </div>
  );
}

TrackersInfos.propTypes = {
  detected: PropTypes.arrayOf(PropTypes.shape({
    blocked: PropTypes.bool,
    count: PropTypes.number,
    url: PropTypes.string,
  })),
  t: PropTypes.func.isRequired,
};

TrackersInfos.defaultProps = {
  detected: [],
};


export default (withTranslation(['screens'])(TrackersInfos));
