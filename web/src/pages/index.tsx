import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import NextLink from "next/link";
import { useState } from "react";
import { Layout } from "../components/Layout";
import { UpvoteSection } from "../components/UpvoteSection";
import { useDeletePostMutation, usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { DeleteIcon } from "@chakra-ui/icons";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 15,
    cursor: null as string | null,
  });
  const [{ data, fetching }] = usePostsQuery({ variables });
  const [, deletePost] = useDeletePostMutation();

  if (!fetching && !data) {
    return (
      <Layout>
        <div>Something went wrong while fetching your data.</div>
      </Layout>
    );
  }

  return (
    <Layout>
      {!data ? (
        <div>Loading...</div>
      ) : (
        <Stack spacing={8}>
          {data.posts.posts.map((p) =>
            !p ? null : ( // check for nulls from cache invalidations to prevent crash
              <Flex key={p.id} p={5} shadow="md" borderWidth="1px">
                <UpvoteSection post={p} />
                <Box flex={1}>
                  <Link as={NextLink} href={`/post/${p.id}`}>
                    <Heading fontSize="xl">{p.title}</Heading>
                  </Link>
                  <Text>posted by {p.creator.username}</Text>
                  <Flex align="center">
                    <Text flex={1} mt={4}>
                      {p.textSnippet}......
                    </Text>
                    <IconButton
                      aria-label="Delete post"
                      colorScheme="red"
                      icon={<DeleteIcon />}
                      onClick={() => {
                        deletePost({ id: p.id });
                      }}
                    />
                  </Flex>
                </Box>
              </Flex>
            )
          )}
          {data.posts.hasMore && (
            <Button
              onClick={() => {
                setVariables({
                  limit: variables.limit,
                  cursor:
                    data.posts.posts[data.posts.posts.length - 1].createdAt,
                });
              }}
              isLoading={fetching}
            >
              Load more
            </Button>
          )}
        </Stack>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
