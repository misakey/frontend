import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import routes from 'routes';
import { CLOSED } from 'constants/app/boxes/statuses';
import BoxesSchema from 'store/schemas/Boxes';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// COMPONENTS
const ListItemBoxShare = ({ box, t }) => {
  const { lifecycle, id } = useSafeDestr(box);

  const isClosed = useMemo(
    () => lifecycle === CLOSED,
    [lifecycle],
  );

  const to = useGeneratePathKeepingSearchAndHash(routes.boxes.read.sharing, { id });

  return (
    <>
      <ListItem
        button
        divider
        disabled={isClosed}
        component={Link}
        to={to}
        aria-label={t('common:share')}
      >
        <ListItemText
          primary={t('common:share')}
          primaryTypographyProps={{ noWrap: true, variant: 'overline', color: 'textSecondary' }}
        />
        {!isClosed && <ChevronRightIcon />}
      </ListItem>
    </>
  );
};

ListItemBoxShare.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('boxes')(ListItemBoxShare);
