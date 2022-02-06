import StorageResponse from "src/storage/domain/S3StorageResponse";
import generateStringId from "../../utils/generateId";
import PostBody from "../api/PostBody";
import Post from "../domain/Post";

export default class PostAssembler {
  public assemblePost(postRequest: PostBody, storageResponse: StorageResponse): Post {
    const postId: string = generateStringId();

    return {
      caption: postRequest.caption,
      hashtags: postRequest.hashtags,
      author: postRequest.author,
      imageUrl: storageResponse.Location,
      id: postId
    };
  }
}
