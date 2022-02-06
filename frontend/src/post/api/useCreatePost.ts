import { useAxios } from "../../main/hooks/useAxios";
import { PostImageContent } from "./PostImageRequest";

export const useCreatePost = () => {
  const { data, sendRequest, state, error } = useAxios();

  const createPost = (post: PostImageContent) => {
    const formData = new FormData();
    formData.append("image", post.image);
    formData.append("caption", post.caption);
    formData.append("hashtags", JSON.stringify(post.hashtags));
    formData.append("author", post.author);
    sendRequest({ url: "/post", method: "POST", data: formData, headers: { "Content-Type": "multipart/form-data" } });
  };

  return { data, state, createPost, error };
};
