import React, { useMemo, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';


import Typography from '@material-ui/core/Typography';
import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';

import extractDataFromJsonBlob from '@misakey/helpers/extractDataFromBlob/Json';
import extractDataFromZipBlob from '@misakey/helpers/extractDataFromBlob/Zip';

import SplashScreen from '@misakey/ui/Screen/Splash';

import Box from '@material-ui/core/Box';
import Podium from 'components/dumb/Dataviz/Podium';
import DataSummaryCard from 'components/dumb/Dataviz/Card/DataSummary';
import DataSummaryBox from 'components/dumb/Dataviz/Box/DataSummary';

import { getDataPerYear } from './helpers';

const useStyles = makeStyles((theme) => ({
  yearTitle: {
    fontWeight: 'bold',
    position: 'sticky',
    top: -theme.spacing(2),
    backgroundColor: 'white',
    zIndex: theme.zIndex.mobileStepper,
  },
}));

const TrainlineDataviz = ({ decryptedBlob, application, t }) => {
  const classes = useStyles();

  const { mainColor } = application;

  const [data, setData] = useState(null);

  useEffect(
    () => {
      // From blob to zip to unzip to get file to json parse
      const { blob, fileExtension } = decryptedBlob;
      if (fileExtension === '.json') {
        extractDataFromJsonBlob(blob, setData);
        blob.text().then((str) => {
          setData(JSON.parse(str));
        });
      } else if (fileExtension === '.zip') {
        extractDataFromZipBlob(blob, setData);
      }
    },
    [decryptedBlob],
  );

  const dataPerYear = useMemo(
    () => (!isNil(data) ? getDataPerYear(data) : null),
    [data],
  );

  if (isNil(data)) {
    return <SplashScreen />;
  }

  return (
    <div>
      {dataPerYear.map(
        ({ year, topDestination, topSearches, timeInTrain,
          distance, co2, totalTravels, moneySpent }) => (
            <div key={year}>
              <Typography variant="h5" className={classes.yearTitle}>{year}</Typography>
              <Box mb={3}>
                <Typography variant="h6">{t('citizen:dataviz.trainline.topStations')}</Typography>
                <Podium
                  unit={t('citizen:dataviz.trainline.visits')}
                  first={{
                    score: path([0, 'totalVisit'], topDestination),
                    value: path([0, 'name'], topDestination),
                  }}
                  second={{
                    score: path([1, 'totalVisit'], topDestination),
                    value: path([1, 'name'], topDestination),
                  }}
                  third={{
                    score: path([2, 'totalVisit'], topDestination),
                    value: path([2, 'name'], topDestination),
                  }}
                  color={mainColor}
                />
              </Box>

              {(!isNil(path([0, 'totalSearch'], topSearches))) ? (
                <Box my={3}>
                  <Typography variant="h6">{t('citizen:dataviz.trainline.topSearches')}</Typography>
                  <Podium
                    unit={t('citizen:dataviz.trainline.searches')}
                    first={{
                      score: path([0, 'totalSearch'], topSearches),
                      value: path([0, 'name'], topSearches),
                    }}
                    second={{
                      score: path([1, 'totalSearch'], topSearches),
                      value: path([1, 'name'], topSearches),
                    }}
                    third={{
                      score: path([2, 'totalSearch'], topSearches),
                      value: path([2, 'name'], topSearches),
                    }}
                    color={mainColor}
                  />
                </Box>
              ) : null}

              <DataSummaryBox>
                <DataSummaryCard
                  title={`${Math.round(timeInTrain.asHours())}h`}
                  subtitle={t('citizen:dataviz.trainline.ofTrain')}
                  color={mainColor}
                />
                <DataSummaryCard
                  title={`${distance}km`}
                  subtitle={t('citizen:dataviz.trainline.travelled')}
                  color={mainColor}
                />
                <DataSummaryCard
                  title={`${moneySpent}€`}
                  subtitle={t('citizen:dataviz.trainline.spent')}
                  color={mainColor}
                />
                <DataSummaryCard
                  title={`${totalTravels}`}
                  subtitle={t('citizen:dataviz.trainline.travels')}
                  color={mainColor}
                />
                <DataSummaryCard
                  title={`${co2}kg`}
                  subtitle={t('citizen:dataviz.trainline.emitCo2')}
                  color={mainColor}
                />
              </DataSummaryBox>
            </div>
        ),
      )}
    </div>
  );
};

TrainlineDataviz.propTypes = {
  decryptedBlob: PropTypes.object.isRequired,
  application: PropTypes.shape({
    mainColor: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['citizen'])(TrainlineDataviz);
