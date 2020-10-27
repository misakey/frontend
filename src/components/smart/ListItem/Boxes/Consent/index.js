import React from 'react';
import PropTypes from 'prop-types';

import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { identifierValuePath } from 'helpers/sender';

import { useSelector } from 'react-redux';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useModifier from '@misakey/hooks/useModifier';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import AvatarUser from '@misakey/ui/Avatar/User';

// CONSTANTS
const { identity: IDENTITY_SELECTOR } = authSelectors;

// COMPONENTS
const ListItemBoxesConsent = ({ children }) => {
  const identity = useSelector(IDENTITY_SELECTOR);
  const { displayName, avatarUrl } = useSafeDestr(identity);
  const identifierValue = useModifier(identifierValuePath, identity);

  return (
    <ListItem>
      <ListItemAvatar>
        <AvatarUser avatarUrl={avatarUrl} displayName={displayName} />
        <ListItemText
          primary={displayName}
          secondary={identifierValue}
        />
      </ListItemAvatar>
      <ListItemSecondaryAction>
        {children}
      </ListItemSecondaryAction>
    </ListItem>
  );
};

ListItemBoxesConsent.propTypes = {
  children: PropTypes.node,
};

ListItemBoxesConsent.defaultProps = {
  children: null,
};

export default ListItemBoxesConsent;
