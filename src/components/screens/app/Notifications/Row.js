import React, { useRef, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { denormalize } from 'normalizr';
import { connect } from 'react-redux';
import { useTranslation } from 'react-i18next';

import EventCard from 'components/dumb/Card/Event';
import IdentityNotificationsSchema from 'store/schemas/Notifications/Identity';
import { DATE_FULL_NUMERAL, TIME } from 'constants/formats/dates';
import isNil from '@misakey/helpers/isNil';
import Typography from '@material-ui/core/Typography';
import { SUPPORTED_TYPES } from 'constants/app/notifications/byIdentity';
import { useDateFormatMemo } from '@misakey/hooks/useDateFormat';
import AutoInvitationButton from 'components/screens/app/Notifications/Actions/AutoInvitationButton';

export const INNER_SPACING = 12;
const NOT_ACK_STYLE = { style: { fontWeight: 800 } };

const MessageRow = ({ index, style, setSize, notification, previousNotification, data }) => {
  const rowRoot = useRef(null);
  const { t } = useTranslation('boxes');

  const { hasNextPage } = useMemo(() => data, [data]);

  const author = useMemo(
    () => ({ displayName: t('boxes:notifications.byIdentity.displayName'), avatarUrl: '/img/logo.png' }),
    [t],
  );

  const {
    createdAt,
    type = '',
    details = {},
    acknowledgedAt,
  } = useMemo(() => notification || {}, [notification]);

  const { createdAt: previousCreatedAt } = useMemo(
    () => previousNotification || {},
    [previousNotification],
  );

  const dateTitle = useMemo(
    () => {
      if ((isNil(previousCreatedAt) && !hasNextPage) || !moment(previousCreatedAt).isSame(moment(createdAt), 'day')) {
        return moment(createdAt).format(DATE_FULL_NUMERAL);
      }
      return null;
    },
    [createdAt, hasNextPage, previousCreatedAt],
  );

  const date = useDateFormatMemo(createdAt, TIME);

  const text = useMemo(
    () => t(`boxes:notifications.byIdentity.types.${type.replace('.', '_')}`, { ...details }),
    [details, t, type],
  );

  const actions = useMemo(
    () => (
      type === 'box.auto_invite' ? <AutoInvitationButton notifDetails={details} /> : null
    ),
    [type, details],
  );

  const titleProps = useMemo(
    () => (isNil(acknowledgedAt) ? NOT_ACK_STYLE : undefined),
    [acknowledgedAt],
  );

  useEffect(
    () => {
      if (rowRoot.current && setSize) {
        setSize(index, rowRoot.current.offsetHeight);
      }
    },
    [index, setSize],
  );

  return (
    <div style={style}>
      <div ref={rowRoot}>
        {SUPPORTED_TYPES.includes(type) && (
          <>
            {!isNil(dateTitle) && <Typography color="textSecondary" align="center">{dateTitle}</Typography>}
            <EventCard
              author={author}
              date={date}
              text={text}
              index={index}
              titleProps={titleProps}
              actions={actions}
            />
          </>
        )}
      </div>
    </div>
  );
};

MessageRow.propTypes = {
  setSize: PropTypes.func.isRequired,
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
  data: PropTypes.shape({
    hasNextPage: PropTypes.bool.isRequired,
    items: PropTypes.object.isRequired,
  }).isRequired,
  notification: PropTypes.shape(IdentityNotificationsSchema.propTypes).isRequired,
  previousNotification: PropTypes.shape(IdentityNotificationsSchema.propTypes),
};

MessageRow.defaultProps = {
  previousNotification: null,
};

// CONNECT
const mapStateToProps = (state, { index, data: { items } }) => {
  const id = items[index];
  const previousId = items[index - 1];
  const notification = id && denormalize(
    id,
    IdentityNotificationsSchema.entity,
    state.entities,
  );
  const previousNotification = previousId && denormalize(
    previousId,
    IdentityNotificationsSchema.entity,
    state.entities,
  );
  return { notification, previousNotification, index };
};

export default connect(mapStateToProps, null)(MessageRow);
