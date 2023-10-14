"use client";

import { useUser } from "@clerk/nextjs";
import { NextPage } from "next";
import Link from "next/link";
import { Octokit } from "octokit";
import React, { useState, useEffect } from "react";

const Home: NextPage = () => {
  const { user, isLoaded } = useUser();
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const [repos, setRepos] = useState<any[]>([]);

  const getData = async () => {
    try {
      const response = await octokit.request("GET /users/{username}/repos", {
        username: user!.username!,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      });
      if (Array.isArray(response.data)) {
        setRepos(response.data);
      } else {
        console.error("Data from GitHub API is not an array.");
      }
    } catch (error) {
      console.error("Error fetching data from GitHub API:", error);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      getData();
    }
  }, [isLoaded]);

  if (!user) return null;

  return (
    <div className="pl-10">
      <p className="pb-4 text-8xl">Your repos</p>
      {repos.map((repo: any) => (
        <div key={repo.name}>
          <p className="pb-4 text-3xl">
            <Link
              className="hover:text-foreground/70"
              href={`/repo/${repo.name}`}
            >
              {repo.name}{" "}
            </Link>
          </p>
        </div>
      ))}
    </div>
  );
};

export default Home;
