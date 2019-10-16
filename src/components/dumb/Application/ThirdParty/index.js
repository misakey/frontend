import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import className from 'clsx';

import TrackersSchema from 'store/schemas/Trackers';

import Button from '@material-ui/core/Button';
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

import TrackersInfos from 'components/dumb/Application/ThirdParty/TrackersInfos';
import 'components/dumb/Application/ThirdParty/ThirdParty.scss';

const useStyles = makeStyles((theme) => ({
  header: {
    paddingBottom: 0,
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
  pointer: {
    cursor: 'pointer',
  },
  action: {
    marginTop: 0,
    marginRight: theme.spacing(2),
    flex: 'none',
    alignSelf: 'unset',
  },
}));

function ThirdPartyBlockCategory({
  t, category, apps, entity, addToWhitelist, removeFromWhitelist, setupAction,
}) {
  const classes = useStyles();
  const [maxToDisplay, setMaxToDisplay] = React.useState(3);
  const empty = React.useMemo(() => apps.length === 0, [apps]);

  return (
    <Card className="categoryCard">
      <CardHeader
        title={t(`screens:application.thirdParty.categories.${category.name}`)}
        titleTypographyProps={{ variant: 'h6', component: 'h3' }}
        className={classes.header}
        classes={{ action: classes.action }}
        action={(
          <Switch
            checked={category.whitelisted}
            onChange={category.whitelisted ? removeFromWhitelist : addToWhitelist}
            value={category.name}
            inputProps={{ 'aria-label': 'secondary checkbox' }}
          />
        )}
      />
      <CardContent className={classes.content}>
        <List className="list" component="div" aria-labelledby="nested-list-apps">
          {
            apps.slice(0, maxToDisplay).map((app) => {
              const { id, name, domain, detected, whitelisted } = app;
              return (
                <div key={id}>
                  <ListItem dense disableGutters>
                    <ListItemAvatar
                      classes={{ root: classes.pointer }}
                      onClick={() => { setupAction(domain); }}
                    >
                      <ApplicationImg
                        alt={name}
                        src={entity.mainDomain === domain ? entity.logoUri : null}
                      >
                        {name.slice(0, 3)}
                      </ApplicationImg>
                    </ListItemAvatar>
                    <ListItemText
                      className={className('text', { blocked: (!category.whitelisted || !whitelisted) })}
                      classes={{ root: classes.pointer }}
                      id={`switch-list-label-${id}`}
                      primary={name}
                      secondary={domain}
                      onClick={() => { setupAction(domain); }}
                    />

                    <TrackersInfos detected={detected} />

                    <ListItemSecondaryAction
                      classes={{ root: classes.pointer }}
                      onClick={() => { setupAction(domain); }}
                    >
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

      <CardActions disableSpacing>
        {setupAction && (
          <Button size="small" variant="contained" color="secondary" onClick={() => setupAction()}>
            {t('screens:application.thirdParty.setup')}
          </Button>
        )}
        {apps.length > maxToDisplay && (
          <Typography className="displayMore" variant="body2" color="textSecondary" onClick={() => setMaxToDisplay(apps.length)}>
            {t('screens:application.thirdParty.trackers.additionalDetected', { count: apps.length - maxToDisplay })}
          </Typography>
        )}
      </CardActions>
    </Card>
  );
}

ThirdPartyBlockCategory.propTypes = {
  category: PropTypes.shape({ name: PropTypes.string, whitelisted: PropTypes.bool }),
  entity: PropTypes.shape({ logoUri: PropTypes.string, mainDomain: PropTypes.string }),
  apps: PropTypes.arrayOf(PropTypes.shape({ ...TrackersSchema, whitelisted: PropTypes.bool })),
  t: PropTypes.func.isRequired,
  addToWhitelist: PropTypes.func.isRequired,
  removeFromWhitelist: PropTypes.func.isRequired,
  setupAction: PropTypes.func,
};

ThirdPartyBlockCategory.defaultProps = {
  category: {
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

export default (withRouter(withTranslation(['screens'])(ThirdPartyBlockCategory)));
