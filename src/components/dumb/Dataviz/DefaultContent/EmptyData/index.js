import React from 'react';
import PropTypes from 'prop-types';

import { FEEDBACK } from 'constants/emails';

import { withTranslation, Trans } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  box: ({ mainColor }) => ({
    background: mainColor,
    color: theme.palette.common.white,
    padding: theme.spacing(1),
    borderRadius: theme.spacing(2),
  }),
}));


const IncompatibleData = ({ application }) => {
  const { mainColor } = application;

  const classes = useStyles({ mainColor });

  return (
    <Box className={classes.box}>
      <Trans i18nKey="citizen:dataviz.emptyData" values={{ contactEmail: FEEDBACK }}>
        <Typography align="center" variant="h3" paragraph>
          Oups,
        </Typography>
        <Typography align="center" variant="h5" paragraph>
          Votre fichier de portabilité semble ne pas contenir de données que nous pouvons afficher.
        </Typography>
        <Typography align="center" variant="body1">
          Si vous pensez avoir des données exploitables dans votre fichier,
          prévenez nous par e-mail&nbsp;:
          <Link href={`mailto:${FEEDBACK}`} color="inherit">{'{{contactEmail}}'}</Link>
        </Typography>
      </Trans>
    </Box>
  );
};

IncompatibleData.propTypes = {
  application: PropTypes.shape({
    mainColor: PropTypes.string,
  }).isRequired,
};

export default withTranslation(['citizen'])(IncompatibleData);
