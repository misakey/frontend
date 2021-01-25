import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import { Link } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { Trans, useTranslation } from 'react-i18next';

// CONSTANTS
const DEFAULT_QUERIER = 'Misakey';

const I18N_KEY = 'components:requireAccess.title';

// COMPONENTS
const TransRequireAccess = ({ querier, to, i18nKey }) => {
  const { t } = useTranslation('components');

  const linkProps = useMemo(
    () => {
      if (isNil(querier)) {
        return { href: t('components:requireAccess.href') };
      }
      if (isNil(to)) {
        return {};
      }
      return { component: Link, to };
    },
    [querier, t, to],
  );

  const values = useMemo(
    () => ({ querier: isNil(querier) ? DEFAULT_QUERIER : querier }),
    [querier],
  );

  return (
    <Trans values={values} i18nKey={i18nKey}>
      <MuiLink {...linkProps}>{'{{querier}}'}</MuiLink>
      {' requires access to the information below'}
    </Trans>
  );
};

TransRequireAccess.propTypes = {
  querier: PropTypes.string,
  to: PropTypes.string,
  i18nKey: PropTypes.string,
};

TransRequireAccess.defaultProps = {
  querier: null,
  to: null,
  i18nKey: I18N_KEY,
};

export default TransRequireAccess;
