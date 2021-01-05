import PropTypes from 'prop-types';

import { ICON_SIZE } from '@misakey/ui/constants/sizes';

import {
  EmailShareButton,
  EmailIcon,
  FacebookShareButton,
  FacebookIcon,
  LinkedinShareButton,
  LinkedinIcon,
  RedditShareButton,
  RedditIcon,
  TelegramShareButton,
  TelegramIcon,
  TwitterShareButton,
  TwitterIcon,
  WhatsappShareButton,
  WhatsappIcon,
} from 'react-share';

import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';

// COMPONENTS
const ListSocialShare = ({ title, text, url }) => (
  <GridList cellHeight="auto" cols={4}>
    <GridListTile key="email">
      <EmailShareButton
        url={url}
        subject={title}
        body={text}
      >
        <EmailIcon round size={ICON_SIZE} />
      </EmailShareButton>
    </GridListTile>
    <GridListTile key="facebook">
      <FacebookShareButton
        url={url}
        quote={text}
      >
        <FacebookIcon round size={ICON_SIZE} />
      </FacebookShareButton>
    </GridListTile>
    <GridListTile key="linkedin">
      <LinkedinShareButton
        url={url}
        title={title}
        summary={text}
      >
        <LinkedinIcon round size={ICON_SIZE} />
      </LinkedinShareButton>
    </GridListTile>
    <GridListTile key="reddit">
      <RedditShareButton
        url={url}
        title={title}
      >
        <RedditIcon round size={ICON_SIZE} />
      </RedditShareButton>
    </GridListTile>
    <GridListTile key="telegram">
      <TelegramShareButton
        url={url}
        title={title}
      >
        <TelegramIcon round size={ICON_SIZE} />
      </TelegramShareButton>
    </GridListTile>
    <GridListTile key="twitter">
      <TwitterShareButton
        url={url}
        title={title}
      >
        <TwitterIcon round size={ICON_SIZE} />
      </TwitterShareButton>
    </GridListTile>
    <GridListTile key="whatsapp">
      <WhatsappShareButton
        url={url}
        title={title}
      >
        <WhatsappIcon round size={ICON_SIZE} />
      </WhatsappShareButton>
    </GridListTile>
  </GridList>
);

ListSocialShare.propTypes = {
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};

export default ListSocialShare;
