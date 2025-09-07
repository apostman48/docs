// File: snippets/ClickDemo.jsx
import { useState } from "react";

export const ClickDemo = () => {
  const [text, setText] = useState("Original text here");

  return (
    <div>
      <button onClick={() => setText("Button was clicked!")}>
        Click Me
      </button>
      <p>{text}</p>
    </div>
  );
};
