import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import BoxMessage from '@misakey/ui/Box/Message';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(3),
    textAlign: 'center',
  },
  boxMessage: {
    display: 'inline-flex',
  },
}));

function ApplicationInfoPersonalData({ t }) {
  const classes = useStyles();

  return (
    <Container maxWidth={false} className={classes.root}>
      <BoxMessage type="info" m="auto" className={classes.boxMessage}>
        <Typography>
          {t('screens:wip', { featureName: t('screens:application.nav.personalData', 'PersonalData') })}
        </Typography>
      </BoxMessage>
    </Container>
  );
}

ApplicationInfoPersonalData.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('screens')(ApplicationInfoPersonalData);
