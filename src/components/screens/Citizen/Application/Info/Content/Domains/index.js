import React, { useCallback, useState } from 'react';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';
import PropTypes from 'prop-types';

import slice from '@misakey/helpers/slice';
import isEmpty from '@misakey/helpers/isEmpty';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import ApplicationSchema from 'store/schemas/Application';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    borderTop: `1px solid ${theme.palette.grey.A100}`,
  },
  title: {
    textTransform: 'uppercase',
    marginRight: theme.spacing(2),
  },
  flexGrow: {
    flexGrow: 1,
  },
  iconButton: {
    transform: 'rotate(0deg)',
    transition: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  },
  expandedIconButton: {
    transform: 'rotate(180deg)',
  },
}));

const DomainListItem = ({ uri }) => (
  <Box component="span" display="inline" mx={1}>
    {uri}
  </Box>
);

DomainListItem.propTypes = {
  uri: PropTypes.string.isRequired,
};

const ApplicationInfoContentDomains = ({ entity, t }) => {
  const classes = useStyles();

  const [collapsed, collapse] = useState(false);
  const handleCollapse = useCallback(
    () => { collapse(!collapsed); },
    [collapse, collapsed],
  );

  if (isEmpty(entity) || isEmpty(entity.domains)) { return null; }

  const domains = entity.domains || [];
  const mainDomains = slice(domains, 0, 3);
  const otherDomains = slice(domains, 3);

  return (
    <Box className={classes.root} px={3} py={2}>
      <Typography className={classes.title} variant="body1" color="textSecondary">
        {t('screens:application.info.domains.title', { count: domains.length })}
      </Typography>
      <Typography className={classes.flexGrow} component="div">
        {mainDomains.map(({ uri }) => (
          <DomainListItem key={`mainDomains-${uri}`} uri={uri} />
        ))}
        <Collapse in={collapsed}>
          {otherDomains.map(({ uri }) => (
            <DomainListItem key={`otherDomains-${uri}`} uri={uri} />
          ))}
        </Collapse>
        {(!collapsed && domains.length > mainDomains.length) && (
          <Button size="small" color="textSecondary" onClick={handleCollapse}>
            {t('screens:application.info.domains.moreCount', { count: otherDomains.length })}
          </Button>
        )}
      </Typography>
      {domains.length > 3 && (
        <Box>
          <IconButton
            onClick={handleCollapse}
            className={clsx(
              classes.iconButton,
              { [classes.expandedIconButton]: collapsed },
            )}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

ApplicationInfoContentDomains.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('screens')(ApplicationInfoContentDomains);
