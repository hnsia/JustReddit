import { Box, Flex, Heading } from "@chakra-ui/react";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { useGetPostFromUrl } from "../../utils/useGetPostFromUrl";
import { withApollo } from "../../utils/withApollo";

const Post: React.FC<unknown> = () => {
  const { data, error, loading } = useGetPostFromUrl();

  if (loading) {
    return (
      <Layout>
        <Box>Loading...</Box>
      </Layout>
    );
  }

  if (error) {
    <Layout>
      <Box>{error.message}</Box>
    </Layout>;
  }

  if (!data?.post) {
    return (
      <Layout>
        <Box>Could not find post</Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Flex>
        <Heading mb={4}>{data.post.title}</Heading>
        <Box ml="auto">
          <EditDeletePostButtons
            id={data.post.id}
            creatorId={data.post.creator.id}
          />
        </Box>
      </Flex>
      {data?.post?.text}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
