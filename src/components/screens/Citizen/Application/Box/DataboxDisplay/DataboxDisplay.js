import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import { CloudDownload as CloudDownloadIcon } from '@material-ui/icons';

import * as moment from 'moment';
import * as numeral from 'numeral';

import 'components/screens/Citizen/Application/Box/DataboxDisplay/databoxDisplay.scss';

const DataboxDisplay = (props) => {
  const {
    application, blobs, t, downloadBlob,
  } = props;

  if (blobs.length === 0) {
    return (
      <div className="databoxDisplay">
        <Typography className="databoxDescription">
          {t('screens:databox.empty', { applicationName: application.name })}
        </Typography>
      </div>
    );
  }

  return (
    <div className="databoxDisplay">
      <Typography className="databoxDescription">
        {t('screens:databox.intro', { applicationName: application.name })}

      </Typography>
      <List disablePadding>
        {
          // "sort" method mutates the array
          // so we have to copy it with the "concat"
          // see https://stackoverflow.com/a/43572944/3025740
          [].concat(blobs)
            // we want most recent first
            .sort((blob1, blob2) => blob1.createdAt < blob2.createdAt)
            .map((blob) => {
              const { createdAt, contentLength, id } = blob;
              const date = moment.parseZone(createdAt).format('LLLL');
              const size = numeral(contentLength).format('0a') + t('units.bytes');
              return (
                <ListItem key={blob.id} disableGutters>
                  <ListItemText
                    primary={t('screens:databox.sendAt', { date })}
                    secondary={t('screens:databox.size', { size })}
                  />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="Download" onClick={() => downloadBlob(id)}>
                      <CloudDownloadIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          }
      </List>
    </div>
  );
};

DataboxDisplay.propTypes = {
  application: PropTypes.object.isRequired,
  blobs: PropTypes.arrayOf(PropTypes.object).isRequired,
  t: PropTypes.func.isRequired,
  downloadBlob: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'screens'])(DataboxDisplay);
