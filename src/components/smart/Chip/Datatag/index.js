import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import { selectors as datatagSelectors } from 'store/reducers/datatag';

import isNil from '@misakey/core/helpers/isNil';
import getBackgroundAndColorFromString from '@misakey/core/helpers/getBackgroundAndColorFromString';

import makeColorizedStyles from '@misakey/ui/makeColorizedStyles';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useTheme from '@material-ui/core/styles/useTheme';

import Chip from '@misakey/ui/Chip';

// CONSTANTS
const { makeGetDatatagById } = datatagSelectors;

// HOOKS
const useStyles = makeColorizedStyles();

// COMPONENTS
const ChipDatatag = forwardRef(({ datatagId, ...rest }, ref) => {
  const { t } = useTranslation('datatags');
  const theme = useTheme();

  const getDatatagSelector = useMemo(
    () => makeGetDatatagById(),
    [],
  );
  const datatag = useSelector((state) => getDatatagSelector(state, datatagId));
  const { name } = useSafeDestr(datatag);

  const { backgroundColor } = useMemo(
    () => getBackgroundAndColorFromString(name, theme.palette.primary.main),
    [name, theme.palette.primary.main],
  );

  const classes = useStyles({ backgroundColor });

  if (isNil(datatagId)) {
    return (
      <Chip
        ref={ref}
        classes={{ root: classes.colorized }}
        label={t('datatags:default')}
        {...rest}
      />
    );
  }
  return (
    <Chip
      ref={ref}
      classes={{ root: classes.colorized }}
      label={t(`datatags:${name}`)}
      {...rest}
    />
  );
});

ChipDatatag.propTypes = {
  datatagId: PropTypes.string,
};

ChipDatatag.defaultProps = {
  datatagId: null,
};

export default ChipDatatag;
