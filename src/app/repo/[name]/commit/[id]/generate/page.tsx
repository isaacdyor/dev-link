"use client";

import { useUser } from "@clerk/nextjs";
import { NextPage } from "next";
import { Octokit } from "octokit";
import React, { useEffect, useState } from "react";
import { useChat } from "@/lib/useChat";
import { File } from "@/types/types";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const GeneratePage: NextPage<{ params: { name: string; id: string } }> = ({
  params,
}) => {
  const { user, isLoaded } = useUser();

  const [requestMade, setRequestMade] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const { name: repoName, id: commitId } = params;

  const getData = async () => {
    try {
      const response = await octokit.request(
        "GET /repos/{owner}/{repo}/commits/{ref}",
        {
          owner: user!.username!,
          repo: repoName,
          ref: commitId,
          headers: {
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      const updatedFiles = [];

      for (const file of response.data.files!) {
        const fileResponse = await octokit.request(`GET ${file.contents_url}`, {
          owner: user!.username!,
          repo: repoName!,
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

        updatedFiles.push(fileObject);
      }
      setFiles(updatedFiles);
    } catch (error) {
      console.error("Error fetching data from GitHub API:", error);
      throw error; // Throw an error to indicate the failure.
    }
  };

  const getGithubDataString = (fileString: File[]): string => {
    const fileStrings = files.map((file) => {
      // Customize the structure of each string as needed
      return `Filename: ${file.filename}\nPatch:\n ${file.patch}\n\nContent:\n ${file.content}\n`;
    });

    // Join the file strings together into one large string
    const combinedString = fileStrings.join("\n\n");

    return combinedString;
  };

  useEffect(() => {
    if (isLoaded) {
      getData();
    }
  }, [isLoaded]);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    githubData: getGithubDataString(files),
    api: "/api/chat",
  });

  if (!user) return null;

  return (
    <div>
      {!requestMade && (
        <form
          onSubmit={(e) => {
            setRequestMade(true);
            handleSubmit(e);
          }}
        >
          <label>
            Any other information you would like to add.
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="extra information"
              className="bg-secondary"
            />
          </label>
          <button type="submit">Send</button>
        </form>
      )}
      <p>{messages[1]?.content}</p>
    </div>
  );
};

export default GeneratePage;
