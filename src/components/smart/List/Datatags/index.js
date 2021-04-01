import React from 'react';

import useFetchUserDatatags from 'hooks/useFetchUserDatatags';
import { useTranslation } from 'react-i18next';

import ListBordered from '@misakey/ui/List/Bordered';
import ListItemDatatagLink from 'components/smart/ListItem/Datatag/Link';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Skeleton from '@material-ui/lab/Skeleton';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import LabelIcon from '@material-ui/icons/Label';
import InfoIcon from '@material-ui/icons/Info';

import isEmpty from '@misakey/core/helpers/isEmpty';

// COMPONENTS
const ListDatatags = (props) => {
  const { t } = useTranslation('organizations');

  const { isFetching, shouldFetch, datatags } = useFetchUserDatatags();

  return (
    <ListBordered {...props}>
      {(isFetching || shouldFetch) ? (
        <ListItem>
          <ListItemIcon>
            <HourglassEmptyIcon />
          </ListItemIcon>
          <ListItemText
            primary={<Skeleton width={200} />}
          />
        </ListItem>

      ) : (
        <>
          {isEmpty(datatags) ? (
            <ListItem>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
              <ListItemText
                primary={t('organizations:datatags.empty')}
              />
            </ListItem>
          ) : datatags.map(({ id, name, ...rest }) => (
            <ListItemDatatagLink id={id} key={id} {...rest}>
              <ListItemIcon>
                <LabelIcon />
              </ListItemIcon>
              <ListItemText
                primary={name}
              />
            </ListItemDatatagLink>
          ))}
        </>
      )}
    </ListBordered>
  );
};

export default ListDatatags;
