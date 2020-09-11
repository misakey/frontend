import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ShareBoxDialog from 'components/smart/Dialog/Boxes/Share';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// COMPONENTS
const ListItemBoxShare = ({ box, t }) => {
  const [open, setOpen] = useState(false);

  const { lifecycle } = useSafeDestr(box);

  const isClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const onClick = useCallback(
    () => {
      setOpen(true);
    },
    [setOpen],
  );

  const onClose = useCallback(
    () => {
      setOpen(false);
    },
    [setOpen],
  );

  return (
    <>
      <ListItem
        button
        divider
        disabled={isClosed}
        onClick={onClick}
        aria-label={t('common:share')}
      >
        <ListItemText
          primary={t('common:share')}
          primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
        />
        {!isClosed && <ChevronRightIcon />}
      </ListItem>
      <ShareBoxDialog
        box={box}
        open={open}
        onClose={onClose}
      />
    </>
  );
};

ListItemBoxShare.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('boxes')(ListItemBoxShare);
