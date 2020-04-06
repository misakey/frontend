import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';

import CardSimpleDoubleText from 'components/dumb/Card/Simple/DoubleText';

const CardDatabox = ({
  application,
  databox,
  initCrypto,
  t,
  ...rest
}) => {
  const archivedAt = useMemo(
    () => {
      const { updatedAt } = databox;
      return moment(updatedAt).format('ll');
    },
    [databox],
  );

  return (
    <div {...omitTranslationProps(rest)}>
      <CardSimpleDoubleText
        my={2}
        primary={t('citizen:requests.read.archived.title')}
        secondary={t('citizen:requests.read.archived.subtitle', { at: archivedAt })}
      />
    </div>
  );
};

CardDatabox.propTypes = {
  t: PropTypes.func.isRequired,
  application: PropTypes.shape(ApplicationSchema.propTypes),
  databox: PropTypes.shape(DataboxSchema.propTypes),
  initCrypto: PropTypes.func.isRequired,
};

CardDatabox.defaultProps = {
  application: null,
  databox: null,
};


export default (withTranslation(['common', 'citizen'])(CardDatabox));
