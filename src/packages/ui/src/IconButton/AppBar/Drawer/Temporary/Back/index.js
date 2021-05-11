import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  HIDE_DRAWER_MAP,
} from '@misakey/ui/constants/drawers';

import getNextSearch from '@misakey/core/helpers/getNextSearch';

import { useTranslation } from 'react-i18next';

import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';


import ArrowBackIcon from '@material-ui/icons/ArrowBack';


// COMPONENTS
const IconButtonAppBarDrawerTemporary = (props) => {
  const { t } = useTranslation('common');
  const { pathname, search, hash } = useLocation();

  const backTo = useMemo(
    () => ({
      pathname,
      hash,
      search: getNextSearch(search, new Map(HIDE_DRAWER_MAP)),
    }),
    [hash, pathname, search],
  );

  return (
    <IconButtonAppBar
      aria-label={t('common:goBack')}
      edge="start"
      component={Link}
      to={backTo}
      {...props}
    >
      <ArrowBackIcon />
    </IconButtonAppBar>
  );
};

export default IconButtonAppBarDrawerTemporary;
