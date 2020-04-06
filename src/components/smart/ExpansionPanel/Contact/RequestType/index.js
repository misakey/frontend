import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { withTranslation } from 'react-i18next';

import DataboxSchema from 'store/schemas/Databox';

import API from '@misakey/api';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import REQUEST_TYPES, { UNKNOWN } from 'constants/databox/type';
import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import makeStyles from '@material-ui/core/styles/makeStyles';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummaryContact from 'components/dumb/ExpansionPanelSummary/Contact';
import Typography from '@material-ui/core/Typography';
import RequestTypeAvatar from 'components/dumb/Avatar/RequestType';
import { Box, ListItem, List } from '@material-ui/core';
import { updateEntities } from '@misakey/store/actions/entities';

// HELPERS
const updateRequest = (id, type) => API
  .use(API.endpoints.application.box.update)
  .build({ id }, { type })
  .send();

// HOOKS
const useStyles = makeStyles((theme) => ({
  expansionPanelRoot: {
    marginBottom: theme.spacing(1),
  },
  expansionPanelDetails: {
    paddingLeft: 0,
  },
  list: {
    width: '100%',
  },
  listItem: {
    paddingLeft: theme.spacing(3),
  },
}));

// COMPONENTS
const RequestType = ({ type, t, ...rest }) => {
  const title = useMemo(
    () => {
      if (type === UNKNOWN) {
        return t('citizen:requests.read.type.placeholder');
      }
      return t(`citizen:contact.email.subject.value.${type}`);
    },
    [t, type],
  );


  return (
    <Box display="flex" alignItems="center" {...omitTranslationProps(rest)}>
      <RequestTypeAvatar type={type} />
      <Typography>
        {title}
      </Typography>
    </Box>
  );
};

RequestType.propTypes = {
  type: PropTypes.oneOf(REQUEST_TYPES).isRequired,
  t: PropTypes.func.isRequired,
};

const RequestTypeRow = withTranslation('citizen')(RequestType);

const ExpansionPanelContactRequestType = ({ request, ...rest }) => {
  const classes = useStyles();
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
    (newType) => updateRequest(id, newType)
      .then(() => {
        const entities = [{ id, changes: { type: newType } }];
        dispatch(updateEntities(entities, DataboxSchema));
        onChange(null, false);
      })
      .catch(handleGenericErrors),
    [dispatch, handleGenericErrors, id, onChange],
  );

  const onChooseType = useCallback(
    (newType) => () => onChangeRequestType(newType),
    [onChangeRequestType],
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
        classes={{ root: classes.expansionPanelRoot }}
        elevation={0}
        {...omitTranslationProps(rest)}
      >
        <ExpansionPanelSummaryContact
          aria-controls="panel-request-type-choose-content"
          id="panel-request-type-choose-header"
          {...rest}
        >
          <RequestTypeRow type={type} />
        </ExpansionPanelSummaryContact>
        <ExpansionPanelDetails className={classes.expansionPanelDetails}>
          <List className={classes.list}>
            {requestTypesList.map((option) => (
              <ListItem
                disableGutters
                key={option}
                className={classes.listItem}
                onClick={onChooseType(option)}
                button
              >
                <RequestTypeRow type={option} />
              </ListItem>
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
