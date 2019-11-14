import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import routes from 'routes';

import omitTranslationProps from 'helpers/omit/translationProps';

import ListItem from '@material-ui/core/ListItem';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import withDialogConnect from 'components/smart/Dialog/Connect/with';


const useStyles = makeStyles(() => ({
  listItemRoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

// COMPONENTS
const DialogConnectButton = withDialogConnect(Button);

const DialogSearchBottomAction = ({ t, ...props }) => {
  const classes = useStyles();

  const emptyLinkTo = useMemo(
    () => routes.citizen.applications.create,
    [],
  );

  return (
    <ListItem component="div" classes={{ root: classes.listItemRoot }} {...omitTranslationProps(props)}>
      <Typography paragraph variant="body2" color="textSecondary" align="left">
        {t('screens:applications.notFound.subtitle')}
      </Typography>
      <DialogConnectButton
        variant="contained"
        color="secondary"
        to={emptyLinkTo}
        component={Link}
        aria-label={t('screens:applications.notFound.button')}
      >
        {t('screens:applications.notFound.button')}
      </DialogConnectButton>
    </ListItem>
  );
};

DialogSearchBottomAction.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('screens')(DialogSearchBottomAction);
