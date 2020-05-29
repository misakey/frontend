import React, { useState, useMemo, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import MANUAL_TYPE from 'constants/mail-providers/manual';
import { setContactEmail } from 'store/actions/screens/contact';
import { setDataboxOwnerEmail } from 'store/actions/databox';
import UserEmailSchema from 'store/schemas/UserEmail';
import DataboxSchema from 'store/schemas/Databox';

import isNil from '@misakey/helpers/isNil';
import prop from '@misakey/helpers/prop';
import without from '@misakey/helpers/without';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import { patchRequestUserEmailBuilder } from '@misakey/helpers/builder/requests';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useNotDoneEffect from 'hooks/useNotDoneEffect';
import usePropChanged from '@misakey/hooks/usePropChanged';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummaryContactFrom from 'components/dumb/ExpansionPanelSummary/Contact/From';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Fade from '@material-ui/core/Fade';
import Subtitle from 'components/dumb/Typography/Subtitle';

// CONSTANTS
const EMPTY_OBJECT = {};

// HELPERS
const idProp = prop('id');

// HOOKS
const useStyles = makeStyles((theme) => ({
  expansionPanelExpanded: {
    marginBottom: theme.spacing(-2.5),
    // fix for weird logic of expansion panel classes
    // classes.expanded alone doesn't work because default style uses expanded.Mui-expanded
    '&.Mui-expanded': {
      marginBottom: theme.spacing(-2.5),
    },
  },
  listRoot: {
    marginBottom: theme.spacing(1),
  },
}));

const useListItemEmailStyles = makeStyles(() => ({
  listItemTextRoot: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

// COMPONENTS
const ListItemEmail = ({ userEmail, getTypeTranslation, onSelect }) => {
  const classes = useListItemEmailStyles();
  const onClick = useCallback(
    () => onSelect(userEmail),
    [userEmail, onSelect],
  );

  const { email, type } = useMemo(
    () => userEmail,
    [userEmail],
  );

  return (
    <ListItem button onClick={onClick}>
      <ListItemText
        classes={{ root: classes.listItemTextRoot }}
        primary={email}
        primaryTypographyProps={{ noWrap: true }}
      />
      <Typography>
        {getTypeTranslation(type)}
      </Typography>
    </ListItem>
  );
};

ListItemEmail.propTypes = {
  userEmail: PropTypes.shape(UserEmailSchema.propTypes).isRequired,
  getTypeTranslation: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
};

const ExpansionPanelContactFrom = ({
  addButton,
  initialEmail, contactEmail, options,
  databox,
  dispatchSetContactEmail, dispatchSetDataboxOwnerEmail,
  defaultExpanded, t, appName, ...rest
}) => {
  const classes = useStyles();

  const [expanded, setExpanded] = useState(defaultExpanded);

  const selected = useMemo(
    () => {
      const selectedOption = options.find(({ email }) => contactEmail === email);
      return selectedOption || EMPTY_OBJECT;
    },
    [options, contactEmail],
  );

  const notSelectedOptions = useMemo(
    () => without(options, selected),
    [options, selected],
  );

  const { email, type } = useMemo(
    () => selected,
    [selected],
  );

  const databoxId = useMemo(
    () => idProp(databox),
    [databox],
  );

  const selectedEmailChanged = usePropChanged(email);

  const getTypeTranslation = useCallback(
    (contactType) => (contactType === MANUAL_TYPE
      ? t('citizen:contact.providers.manual.label')
      : contactType),
    [t],
  );

  const selectedType = useMemo(
    () => getTypeTranslation(type),
    [getTypeTranslation, type],
  );

  const onChange = useCallback(
    (event, nextValue) => {
      setExpanded(nextValue);
    },
    [setExpanded],
  );

  const onSelectUserEmail = useCallback(
    ({ email: selectedEmail, id }) => Promise.all([
      patchRequestUserEmailBuilder(databoxId, id),
      dispatchSetDataboxOwnerEmail(databoxId, selectedEmail),
      dispatchSetContactEmail(selectedEmail),
    ]),
    [databoxId, dispatchSetContactEmail, dispatchSetDataboxOwnerEmail],
  );

  const onInitUserEmail = useCallback(
    ({ email: selectedEmail }) => Promise.resolve(dispatchSetContactEmail(selectedEmail)),
    [dispatchSetContactEmail],
  );

  useNotDoneEffect(
    (onDone) => {
      // set initial email as contact email at start
      if (!isNil(initialEmail)) {
        const initialOption = options
          .find(({ email: optionEmail }) => initialEmail === optionEmail);
        if (!isNil(initialOption)) {
          onInitUserEmail(initialOption);
          onDone();
        }
      }
    },
    [selected, onSelectUserEmail, initialEmail, onInitUserEmail, options],
  );

  useEffect(
    () => {
      if (selectedEmailChanged) {
        onChange(null, false);
      }
    },
    [selectedEmailChanged, onChange],
  );

  return (
    <>
      <ExpansionPanel
        expanded={expanded}
        onChange={onChange}
        classes={{ expanded: classes.expansionPanelExpanded }}
        elevation={0}
        {...omitTranslationProps(rest)}
      >
        <ExpansionPanelSummaryContactFrom email={email} type={selectedType} />
        <ExpansionPanelDetails>
          <List
            classes={{ root: classes.listRoot }}
            key={notSelectedOptions.length}
            disablePadding
          >
            {notSelectedOptions.map((userEmail) => (
              <ListItemEmail
                key={userEmail.id}
                userEmail={userEmail}
                getTypeTranslation={getTypeTranslation}
                onSelect={onSelectUserEmail}
              />
            ))}
          </List>
          {addButton}
        </ExpansionPanelDetails>
      </ExpansionPanel>
      <Fade in={!expanded && !isNil(appName)}>
        <Subtitle gutterBottom={false}>
          {t('citizen:contact.email.from.subtitle', { appName })}
        </Subtitle>
      </Fade>
    </>
  );
};

ExpansionPanelContactFrom.propTypes = {
  addButton: PropTypes.node,
  initialEmail: PropTypes.string,
  contactEmail: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape(UserEmailSchema.propTypes)),
  databox: PropTypes.shape(DataboxSchema.propTypes).isRequired,
  appName: PropTypes.string,
  defaultExpanded: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  dispatchSetContactEmail: PropTypes.func.isRequired,
  dispatchSetDataboxOwnerEmail: PropTypes.func.isRequired,
};

ExpansionPanelContactFrom.defaultProps = {
  addButton: null,
  initialEmail: null,
  contactEmail: null,
  options: [],
  appName: null,
  defaultExpanded: false,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchSetContactEmail: (email) => Promise.resolve(dispatch(setContactEmail(email))),
  dispatchSetDataboxOwnerEmail: (databoxId, email) => Promise.resolve(
    dispatch(setDataboxOwnerEmail(databoxId, email)),
  ),
});

export default connect(null, mapDispatchToProps)(withTranslation('citizen')(ExpansionPanelContactFrom));
