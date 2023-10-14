"use client";

import { useUser } from "@clerk/nextjs";
import { NextPage } from "next";
import { Octokit } from "octokit";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { File } from "@/types/types";

const CommitPage: NextPage<{ params: { name: string; id: string } }> = ({
  params,
}) => {
  const { user, isLoaded } = useUser();
  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
  });

  const { name, id } = params;

  const [files, setFiles] = useState<File[]>([]);

  const getData = async () => {
    try {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/commits/{ref}",
        {
          owner: user!.username!,
          repo: name,
          ref: id,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );
      const fileArray = [];
      for (const file of response.data.files!) {
        const fileResponse = await octokit.request(`GET ${file.contents_url}`, {
          owner: user!.username!,
          repo: name!,
          path: file.filename,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        });

        const content = fileResponse.data.content;
        const decodedContent = Buffer.from(content, "base64").toString("utf-8");

        const fileObject = {
          filename: file.filename,
          patch: file.patch!,
          content: decodedContent,
        };
        fileArray.push(fileObject);
      }
      setFiles(fileArray);
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
    <div className="pl-10 pt-10">
      <button className="p-2 bg-primary rounded">
        <Link className="text-3xl" href={`/repo/${name}/commit/${id}/generate`}>
          Create Article{" "}
        </Link>
      </button>
      {files.map((file: File) => (
        <div key={file.filename}>
          <p className="pb-4 text-3xl">{file.filename}</p>
          <p className="text-xl">Patch</p>
          <p>{file.patch}</p>
          <p className="text-xl">Content</p>
          <p>{file.content}</p>
        </div>
      ))}
    </div>
  );
};

export default CommitPage;
