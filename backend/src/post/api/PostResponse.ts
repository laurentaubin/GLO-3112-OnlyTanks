import UserPreview from "./UserPreview";

interface PostResponse {
  imageUrl: string;
  id: string;
  caption: string;
  hashtags: string[];
  author: UserPreview;
  createdAt: number;
}

export default PostResponse;
