import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';
import isEmpty from '@misakey/helpers/isEmpty';

import './Simple.scss';

const ServiceSearchSimple = ({ title, t }) => (
  <div id="ServiceSearchSimple">
    <Typography variant="h5" component="h3" align="center" color="textSecondary">
      {isEmpty(title) ? t('service.search.simple.title') : title}
    </Typography>
  </div>
);

ServiceSearchSimple.propTypes = {
  title: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ServiceSearchSimple.defaultProps = {
  title: '',
};

export default withTranslation()(ServiceSearchSimple);
