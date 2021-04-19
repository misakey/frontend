import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import routes from 'routes';

import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import { useTranslation } from 'react-i18next';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import makeStyles from '@material-ui/core/styles/makeStyles';

import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import PersonAddIcon from '@material-ui/icons/PersonAdd';

// HOOKS
const useStyles = makeStyles(() => ({
  buttonLabel: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

// COMPONENTS
const IconButtonBoxesShare = forwardRef(({ box, ...rest }, ref) => {
  const { id } = useSafeDestr(box);
  const { t } = useTranslation('common');
  const classes = useStyles();

  const label = useMemo(
    () => t('common:share'),
    [t],
  );

  const to = useGeneratePathKeepingSearchAndHash(routes.boxes.read.sharing, { id });

  return (
    <Button
      ref={ref}
      variant="text"
      classes={{ label: classes.buttonLabel }}
      component={Link}
      to={to}
      aria-label={label}
      {...rest}
    >
      <PersonAddIcon color="action" />
      <Typography variant="caption" color="textSecondary">
        {label}
      </Typography>
    </Button>
  );
});

IconButtonBoxesShare.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default IconButtonBoxesShare;
