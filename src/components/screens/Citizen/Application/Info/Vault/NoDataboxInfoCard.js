import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import Card from 'components/dumb/Card';
import CardContent from '@material-ui/core/CardContent';
import Title from 'components/dumb/Typography/Title';

// HOOKS
const useStyles = makeStyles(() => ({
  portabilityIllu: {
    width: '100%',
  },
}));

function NoDataboxInfoCard({ t }) {
  const classes = useStyles();

  return (
    <>
      <Title>
        {t('citizen:application.info.vault.info.title')}
      </Title>
      <Card mb={3} dense>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item sm={8} xs={12}>
              <Typography>
                <Trans i18nKey="citizen:application.info.vault.info.details">
                  Votre coffre-fort est chiffré par une clé secrète, elle même protégée par votre
                  mot de passe. Vous seul avez accès à cette clé qui permet de lire les données
                  contenues dans votre coffre. Lorsqu’un site vous envoie des données, elles sont
                  chiffrées avant d’être envoyées dans votre coffre afin que vous seul puissiez y
                  accéder. Misakey ne peut pas lire vos données.
                  <br />
                  <br />
                  En cas de perte de votre mot de passe, vos données ne seront plus accessibles.
                </Trans>
              </Typography>
            </Grid>
            <Hidden xsDown>
              <Grid item sm={1} />
              <Grid item sm={3}>
                <img
                  src="/img/illustrations/portability.png"
                  className={classes.portabilityIllu}
                  alt={t('citizen:application.info.vault.info.altIllu')}
                />
              </Grid>
            </Hidden>
          </Grid>
        </CardContent>
      </Card>
    </>
  );
}

NoDataboxInfoCard.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['citizen'])(NoDataboxInfoCard);
