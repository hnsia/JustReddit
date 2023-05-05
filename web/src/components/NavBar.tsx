import { Box, Button, Flex, Heading, Link } from "@chakra-ui/react";
import React, { useState, useEffect } from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [isServer, setIsServer] = useState(true);
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  const [{ data, fetching }] = useMeQuery({
    pause: isServer,
  });
  let body = null;

  useEffect(() => setIsServer(false), []);

  // data is loading
  if (fetching) {
  } else if (!data?.me) {
    // user not logged in
    body = (
      <>
        <Link as={NextLink} href="/login" mr={2}>
          Login
        </Link>

        <Link as={NextLink} href="/register">
          Register
        </Link>
      </>
    );
  } else {
    // user is logged in
    body = (
      <Flex align="center">
        <Button mr={4}>
          <Link as={NextLink} href="/create-post">
            Create posts
          </Link>
        </Button>

        <Box mr={2}>{data.me.username}</Box>
        <Button
          onClick={() => {
            logout();
          }}
          isLoading={logoutFetching}
          variant="link"
        >
          Logout
        </Button>
      </Flex>
    );
  }
  return (
    <Flex zIndex={1} position="sticky" top={0} bg="tan" p={4} align="center">
      <Flex flex={1} m="auto" align="center" maxW={800}>
        <Link as={NextLink} href="/">
          <Heading>JustReddit</Heading>
        </Link>
        <Box ml={"auto"}>{body}</Box>
      </Flex>
    </Flex>
  );
};
