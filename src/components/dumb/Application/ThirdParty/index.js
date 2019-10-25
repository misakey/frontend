import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import className from 'clsx';

import TrackersSchema from 'store/schemas/Trackers';
import every from '@misakey/helpers/every';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import Switch from 'components/dumb/Switch';
import ApplicationImg from 'components/dumb/Application/Img';

import 'components/dumb/Application/ThirdParty/ThirdParty.scss';

// CONSTANTS
const MAX_TO_DISPLAY = 3;

// STYLES
const useStyles = makeStyles((theme) => ({
  content: {
    '&.whitelisted': {
      cursor: 'pointer',
    },
    '&:not(.whitelisted)': {
      backgroundColor: theme.palette.grey[100],
      color: theme.palette.grey[700],
      opacity: 0.5,
      filter: 'grayscale(1)',
    },
  },
  action: {
    marginTop: 0,
    marginRight: theme.spacing(2),
    flex: 'none',
    alignSelf: 'unset',
  },
}));

// HELPERS
const appHasBeenBlocked = (detected) => every(detected, 'blocked');

// COMPONENTS
function ThirdPartyBlockPurpose({
  t, mainPurpose, apps, entity, addToWhitelist, removeFromWhitelist, setupAction,
}) {
  const classes = useStyles();
  const empty = useMemo(() => apps.length === 0, [apps]);
  const additionalDetectedNumber = useMemo(() => apps.length - MAX_TO_DISPLAY, [apps]);

  return (
    <Card className="categoryCard">
      <CardHeader
        title={t(`screens:application.thirdParty.purposes.${mainPurpose.name}`)}
        titleTypographyProps={{ variant: 'h6', component: 'h3' }}
        className={classes.header}
        classes={{ action: classes.action }}
        action={(
          <Switch
            checked={mainPurpose.whitelisted}
            onChange={mainPurpose.whitelisted ? removeFromWhitelist : addToWhitelist}
            value={mainPurpose.name}
            inputProps={{ 'aria-label': 'secondary checkbox' }}
          />
        )}
      />
      <CardContent
        className={className('content', classes.content, { whitelisted: mainPurpose.whitelisted })}
        onClick={mainPurpose.whitelisted ? setupAction : null}
      >
        <List className="list" component="div" aria-labelledby="nested-list-apps">
          {
            apps.slice(0, MAX_TO_DISPLAY).map((app) => {
              const { id, name, domain, whitelisted, detected } = app;
              return (
                <div key={id}>
                  <ListItem dense disableGutters>
                    <ListItemAvatar>
                      <ApplicationImg
                        alt={name}
                        src={entity.mainDomain === domain ? entity.logoUri : null}
                      >
                        {name.slice(0, 3)}
                      </ApplicationImg>
                    </ListItemAvatar>
                    <ListItemText
                      className={className('text', { blocked: appHasBeenBlocked(detected) })}
                      id={`switch-list-label-${id}`}
                      primary={name}
                      secondary={domain}
                    />

                    <ListItemSecondaryAction>
                      <Switch
                        checked={whitelisted}
                        value={id.toString()}
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                        disabled
                      />
                    </ListItemSecondaryAction>

                  </ListItem>
                  <Divider variant="inset" component="li" />
                </div>
              );
            })
          }
        </List>

        {empty && (
          <Typography variant="body2" color="textSecondary">
            {t('screens:application.thirdParty.trackers.empty')}
          </Typography>
        )}

      </CardContent>

      {additionalDetectedNumber > 0 && (
        <CardActions
          disableSpacing
          className={className(classes.content, { whitelisted: mainPurpose.whitelisted })}
          onClick={mainPurpose.whitelisted ? setupAction : null}
        >
          <Typography className="displayMore" variant="body2" color="textSecondary">
            {t('screens:application.thirdParty.trackers.additionalDetected', { count: additionalDetectedNumber })}
          </Typography>
        </CardActions>
      )}
    </Card>
  );
}

ThirdPartyBlockPurpose.propTypes = {
  mainPurpose: PropTypes.shape({ name: PropTypes.string, whitelisted: PropTypes.bool }),
  entity: PropTypes.shape({ logoUri: PropTypes.string, mainDomain: PropTypes.string }),
  apps: PropTypes.arrayOf(PropTypes.shape({ ...TrackersSchema, whitelisted: PropTypes.bool })),
  t: PropTypes.func.isRequired,
  addToWhitelist: PropTypes.func.isRequired,
  removeFromWhitelist: PropTypes.func.isRequired,
  setupAction: PropTypes.func,
};

ThirdPartyBlockPurpose.defaultProps = {
  mainPurpose: {
    name: 'other',
    whitelisted: false,
  },
  entity: {
    logoUri: null,
    mainDomain: '',
  },
  apps: [],
  setupAction: null,
};

export default (withTranslation(['screens'])(ThirdPartyBlockPurpose));
