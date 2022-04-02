import PostRequestBody from "../api/PostRequestBody";
import Post from "../domain/Post";
import PostRepository from "../domain/PostRepository";
import PostFactory from "./PostFactory";
import FileAssembler from "../../storage/service/FileAssembler";
import FileRepository from "../../storage/domain/FileRepository";
import UserRepository from "../../user/domain/UserRepository";
import Pagination from "../../utils/pagination/Pagination";
import PostResponse from "../api/PostResponse";
import PostAssembler from "./PostAssembler";
import User from "../../user/domain/User";
import EditPostFieldsRequest from "../api/EditPostFieldsRequest";
import EditPostFields from "../domain/EditPostFields";
import EditPostFieldsAssembler from "./EditPostFieldsAssembler";
import SessionRepository from "../../authentication/domain/SessionRepository";
import Token from "../../authentication/domain/Token";
import UserPreviewService from "../../user/service/UserPreviewService";
import UserPreview from "../../user/domain/UserPreview";
import NotificationService from "../../notifications/service/NotificationService";
import NotificationType from "../../notifications/domain/NotificationType";
import Comment from "../domain/Comment";
import CommentFactory from "./CommentFactory";
import PostCommentRequest from "../api/PostCommentRequest";

export default class PostService {
  constructor(
    private commentFactory: CommentFactory,
    private postFactory: PostFactory,
    private postAssembler: PostAssembler,
    private postRepository: PostRepository,
    private fileRepository: FileRepository,
    private fileAssembler: FileAssembler,
    private notificationService: NotificationService,
    private userRepository: UserRepository,
    private editPostFieldsAssembler: EditPostFieldsAssembler,
    private sessionRepository: SessionRepository,
    private userPreviewService: UserPreviewService
  ) {}

  public async addPost(postRequest: PostRequestBody) {
    const file = this.fileAssembler.assembleFile(postRequest.file);

    const storageReport = await this.fileRepository.storeImage(file);

    const post: Post = this.postFactory.create(postRequest, storageReport.imageUrl);

    await this.postRepository.save(post);
  }

  public async getAuthorPosts(token: string, author: string, pagination: Pagination): Promise<PostResponse[]> {
    await this.userRepository.verifyIfUserExists(author);

    const posts = await this.postRepository.findByAuthor(author, pagination);
    const user = await this.userRepository.findByUsername(author);
    const requesterUsername = await this.sessionRepository.findUsernameWithToken({ value: token });

    return posts.map((post) => this.postAssembler.assemblePostResponse(post, user, requesterUsername));
  }

  public async getPosts(token: string, pagination: Pagination): Promise<Awaited<PostResponse>[]> {
    const posts = await this.postRepository.find(pagination);
    const postResponse = posts.map(async (post) => {
      const user = await this.userRepository.findByUsername(post.author);
      const requesterUsername = await this.sessionRepository.findUsernameWithToken({ value: token });
      return this.postAssembler.assemblePostResponse(post, user as User, requesterUsername);
    });
    return Promise.all(postResponse);
  }

  public async deletePost(id: string) {
    await this.postRepository.delete(id);
  }

  public async getPost(token: string, id: string): Promise<PostResponse> {
    const post = await this.postRepository.findById(id);
    const user = await this.userRepository.findByUsername(post.author);
    const requesterUsername = await this.sessionRepository.findUsernameWithToken({ value: token });
    return this.postAssembler.assemblePostResponse(post, user, requesterUsername);
  }

  public async editPost(token: string, id: string, editPostFieldsRequest: EditPostFieldsRequest): Promise<PostResponse> {
    const postToUpdate: Post = await this.postRepository.findById(id);
    const editPostFields: EditPostFields = this.editPostFieldsAssembler.assembleEditPostFields(editPostFieldsRequest);
    const updatedPost: Post = { ...postToUpdate, ...editPostFields };
    await this.postRepository.update(id, updatedPost);

    const user = await this.userRepository.findByUsername(updatedPost.author);
    const requesterUsername = await this.sessionRepository.findUsernameWithToken({ value: token });

    return this.postAssembler.assemblePostResponse(updatedPost, user, requesterUsername);
  }

  public async likePost(token: string, postId: string): Promise<void> {
    const requester = await this.findRequester(token);
    const postToUpdate = await this.postRepository.findById(postId);
    const user = postToUpdate.likes?.find((username) => username === requester.username);
    if (!user) {
      const updatedLikes = postToUpdate.likes ? [...postToUpdate.likes, requester.username] : [requester.username];
      const updatedPost = { ...postToUpdate, likes: updatedLikes };
      await this.postRepository.update(postId, updatedPost);
      this.notificationService.sendPostNotification({
        postId,
        to: updatedPost.author,
        from: requester.username,
        type: NotificationType.POST_LIKE
      });
    }
  }

  public async unlikePost(token: string, postId: string): Promise<void> {
    const requester = await this.findRequester(token);
    const postToUpdate = await this.postRepository.findById(postId);
    const user = postToUpdate.likes?.find((username) => username === requester.username);
    if (user) {
      const updatedLikes = postToUpdate.likes?.filter((username) => username !== requester.username);
      const updatedPost = { ...postToUpdate, likes: updatedLikes };
      await this.postRepository.update(postId, updatedPost);
    }
  }

  public async commentPost(token: string, postId: string, postCommentRequest: PostCommentRequest): Promise<PostResponse> {
    const requester = await this.findRequester(token);
    const postToUpdate = await this.postRepository.findById(postId);
    const postAuthor = await this.userRepository.findByUsername(postToUpdate.author);
    const comment: Comment = this.commentFactory.create(requester.username, postCommentRequest);

    const updatedComments = [...postToUpdate.comments, comment];
    const updatedPost = await this.postRepository.update(postId, { ...postToUpdate, comments: updatedComments });

    this.notificationService.sendPostNotification({
      postId,
      to: updatedPost.author,
      from: requester.username,
      type: NotificationType.POST_COMMENT
    });

    return this.postAssembler.assemblePostResponse(updatedPost, postAuthor, requester.username);
  }

  public async findPostsByCaption(token: string, caption: string, pagination: Pagination): Promise<PostResponse[]> {
    const posts = await this.postRepository.findByCaption(caption, pagination);
    const postsResponse: PostResponse[] = [];
    for (const post of posts) {
      const user = await this.userRepository.findByUsername(post.author);
      const requesterUsername = await this.sessionRepository.findUsernameWithToken({ value: token });
      postsResponse.push(this.postAssembler.assemblePostResponse(post, user, requesterUsername));
    }
    return postsResponse;
  }

  public async findPostsByHashtags(token: string, hashtags: string[], pagination: Pagination): Promise<PostResponse[]> {
    const posts = await this.postRepository.findByHashtags(hashtags, pagination);
    const postsResponse: PostResponse[] = [];
    for (const post of posts) {
      const user = await this.userRepository.findByUsername(post.author);
      const requesterUsername = await this.sessionRepository.findUsernameWithToken({ value: token });
      postsResponse.push(this.postAssembler.assemblePostResponse(post, user, requesterUsername));
    }
    return postsResponse;
  }

  public async getPostLikes(id: string): Promise<UserPreview[]> {
    const post = await this.postRepository.findById(id);
    return await this.userPreviewService.getUserPreviews(post.likes);
  }

  private findRequester = async (token: string): Promise<User> => {
    const sessionToken: Token = { value: token };
    const requesterUsername = await this.sessionRepository.findUsernameWithToken(sessionToken);
    return this.userRepository.findByUsername(requesterUsername);
  };
}
