import React from "react";
import Link from "next/link";

const PublicFooter = () => {
  return (
    <footer className="border-t-[2px] border-border py-[12px] flex flex-wrap items-center justify-center gap-2 ">
      © {`${new Date().getFullYear()}`}
      <Link href="https://myopencourt.org/" target="_blank" className="inline-block">
        Conflict Analytics Lab.
      </Link>
      All rights reserved.
    </footer>
  );
};

export default PublicFooter;
