import React from 'react';
import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';

import BoxAccount from 'components/smart/Box/Account';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import { Link } from 'react-router-dom';
import ArrowBack from '@material-ui/icons/ArrowBack';

// COMPONENTS
const DrawerAccountContent = ({ backTo, ...props }) => {
  const { t } = useTranslation('common');
  return (
    <BoxAccount {...props} minHeight="100%" overflow="hidden">
      <IconButtonAppBar
        aria-label={t('common:goBack')}
        edge="start"
        component={Link}
        to={backTo}
      >
        <ArrowBack />
      </IconButtonAppBar>
    </BoxAccount>
  );
};


DrawerAccountContent.propTypes = {
  backTo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
};

export default DrawerAccountContent;
