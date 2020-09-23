import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import common from '@misakey/ui/colors/common';

import isNil from '@misakey/helpers/isNil';

import Box from '@material-ui/core/Box';
import BoxControls from '@misakey/ui/Box/Controls';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ThemeProvider from 'components/smart/ThemeProvider';

import CategoryIcon from '@material-ui/icons/Category';

const ColorsDemo = ({ color, t }) => {
  const colorText = useMemo(
    () => (isNil(color) ? common.secondary : color),
    [color],
  );
  return (
    <ThemeProvider previewColor={color}>
      <Box display="flex" flexDirection="column" mt={5}>
        <Typography variant="h6" color="textSecondary">{t('components:colorDemo.title')}</Typography>
        <List>
          <ListItem selected>
            <ListItemText primaryTypographyProps={{ color: 'secondary' }}>{colorText}</ListItemText>
            <ListItemSecondaryAction>
              <IconButton color="secondary">
                <CategoryIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primaryTypographyProps={{ color: 'secondary' }}>{colorText}</ListItemText>
            <ListItemSecondaryAction>
              <Button standing={BUTTON_STANDINGS.OUTLINED} text={colorText} />
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primaryTypographyProps={{ color: 'secondary' }}><MuiLink color="secondary">{colorText}</MuiLink></ListItemText>
          </ListItem>
        </List>
        <BoxControls
          width="50%"
          alignSelf="center"
          primary={{ text: colorText }}
          secondary={{ standing: BUTTON_STANDINGS.TEXT, text: colorText }}
        />
      </Box>
    </ThemeProvider>
  );
};

ColorsDemo.propTypes = {
  color: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ColorsDemo.defaultProps = {
  color: null,
};

export default withTranslation('components')(ColorsDemo);
