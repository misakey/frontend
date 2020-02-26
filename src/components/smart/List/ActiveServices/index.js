import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import routes from 'routes';
import { withTranslation } from 'react-i18next';

import Box from '@material-ui/core/Box';

import sampleSize from '@misakey/helpers/sampleSize';

import ApplicationsList from 'components/dumb/List/Applications';
import Card from 'components/dumb/Card';
import Title from 'components/dumb/Typography/Title';
import withActiveServices from 'components/smart/withActiveServices';

import ApplicationSchema from 'store/schemas/Application';

const MAX_ITEMS = 7;

function ActiveServices({
  activeServices,
  isFetchingActiveServices,
  t,
}) {
  const toRoute = useMemo(() => routes.dpo.service._, []);
  const list = useMemo(() => sampleSize(activeServices, MAX_ITEMS), [activeServices]);

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Title>
          {t('dpo__new:services.active')}
        </Title>
      </Box>
      <Card mb={3}>
        <ApplicationsList
          isFetching={isFetchingActiveServices}
          applications={list}
          toRoute={toRoute}
        />
      </Card>
    </>
  );
}

ActiveServices.propTypes = {
  isFetchingActiveServices: PropTypes.bool,
  activeServices: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  t: PropTypes.func.isRequired,
};

ActiveServices.defaultProps = {
  activeServices: [],
  isFetchingActiveServices: false,
};

export default withActiveServices()(withTranslation(['dpo__new'])(ActiveServices));
