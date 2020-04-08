import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import DataboxSchema from 'store/schemas/Databox';
import { updateEntities } from '@misakey/store/actions/entities';
import API from '@misakey/api';
import REQUEST_TYPES, { UNKNOWN } from 'constants/databox/type';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummaryContact from 'components/dumb/ExpansionPanelSummary/Contact';
import List from '@material-ui/core/List';
import ListItemRequestType from 'components/dumb/ListItem/RequestType';

// HELPERS
const updateRequest = (id, type) => API
  .use(API.endpoints.application.box.update)
  .build({ id }, { type })
  .send();

const ExpansionPanelContactRequestType = ({ request, ...rest }) => {
  const dispatch = useDispatch();
  const handleGenericErrors = useHandleGenericHttpErrors();
  const { type, id } = useMemo(() => request || {}, [request]);

  const [expanded, setExpanded] = useState(type === UNKNOWN);

  const onChange = useCallback(
    (event, nextValue) => {
      setExpanded(nextValue);
    },
    [setExpanded],
  );

  const onChangeRequestType = useCallback(
    (e, newType) => updateRequest(id, newType)
      .then(() => {
        const entities = [{ id, changes: { type: newType } }];
        dispatch(updateEntities(entities, DataboxSchema));
        onChange(null, false);
      })
      .catch(handleGenericErrors),
    [dispatch, handleGenericErrors, id, onChange],
  );

  const requestTypesList = useMemo(
    () => REQUEST_TYPES.filter((element) => element !== type && element !== UNKNOWN),
    [type],
  );

  return (
    <>
      <ExpansionPanel
        expanded={expanded}
        onChange={onChange}
        elevation={0}
        {...rest}
      >
        <ExpansionPanelSummaryContact
          aria-controls="panel-request-type-choose-content"
          id="panel-request-type-choose-header"
          {...rest}
        >
          <ListItemRequestType
            disableGutters
            disableLeftPadding
            type={type}
          />
        </ExpansionPanelSummaryContact>
        <ExpansionPanelDetails>
          <List disablePadding>
            {requestTypesList.map((option) => (
              <ListItemRequestType
                disableGutters
                key={option}
                type={option}
                onClick={onChangeRequestType}
                button
              />
            ))}
          </List>


        </ExpansionPanelDetails>
      </ExpansionPanel>
    </>
  );
};

ExpansionPanelContactRequestType.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes).isRequired,
};

export default ExpansionPanelContactRequestType;
