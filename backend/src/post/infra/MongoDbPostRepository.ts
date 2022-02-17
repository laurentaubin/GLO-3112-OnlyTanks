import Post from "../domain/Post";
import PostModel, { PostDto } from "./models/PostModel";
import PostRepository from "../domain/PostRepository";
import MongoDbPostAssembler from "./MongoDbPostAssembler";
import Pagination from "../../utils/pagination/Pagination";
import MongoDbQuery from "../../utils/pagination/MongoDbQuery";
import Paginator from "../../utils/pagination/Paginator";

class MongoDbPostRepository implements PostRepository {
  constructor(private mongoDBPostAssembler: MongoDbPostAssembler, private paginator: Paginator) {}

  public save(post: Post) {
    const postModel = this.mongoDBPostAssembler.assemblePostModel(post);

    postModel.save();
  }

  public async findByAuthor(author: string, pagination: Pagination): Promise<Post[]> {
    const query: MongoDbQuery = PostModel.find({ author }).sort("-createdAt");

    return this.fetchPosts(pagination, query);
  }

  public async find(pagination: Pagination): Promise<Post[]> {
    const query: MongoDbQuery = PostModel.find().sort("-createdAt");

    return this.fetchPosts(pagination, query);
  }

  private async fetchPosts(pagination: Pagination, query: MongoDbQuery): Promise<Post[]> {
    query = this.paginator.addToQuery(pagination, query);

    const postsQuery = (await query.find()) as unknown as PostDto[];

    return postsQuery.map(this.mongoDBPostAssembler.assemblePost);
  }
}

export default MongoDbPostRepository;
