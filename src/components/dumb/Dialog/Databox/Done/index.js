import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { DPO_COMMENTS, DONE } from 'constants/databox/comment';

import useMediaQuery from '@material-ui/core/useMediaQuery';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Dialog from '@material-ui/core/Dialog';
import DialogTitleWithClose from 'components/dumb/Dialog/Title/WithCloseIcon';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import useTheme from '@material-ui/core/styles/useTheme';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(3),
  },
  dialogContentTextRoot: {
    textAlign: 'center',
  },
  avatar: ({ isDone }) => ({
    backgroundColor: isDone ? theme.palette.secondary.main : theme.palette.primary.main,
  }),
}));

const CommentListItem = ({ comment, onSelect, t }) => {
  const isDone = useMemo(() => comment === DONE, [comment]);
  const classes = useStyles({ isDone });
  const onClick = useCallback(() => onSelect(comment), [comment, onSelect]);

  return (
    <ListItem button divider onClick={onClick}>
      <ListItemAvatar>
        <Avatar className={classes.avatar}>
          {isDone ? <ThumbUpIcon /> : <ThumbDownIcon />}
        </Avatar>
      </ListItemAvatar>
      <ListItemText primary={t(`common:databox.dpoComment.${comment}`)} />
      <ChevronRightIcon />
    </ListItem>
  );
};

CommentListItem.propTypes = {
  comment: PropTypes.oneOf(DPO_COMMENTS).isRequired,
  onSelect: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

const CommentItem = withTranslation('common')(CommentListItem);

// COMPONENTS
const DialogDataboxDone = ({ onClose, onSelect, open, t }) => {
  const classes = useStyles();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      aria-labelledby="databox-done-dialog-title"
      aria-describedby="databox-done-dialog-description"
    >
      <DialogTitleWithClose id="databox-done-dialog-title" onClose={onClose} />
      <DialogContent className={classes.dialogContentRoot}>
        <DialogContentText
          classes={{ root: classes.dialogContentTextRoot }}
          id="databox-done-dialog-description"
        >
          {t('dpo:requests.doneDialog.description')}
        </DialogContentText>
        <List>
          {DPO_COMMENTS.map((comment) => (
            <CommentItem key={comment} comment={comment} onSelect={onSelect} />
          ))}
        </List>
      </DialogContent>
    </Dialog>

  );
};

DialogDataboxDone.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelect: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation(['dpo'])(DialogDataboxDone);
