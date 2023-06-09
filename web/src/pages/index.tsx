import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { EditDeletePostButtons } from "../components/EditDeletePostButtons";
import { Layout } from "../components/Layout";
import { UpvoteSection } from "../components/UpvoteSection";
import { usePostsQuery } from "../generated/graphql";
import { withApollo } from "../utils/withApollo";

const Index = () => {
  const { data, error, loading, fetchMore, variables } = usePostsQuery({
    variables: { limit: 15, cursor: null as string | null },
    notifyOnNetworkStatusChange: true,
  });

  if (!loading && !data) {
    return (
      <Layout>
        <div>Something went wrong while fetching your data.</div>
        <div>{error?.message}</div>
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

                    <Box ml="auto">
                      <EditDeletePostButtons
                        id={p.id}
                        creatorId={p.creator.id}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            )
          )}
          {data.posts.hasMore && (
            <Button
              onClick={() => {
                fetchMore({
                  variables: {
                    limit: variables?.limit,
                    cursor:
                      data.posts.posts[data.posts.posts.length - 1].createdAt,
                  },
                  // updateQuery: (previousValue, { fetchMoreResult }) => {
                  //   if (!fetchMoreResult) {
                  //     return previousValue;
                  //   }

                  //   return {
                  //     __typename: "Query",
                  //     posts: {
                  //       __typename: "PaginatedPosts",
                  //       hasMore: fetchMoreResult.posts.hasMore,
                  //       posts: [
                  //         ...previousValue.posts.posts,
                  //         ...fetchMoreResult.posts.posts,
                  //       ],
                  //     },
                  //   };
                  // },
                });
              }}
              isLoading={loading}
            >
              Load more
            </Button>
          )}
        </Stack>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Index);
