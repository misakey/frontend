import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import DataboxSchema from 'store/schemas/Databox';

import isNil from '@misakey/helpers/isNil';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import omitTranslationProps from 'helpers/omit/translationProps';

import { useDateFormatMemo } from 'hooks/useDateFormat';
import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ChipDataboxStatus from 'components/dumb/Chip/Databox/Status';
import ChipDataboxBlobs from 'components/dumb/Chip/Databox/Blobs';
import ScreenError from 'components/dumb/Screen/Error';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

// CONSTANTS
const BLOB_COUNT_ENDPOINT = {
  method: 'HEAD',
  path: '/blobs',
  auth: true,
};

// HELPERS
const fetchBlobCount = (databoxId) => API
  .use(BLOB_COUNT_ENDPOINT)
  .build(undefined, undefined, objectToSnakeCase({ databoxIds: [databoxId] }))
  .send({ rawRequest: true });

// COMPONENTS
const ExpansionPanelSummaryDatabox = ({ databox, expanded, t, ...rest }) => {
  const { id, updatedAt } = databox;

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  const [error, setError] = useState();

  const [blobCount, setBlobCount] = useState();

  const textUpdatedAt = useDateFormatMemo(updatedAt);

  const panelAriaControls = useMemo(
    () => `panel${id}-content`,
    [id],
  );

  const panelId = useMemo(
    () => `panel${id}-header`,
    [id],
  );

  const countBlobs = useCallback(
    () => {
      fetchBlobCount(id)
        .then((response) => {
          setBlobCount(parseInt(response.headers.get('X-Total-Count'), 10));
        })
        .catch((e) => {
          setError(e);
        });
    },
    [id, setBlobCount, setError],
  );

  useEffect(
    () => {
      if (isNil(blobCount) && isNil(error)) {
        countBlobs();
      }
    },
    [blobCount, error, countBlobs],
  );

  if (error) {
    return <ScreenError error={error} />;
  }

  return (
    <ExpansionPanelSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls={panelAriaControls}
      id={panelId}
      expanded={expanded}
      {...omitTranslationProps(rest)}
    >
      <Grid container>
        <Grid container item sm={expanded ? 12 : 7} xs={12} alignItems="center">
          <Typography>
            {t('common:databox.archive.title', { updatedAt: textUpdatedAt })}
          </Typography>
        </Grid>
        {!expanded && (
        <Grid spacing={1} container item xs justify={isXs ? 'center' : 'flex-end'}>
          <Grid item>
            <ChipDataboxBlobs blobs={blobCount} />
          </Grid>
          <Grid item>
            <ChipDataboxStatus databox={databox} />
          </Grid>
        </Grid>
        )}
      </Grid>
    </ExpansionPanelSummary>
  );
};

ExpansionPanelSummaryDatabox.propTypes = {
  databox: PropTypes.shape(DataboxSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
  // ExpansionPanel
  expanded: PropTypes.bool.isRequired,
};

export default withTranslation('common')(ExpansionPanelSummaryDatabox);
