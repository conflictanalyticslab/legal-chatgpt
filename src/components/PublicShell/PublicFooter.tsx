import React from "react";
import Link from "next/link";

const PublicFooter = () => {
  return (
    <footer className="border-t-[2px] border-border py-[12px] flex items-center justify-center ">
      © {new Date().getFullYear()}{" "}
      <Link
        href="https://myopencourt.org/"
        target="_blank"
        style={{ textDecoration: "none" }}
      >
        Conflict Analytics Lab
      </Link>
      . All rights reserved.
    </footer>
  );
};

export default PublicFooter;
