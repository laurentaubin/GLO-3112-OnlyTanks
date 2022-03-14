import Timestamp from "../Timestamp";
import UserPreview from "../user/UserPreview";
import UserTag from "../UserTag";

interface Post {
  imageUrl: string;
  id: string;
  caption: string;
  hashtags: string[];
  userTags: UserTag[];
  author: UserPreview;
  timestamp: Timestamp;
  isLiked: boolean;
  numberOfLikes: number;
}

export default Post;