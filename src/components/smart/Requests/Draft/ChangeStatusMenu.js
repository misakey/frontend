import React, { useCallback, useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';

function MenuChangeStatus({ t, isValidRequest, onPassToOpen, onDelete }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = useMemo(() => Boolean(anchorEl), [anchorEl]);

  const handleClick = useCallback((event) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  return (
    <>
      <IconButton
        aria-label="more"
        aria-controls="request-status-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="request-status-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {isValidRequest && (
          <MenuItem key="draftToOpen" onClick={onPassToOpen}>
            {t('citizen:requests.read.move.fromDraftToOpen')}
          </MenuItem>
        )}
        <MenuItem key="deleteRequest" onClick={onDelete}>
          {t('citizen:requests.read.delete.text')}
        </MenuItem>
      </Menu>
    </>
  );
}


MenuChangeStatus.propTypes = {
  t: PropTypes.func.isRequired,
  isValidRequest: PropTypes.bool.isRequired,
  onPassToOpen: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default withTranslation('citizen')(MenuChangeStatus);
