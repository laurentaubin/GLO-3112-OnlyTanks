import type { NextPage } from "next";
import { useRouter } from "next/router";
import { SpinnerIcon } from "../main/components/SpinnerIcon";
import { State } from "../main/hooks/useAxios";
import { Layout } from "../main/layout/Layout";
import { useAuthorPosts } from "../profile/api/usePost";
import { useUser } from "../main/api/user/useUser";
import UserProfile from "../profile/UserProfile";
import NotFoundPage from "../main/components/NotFoundPage";

const User: NextPage = () => {
  const router = useRouter();
  const { username } = router.query;
  const { user, state } = useUser(username as string);
  const { posts } = useAuthorPosts(username as string);

  return (
    <Layout>
      {state === State.LOADING ? <SpinnerIcon size={20} /> : <> {user ? <UserProfile posts={posts} user={user} /> : <NotFoundPage />} </>}
    </Layout>
  );
};

export default User;
