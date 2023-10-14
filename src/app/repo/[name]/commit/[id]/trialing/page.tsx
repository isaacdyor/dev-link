"use client";

import { useChat } from "@/lib/useChat";
import { useState } from "react";

export default function MyComponent() {
  const [requestMade, setRequestMade] = useState(false);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    githubData: "can you say hello world three timese",
    api: "/api/chat",
  });

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
}
