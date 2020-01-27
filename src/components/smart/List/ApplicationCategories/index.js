import React from 'react';

import Grid from '@material-ui/core/Grid';

import ApplicationsCategory from 'components/smart/List/ApplicationsCategory';


const ApplicationCategories = () => {
  const categories = window.env.CATEGORIES;

  return (
    <Grid container spacing={3}>
      {
        categories.map((category) => (
          <Grid item md={6} xs={12} key={category}>
            <ApplicationsCategory category={category} />
          </Grid>
        ))
      }
    </Grid>
  );
};

export default ApplicationCategories;
