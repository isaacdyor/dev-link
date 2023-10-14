"use client";

import { useUser } from "@clerk/nextjs";
import { NextPage } from "next";
import { Octokit } from "octokit";
import React, { useState } from "react";
import { File } from "@/types/types";
import { useChat } from "ai/react";

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const GeneratePage: NextPage<{ params: { name: string; id: string } }> = ({
  params,
}) => {
  const { user, isLoaded } = useUser();

  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [completed, setCompleted] = useState(false);

  const { name: repoName, id: commitId } = params;

  const getData = async (): Promise<File[]> => {
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

      return updatedFiles;
    } catch (error) {
      console.error("Error fetching data from GitHub API:", error);
      throw error; // Throw an error to indicate the failure.
    }
  };

  const generatePrompt = (files: File[]) => {
    const fileStrings = files.map((file) => {
      // Customize the structure of each string as needed
      return `Filename: ${file.filename}\nPatch:\n ${file.patch}\n\nContent:\n ${file.content}\n`;
    });

    // Join the file strings together into one large string
    const combinedString = fileStrings.join("\n\n");

    const prompt =
      "I am providing you with a list of files changed in a github commit. The file name, patch, and content of the file is included. Can you please create a brief blog article outlining the changes made, what they do and the decision process for why these changes were made? The first piece of content of your response should be the title in the format title: {title goes here} \n\n" +
      combinedString;

    return prompt;
  };

  async function getAiReponse(prompt: string) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }
      setResult(data.result);
      return response;
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
  });

  const generateContent = async (e: React.FormEvent<HTMLFormElement>) => {
    const data: File[] = await getData();
    const prompt = generatePrompt(data);

    // const response = await getAiReponse("Say hello world three times");
    handleSubmit(e);
  };

  // useEffect(() => {
  //   if (isLoaded) {
  //     generateContent();
  //   }
  // }, [isLoaded]);

  if (!user) return null;

  return (
    <div className="pl-10 pt-10">
      <input
        placeholder="title"
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
        }}
        required
        className="bg-background border-border border"
      />
      <textarea
        placeholder="content"
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
        }}
        className="bg-background border-border border"
        required
      />
      <input
        value={input}
        onChange={handleInputChange}
        placeholder="Chat with me please"
      />
      {/* <button onClick={(e) => generateContent(e)} className="bg-primary rounded p-2">
        generate content
      </button> */}

      <ul>
        {messages.map((message, index) => (
          <li key={index}>{message.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default GeneratePage;
