import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import moment from 'moment';

import isEmpty from '@misakey/helpers/isEmpty';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';

import Title from 'components/dumb/Typography/Title';
import CardSimpleDoubleText from 'components/dumb/Card/Simple/DoubleText';
import DataboxContent from 'components/smart/Databox/Content';


const CardDatabox = ({
  application,
  databox,
  onContributionDpoEmailClick,
  initCrypto,
  t,
  ...rest
}) => {
  const date = useMemo(
    () => {
      const { createdAt } = databox;
      return moment(createdAt).format('ll');
    },
    [databox],
  );

  const [isClosedByDPO, status] = useMemo(
    () => {
      const { dpoComment, ownerComment } = databox;
      if (!isEmpty(dpoComment)) {
        return [true, dpoComment];
      }
      return [false, ownerComment];
    },
    [databox],
  );

  const durationOfTheRequest = useMemo(
    () => {
      const { createdAt, updatedAt } = databox;

      return moment(updatedAt).to(createdAt, true);
    },
    [databox],
  );

  return (
    <div {...omitTranslationProps(rest)}>
      <Title>
        {t('citizen:application.info.vault.archivedDatabox.title', { date })}
      </Title>
      <CardSimpleDoubleText
        my={2}
        primary={t(`common:databox.${isClosedByDPO ? 'dpoComment' : 'ownerComment'}.${status}`)}
        secondary={t(
          `citizen:application.info.vault.archivedDatabox.closedBy.${isClosedByDPO ? 'dpo' : 'user'}`,
          { duration: durationOfTheRequest },
        )}
      />
      <DataboxContent
        databox={databox}
        application={application}
        onContributionDpoEmailClick={onContributionDpoEmailClick}
        initCrypto={initCrypto}
      />

    </div>
  );
};

CardDatabox.propTypes = {
  t: PropTypes.func.isRequired,
  application: PropTypes.shape(ApplicationSchema.propTypes),
  databox: PropTypes.shape(DataboxSchema.propTypes),
  onContributionDpoEmailClick: PropTypes.func.isRequired,
  initCrypto: PropTypes.func.isRequired,
};

CardDatabox.defaultProps = {
  application: null,
  databox: null,
};


export default (withTranslation(['common', 'citizen'])(CardDatabox));
