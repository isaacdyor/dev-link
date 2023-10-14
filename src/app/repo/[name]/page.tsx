"use client";

import { useUser } from "@clerk/nextjs";
import { NextPage } from "next";
import Link from "next/link";
import { Octokit } from "octokit";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const RepoPage: NextPage<{ params: { name: string } }> = ({ params }) => {
  const { user, isLoaded } = useUser();
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const repoName = params.name;

  const [commits, setCommits] = useState<any[]>([]);

  const getData = async () => {
    try {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/commits",
        {
          owner: user!.username!,
          repo: repoName!,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      if (Array.isArray(response.data)) {
        setCommits(response.data);
      } else {
        console.error("Data from GitHub API is not an array.");
      }
      console.log(response.data);
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
      <p className="pb-4 text-8xl">Commits for {repoName}</p>
      {commits.map((commit: any) => (
        <div className="pb-4 text-3xl" key={commit.sha}>
          <Link
            className="hover:text-foreground/70"
            href={`/repo/${repoName}/commit/${commit.sha}`}
          >
            {commit.commit.message}{" "}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default RepoPage;
