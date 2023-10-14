import Link from "next/link";
import {
  SignInButton,
  useUser,
  UserButton,
  SignedIn,
  SignedOut,
  SignUpButton,
} from "@clerk/nextjs";
import { useEffect, useState } from "react";

const Navbar = () => {
  const content = (
    <>
      <SignedIn>
        <li>
          <UserButton afterSignOutUrl="/" />
        </li>
      </SignedIn>
      <SignedOut>
        <li>
          <SignInButton />
        </li>
        <li>
          {" "}
          <SignUpButton
            redirectUrl="/"
            unsafeMetadata={{
              active: "none",
              investor: false,
              founder: false,
            }}
          />
        </li>
      </SignedOut>
    </>
  );
  return (
    <nav className="bg-black-500 border-b border-slate-600 p-4">
      <div className="mx-auto flex items-center justify-between">
        <Link href="/" passHref>
          <p className="text-xl font-semibold text-white pl-2">DevLink</p>
        </Link>

        <ul className="flex max-w-5xl grow items-center justify-end space-x-6">
          {content}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
