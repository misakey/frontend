import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Grid from '@material-ui/core/Grid';

import ApplicationsCategory from 'components/smart/List/ApplicationsCategory';


const ApplicationCategories = ({ t }) => {
  const categories = window.env.CATEGORIES;

  return (
    <Grid container spacing={3}>
      {
        categories.map((category) => (
          <Grid item md={6} xs={12} key={category.label}>
            <ApplicationsCategory
              categoryName={t(`application.category.${category.label}`)}
              applicationsDomains={category.applicationsDomains}
            />
          </Grid>
        ))
      }
    </Grid>
  );
};

ApplicationCategories.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(ApplicationCategories);
