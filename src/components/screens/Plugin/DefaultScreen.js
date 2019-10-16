import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import 'components/screens/Plugin/DefaultScreen.scss';

// HOOKS
const useStyles = makeStyles(() => ({
  title: {
    fontFamily: '"Futura Std Bold"',
    opacity: '0.1',
  },
}));

// COMPONENTS
const DefaultScreen = ({ t }) => {
  const classes = useStyles();

  return (
    <Container maxWidth={false} className="DefaultScreen">
      <div className="flexWrapper">
        <Typography variant="h3" className={classes.title} color="primary">
          {t('projectName', 'Misakey')}
        </Typography>
      </div>
    </Container>
  );
};

DefaultScreen.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common'])(DefaultScreen);
