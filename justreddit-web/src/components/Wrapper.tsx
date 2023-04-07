import { Box } from "@chakra-ui/react";
import React, { FC, ReactNode } from "react";

interface WrapperProps {
  children?: ReactNode;
  variant?: "small" | "regular";
}

export const Wrapper: FC<WrapperProps> = ({
  children,
  variant = "regular",
}) => {
  return (
    <Box
      mt={8}
      mx="auto"
      maxW={variant === "regular" ? "800px" : "400px"}
      w="100%"
    >
      {children}
    </Box>
  );
};
