import { forwardRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';

import BoxSchema from 'store/schemas/Boxes';

import isFunction from '@misakey/helpers/isFunction';

import useGetShareMethods from 'hooks/useGetShareMethods';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useTranslation } from 'react-i18next';

import ButtonCopy, { MODE } from '@misakey/ui/Button/Copy';
import DialogConfirm from '@misakey/ui/Dialog/Confirm';
import ListSocialShare from 'components/smart/List/SocialShare';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';

// COMPONENTS
const withDialogShare = (Component) => {
  let ComponentWithDialogShare = ({ box, onClick, ...props }, ref) => {
    const { t } = useTranslation('common');
    const { id, title } = useSafeDestr(box);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const {
      canShareNative,
      onShare,
      shareDetails,
    } = useGetShareMethods(id, title);

    const handleNativeShare = useCallback(
      (e) => {
        if (isFunction(onClick)) {
          onClick(e);
        }
        onShare(e);
      },
      [onClick, onShare],
    );

    const handleShare = useCallback(
      (e) => {
        if (isFunction(onClick)) {
          onClick(e);
        }
        setIsDialogOpen(true);
      },
      [onClick, setIsDialogOpen],
    );

    const onClose = useCallback(
      () => {
        setIsDialogOpen(false);
      },
      [setIsDialogOpen],
    );

    if (canShareNative) {
      return (
        <Component
          ref={ref}
          onClick={handleNativeShare}
          {...props}
        />
      );
    }

    return (
      <>
        <Component
          ref={ref}
          onClick={handleShare}
          {...props}
        />
        <DialogConfirm
          isDialogOpen={isDialogOpen}
          onConfirm={onClose}
          onClose={onClose}
          title={t('common:share')}
          confirmButtonText={t('common:close')}
        >
          <Box my={2} display="flex" alignItems="center" justifyContent="center">
            <ButtonCopy
              value={shareDetails.url}
              message={t('common:copyInvitationLink')}
              mode={MODE.both}
            />
          </Box>
          <Divider />
          <Box minWidth={200} my={2}>
            <ListSocialShare {...shareDetails} />
          </Box>
        </DialogConfirm>
      </>
    );
  };

  ComponentWithDialogShare = forwardRef(ComponentWithDialogShare);

  ComponentWithDialogShare.propTypes = {
    box: PropTypes.shape(BoxSchema.propTypes).isRequired,
    onClick: PropTypes.func,
  };

  ComponentWithDialogShare.defaultProps = {
    onClick: null,
  };
  return ComponentWithDialogShare;
};

export default withDialogShare;
