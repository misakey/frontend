import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import DialogConfirm from 'components/dumb/Dialog/Confirm';
import Button from '@misakey/ui/Button';

// COMPONENTS
const BulkMailToDialog = ({
  mailtoHrefs,
  setOpenBulkMailToDialog,
  openBulkMailToDialog,
  t,
}) => {
  const [disabled, setDisabled] = useState([]);

  const addToDisabled = useCallback((element) => {
    setDisabled([...disabled, element]);
  }, [disabled]);

  const removeFromDisabled = useCallback((element) => {
    setDisabled(disabled.filter((e) => e !== element));
  }, [disabled]);

  const hideBulkMailToModal = useCallback(
    () => setOpenBulkMailToDialog(false), [setOpenBulkMailToDialog],
  );

  const content = useMemo(() => (
    <List>
      {
        mailtoHrefs.map(({ mailto, href }, index) => {
          const isDisabled = disabled.includes(index);
          const buttonProps = isDisabled ? {
            color: 'primary',
            text: t('citizen:contact.bulk.manual.retry'),
            onClick: () => removeFromDisabled(index),
          } : {
            color: 'secondary',
            text: t('citizen:contact.bulk.manual.open'),
            disabled: isDisabled,
            component: 'a',
            target: '_blank',
            rel: 'noopener noreferrer',
            href,
            onClick: () => addToDisabled(index),
          };
          return (
            <ListItem key={mailto}>
              <ListItemText>{mailto}</ListItemText>
              <ListItemSecondaryAction>
                <Button {...buttonProps} />
              </ListItemSecondaryAction>
            </ListItem>
          );
        })
      }
    </List>
  ), [addToDisabled, disabled, mailtoHrefs, removeFromDisabled, t]);

  return (
    <DialogConfirm
      onConfirm={hideBulkMailToModal}
      setDialogOpen={setOpenBulkMailToDialog}
      isDialogOpen={openBulkMailToDialog}
      dialogContent={content}
      title={t('citizen:contact.bulk.manual.confirm.title')}
      fullWidth
      hideCancelButton
    />
  );
};

BulkMailToDialog.propTypes = {
  mailtoHrefs: PropTypes.arrayOf(PropTypes.shape({
    href: PropTypes.string,
    mailto: PropTypes.string,
  })).isRequired,
  openBulkMailToDialog: PropTypes.bool.isRequired,
  setOpenBulkMailToDialog: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('citizen')(BulkMailToDialog);
