import React, { useRef, useEffect, useMemo } from 'react';

import PropTypes from 'prop-types';
import moment from 'moment';
import { connect } from 'react-redux';

import { selectors as authSelectors, PROP_TYPES as AUTH_PROPS_TYPES } from '@misakey/react-auth/store/reducers/auth';
import IdentityNotificationsSchema from 'store/schemas/Notifications/Identity';
import { DATE_FULL_NUMERAL, TIME } from '@misakey/ui/constants/formats/dates';
import { SUPPORTED_TYPES, BOX_AUTO_INVITE, USER_CREATE_IDENTITY } from 'constants/app/notifications/byIdentity';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';

import { denormalize } from 'normalizr';
import isNil from '@misakey/helpers/isNil';


import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useDateFormatMemo } from '@misakey/hooks/useDateFormat';

import EventCard from 'components/dumb/Card/Event';
import Typography from '@material-ui/core/Typography';
import AutoInvitationButton from 'components/screens/app/Notifications/Actions/AutoInvitationButton';
import ButtonCreateAccount from '@misakey/react-auth/components/Button/CreateAccount';
import Box from '@material-ui/core/Box';

// CONSTANTS
export const INNER_SPACING = 12;
const NOT_ACK_STYLE = { style: { fontWeight: 800 } };

// COMPONENTS
const MessageRow = ({
  index, style, setSize,
  notification, previousNotification, data,
  acr, identity,
}) => {
  const rowRoot = useRef(null);
  const { t } = useTranslation(['boxes', 'common']);

  const { hasNextPage } = useSafeDestr(data);

  const { displayName } = useSafeDestr(identity);

  const author = useMemo(
    () => ({ displayName: t('boxes:notifications.byIdentity.displayName'), avatarUrl: 'https://static.misakey.com/ssoClientsLogo/misakey.png' }),
    [t],
  );

  const {
    createdAt,
    type = '',
    details = {},
    acknowledgedAt,
  } = useSafeDestr(notification);

  const { createdAt: previousCreatedAt } = useSafeDestr(previousNotification);

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
    () => t(`boxes:notifications.byIdentity.types.${type}`, { ...details, displayName }),
    [details, t, type, displayName],
  );

  const actions = useMemo(
    () => {
      if (type === BOX_AUTO_INVITE) {
        return <AutoInvitationButton notification={notification} />;
      }
      if (type === USER_CREATE_IDENTITY && acr === 1) {
        return <ButtonCreateAccount standing={BUTTON_STANDINGS.TEXT} text={t('common:setupPassword')} />;
      }
      return null;
    },
    [type, t, acr, notification],
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
      <Box display="flex" flexDirection="column" ref={rowRoot}>
        {SUPPORTED_TYPES.includes(type) && (
          <>
            {!isNil(dateTitle) && (
              <Typography
                align="center"
                color="textPrimary"
                variant="caption"
              >
                {dateTitle}
              </Typography>
            )}
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
      </Box>
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
  // CONNECT
  acr: AUTH_PROPS_TYPES.acr.isRequired,
  identity: AUTH_PROPS_TYPES.identity.isRequired,
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
  return {
    acr: authSelectors.acr(state),
    identity: authSelectors.identity(state),
    notification,
    previousNotification,
  };
};

export default connect(mapStateToProps, null)(MessageRow);
