import React, { useMemo, useCallback } from 'react';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import routes from 'routes';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Fab from '@material-ui/core/Fab';
import Box from '@material-ui/core/Box';
import Badge from '@material-ui/core/Badge';
import Email from '@material-ui/icons/Email';
import withDialogConnect from 'components/smart/Dialog/Connect/with';
import { bulkSelectionSetSelected } from 'store/actions/bulkSelection';

const useStyles = makeStyles((theme) => ({
  root: {
    position: 'fixed',
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 1,
  },
  badge: {
    margin: theme.spacing(1),
  },
  button: {
    marginBottom: theme.spacing(1),
  },
}));

const AuthRequiredFab = withDialogConnect(Fab);
const BULK_CONTACT_ROUTES = routes.citizen.contact._;

function MultipleContactButton({ t, selectedApplications, dispatchClearSelection }) {
  const classes = useStyles();
  const history = useHistory();
  const { pathname } = useLocation();
  const isEmpty = useMemo(() => selectedApplications.length === 0, [selectedApplications.length]);
  const count = useMemo(() => selectedApplications.length, [selectedApplications.length]);
  const displayButton = useMemo(() => pathname !== BULK_CONTACT_ROUTES, [pathname]);
  const contact = useCallback(() => {
    history.push(BULK_CONTACT_ROUTES);
  }, [history]);

  if (isEmpty || !displayButton) {
    return null;
  }
  return (
    <Box className={classes.root} display="flex" flexDirection="column">
      <Fab
        variant="extended"
        color="primary"
        className={classes.button}
        onClick={dispatchClearSelection}
      >
        {t('citizen__new:contact.bulk.unselectAll')}
      </Fab>

      <AuthRequiredFab variant="extended" color="secondary" className={classes.button} onClick={contact}>
        <Badge badgeContent={count} color="primary" className={classes.badge}>
          <Email />
        </Badge>
        {t('citizen__new:contact.bulk.contact')}
      </AuthRequiredFab>
    </Box>

  );
}

MultipleContactButton.propTypes = {
  t: PropTypes.func.isRequired,
  selectedApplications: PropTypes.arrayOf(PropTypes.string).isRequired,
  dispatchClearSelection: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  selectedApplications: state.bulkSelection.selected,
});

const mapDispatchToProps = (dispatch) => ({
  dispatchClearSelection: () => dispatch(bulkSelectionSetSelected([])),
});

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(['citizen__new'])(MultipleContactButton));
