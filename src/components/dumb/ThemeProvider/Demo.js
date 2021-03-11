import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';


import BoxSection from '@misakey/ui/Box/Section';
import BoxControls from '@misakey/ui/Box/Controls';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MuiLink from '@material-ui/core/Link';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Badge from '@misakey/ui/Badge';
import AvatarBox from '@misakey/ui/Avatar/Box';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ThemeProvider from 'components/smart/ThemeProvider';

import CategoryIcon from '@material-ui/icons/Category';

const ColorsDemo = ({ color, t }) => (
  <ThemeProvider previewColor={color}>
    <BoxSection display="flex" flexDirection="column" mt={5}>
      <Typography variant="h6" color="textSecondary">{t('components:colorDemo.title')}</Typography>
      <List>
        <ListItem selected>
          <ListItemAvatar>
            <Badge
              badgeContent={2}
            >
              <AvatarBox
                title="ABC"
              />
            </Badge>
          </ListItemAvatar>
          <ListItemText primaryTypographyProps={{ color: 'primary' }}>{t('components:colorDemo.chat')}</ListItemText>
          <ListItemSecondaryAction>
            <IconButton color="primary">
              <CategoryIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primaryTypographyProps={{ color: 'primary' }}>{t('components:colorDemo.chat')}</ListItemText>
          <ListItemSecondaryAction>
            <Button standing={BUTTON_STANDINGS.OUTLINED} text={t('components:colorDemo.button')} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem>
          <ListItemText primaryTypographyProps={{ color: 'primary' }}><MuiLink>{t('components:colorDemo.chat')}</MuiLink></ListItemText>
        </ListItem>
      </List>
      <BoxControls
        width="50%"
        alignSelf="center"
        primary={{ text: t('components:colorDemo.button') }}
        secondary={{ standing: BUTTON_STANDINGS.TEXT, text: t('components:colorDemo.button') }}
      />
    </BoxSection>
  </ThemeProvider>
);

ColorsDemo.propTypes = {
  color: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

ColorsDemo.defaultProps = {
  color: null,
};

export default withTranslation('components')(ColorsDemo);
