import React, { useMemo, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';


import Typography from '@material-ui/core/Typography';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import extractDataFromJsonBlob from '@misakey/helpers/extractDataFromBlob/Json';
import extractDataFromZipBlob from '@misakey/helpers/extractDataFromBlob/Zip';

import downloadFile from '@misakey/helpers/downloadFile';
import getScreenshotOfElement from '@misakey/helpers/getScreenshotOfElement';

import withWidth, { isWidthUp } from '@material-ui/core/withWidth';
import Grid from '@material-ui/core/Grid';


import SplashScreen from '@misakey/ui/Screen/Splash';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';

import IncompatibleData from 'components/dumb/Dataviz/DefaultContent/IncompatibleData';
import EmptyData from 'components/dumb/Dataviz/DefaultContent/EmptyData';
import DatavizHeader from 'components/dumb/Dataviz/Header';
import DatavizFooter from 'components/dumb/Dataviz/Footer';
import SocialMediaCard from 'components/dumb/Dataviz/Card/SocialMedia';
import VerticalTop from 'components/dumb/Dataviz/Top/Vertical';
import DataSummaryCard from 'components/dumb/Dataviz/Card/DataSummary';

import 'material-design-icons/iconfont/material-icons.css';


import { getDataPerYear } from './helpers';

const useStyles = makeStyles((theme) => ({
  yearTitle: {
    position: 'sticky',
    top: -theme.spacing(2),
    backgroundColor: theme.palette.common.white,
    zIndex: theme.zIndex.mobileStepper,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  },
  yearTitleTypo: {
    fontWeight: 'bold',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    position: 'absolute',
    top: 64,
    bottom: 36,
  },
  gridItem: {
    display: 'flex',
    justifyContent: 'center',
  },
}));

const TrainlineDataviz = ({ decryptedBlob, application, user, t, width }) => {
  const classes = useStyles();

  const { mainColor, name: applicationName } = application;

  const [data, setData] = useState(null);

  const [isSharing, setIsSharing] = useState({});

  useEffect(
    () => {
      // From blob to zip to unzip to get file to json parse
      const { blob, fileExtension } = decryptedBlob;
      if (fileExtension === '.json') {
        extractDataFromJsonBlob(blob, setData);
        blob.text().then((str) => {
          try {
            setData(JSON.parse(str));
          } catch (e) {
            setData({});
          }
        });
      } else if (fileExtension === '.zip') {
        extractDataFromZipBlob(blob, setData);
      } else {
        setData({});
      }
    },
    [decryptedBlob],
  );

  const dataPerYear = useMemo(
    () => (!isNil(data) ? getDataPerYear(data) : null),
    [data],
  );

  const onShare = useCallback(
    (year) => {
      const setIsSharingForYear = (value) => setIsSharing((prevIsSharing) => ({
        ...prevIsSharing,
        [year]: value,
      }));
      return () => {
        setIsSharingForYear(true);

        getScreenshotOfElement(document.getElementById(`datavizcontent-${year}`))
          .then((dataUri) => downloadFile(dataUri, `${applicationName}-${year}.png`))
          .finally(() => {
            setIsSharingForYear(false);
          });
      };
    },
    [applicationName, setIsSharing],
  );

  const isXsScreen = useMemo(
    () => !isWidthUp('sm', width),
    [width],
  );

  if (isNil(data)) {
    return <SplashScreen />;
  }


  if (isNil(dataPerYear)) {
    return <IncompatibleData application={application} />;
  }

  if (isEmpty(dataPerYear)) {
    return <EmptyData application={application} />;
  }

  return (
    <div>
      {dataPerYear.map(
        ({ year, topDestination, timeInTrain, distance, co2, totalTravels, moneySpent }) => (
          <div key={year}>
            <div className={classes.yearTitle}>
              <Typography variant="h5" className={classes.yearTitleTypo}>{year}</Typography>
              <Button
                standing={BUTTON_STANDINGS.MAIN}
                text={t('common:share')}
                size="small"
                onClick={onShare(year)}
                disabled={!!isSharing[year]}
              />
            </div>
            <SocialMediaCard mainColor={mainColor} id={`datavizcontent-${year}`}>
              <DatavizHeader
                user={user}
                application={application}
                subtitle={t('citizen:dataviz.yourHistoryByYear', { year })}
              />
              <div className={classes.cardContent}>
                {!isXsScreen && (
                  <VerticalTop
                    data={topDestination.map(
                      (destination) => ({
                        title: destination.name,
                        subtitle: t(
                          'citizen:dataviz.trainline.visit',
                          { count: destination.totalVisit },
                        ),
                      }),
                    )}
                  />
                )}
                <Grid container>
                  <Grid item xs={6} sm={4} className={classes.gridItem}>
                    <DataSummaryCard
                      icon="train"
                      title={`${Math.round(timeInTrain.asHours())}h`}
                      subtitle={t(
                        'citizen:dataviz.trainline.ofTrain',
                        { count: Math.round(timeInTrain.asHours()) },
                      )}
                      small={isXsScreen}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} className={classes.gridItem}>
                    <DataSummaryCard
                      icon="explore"
                      title={`${distance}km`}
                      subtitle={t('citizen:dataviz.trainline.travelled', { count: distance })}
                      small={isXsScreen}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4} className={classes.gridItem}>
                    <DataSummaryCard
                      icon="euro_symbol"
                      title={`${moneySpent}€`}
                      subtitle={t('citizen:dataviz.trainline.spent', { count: moneySpent })}
                      small={isXsScreen}
                    />
                  </Grid>
                  <Grid item xs={false} sm={2} />
                  <Grid item xs={6} sm={4} className={classes.gridItem}>
                    <DataSummaryCard
                      icon="location_city"
                      title={`${totalTravels}`}
                      subtitle={t('citizen:dataviz.trainline.travels', { count: totalTravels })}
                      small={isXsScreen}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4} className={classes.gridItem}>
                    <DataSummaryCard
                      icon="public"
                      title={`${co2}kg`}
                      subtitle={t('citizen:dataviz.trainline.emitCo2', { count: co2 })}
                      small={isXsScreen}
                    />
                  </Grid>
                </Grid>
              </div>
              <DatavizFooter />
            </SocialMediaCard>
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
    name: PropTypes.string,
  }).isRequired,
  user: PropTypes.shape({
    avatarUri: PropTypes.string,
    displayName: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
  width: PropTypes.string.isRequired,
};

export default withTranslation(['citizen', 'common'])(withWidth()(TrainlineDataviz));
