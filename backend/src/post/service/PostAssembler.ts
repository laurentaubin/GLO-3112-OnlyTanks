import PostResponse from "../api/PostResponse";
import Post from "../domain/Post";
import User from "../../user/domain/User";

export default class PostAssembler {
  public assemblePostResponse(post: Post, user: User, requesterUsername: string): PostResponse {
    return {
      id: post.id,
      imageUrl: post.imageUrl,
      caption: post.caption,
      comments: post.comments,
      userTags: post.userTags,
      hashtags: post.hashtags,
      author: { username: user.username, imageUrl: user.imageUrl },
      commentsPreview: post.comments.slice(-2),
      createdAt: post.createdAt!,
      isLiked: post.likes?.includes(requesterUsername),
      numberOfLikes: post.likes?.length,
      numberOfComments: post.comments?.length
    };
  }
}
