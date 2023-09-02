import React from "react";
import Link from "next/link";
import { Typography } from "@mui/material";
import { FooterContainer } from "@/styles/styles";

const PublicFooter = () => {
  return (
    <FooterContainer sx={{ flexGrow: 1 }}>
      <Typography variant="body1">
        © {new Date().getFullYear()}{" "}
        <Link
          href="https://myopencourt.org/"
          target="_blank"
          style={{ textDecoration: "none" }}
        >
          Conflict Analytics Lab
        </Link>
        . All rights reserved.
      </Typography>
    </FooterContainer>
  );
};

export default PublicFooter;
