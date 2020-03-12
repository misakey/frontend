import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';

import ApplicationCategoriesList from 'components/smart/List/ApplicationCategories';
import ScreenAction from 'components/dumb/Screen/Action';

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 'inherit',
    paddingBottom: theme.spacing(2),
  },
}));

const ApplicationsCategoriesScreen = ({ t }) => {
  const classes = useStyles();
  return (
    <ScreenAction title={t('citizen:applications.select')}>
      <Container maxWidth="md" className={classes.container}>
        <ApplicationCategoriesList />
      </Container>
    </ScreenAction>
  );
};

ApplicationsCategoriesScreen.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('citizen')(ApplicationsCategoriesScreen);
