import React from "react";
import Link from "next/link";
import { Typography } from "@mui/material";
import { FooterContainer } from "@/styles/styles";

const PublicFooter = () => {
  return (
    <footer className="border-[2px] border-border py-[12px] flex items-center justify-center bg-white">
      <Typography variant="body1" className="text-center">
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
    </footer>
  );
};

export default PublicFooter;
