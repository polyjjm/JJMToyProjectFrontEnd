import React, { useState } from "react";
import { Box, TextField, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css";

export default function ChatGpt() {
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const typeWriterEffect = (text: string, delay = 30) => {
    let i = 0;
    let temp = "";
    const interval = setInterval(() => {
      temp += text.charAt(i);
      setResponses((prev) => [
        ...prev.slice(0, prev.length - 1),
        temp,
      ]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, delay);
  };

  const handleSend = async (e: any) => {
    if(e.key === "Enter"){
      setInput("");  
    }
    if (e.key === "Enter" && input.trim() !== "") {
      setLoading(true);
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: input },
          ],
        }),
      });

      const data = await res.json();
      const answer = data.choices?.[0]?.message?.content || "No response";
      setResponses((prev) => [...prev, ""]);
      typeWriterEffect(answer);
      
      setLoading(false);
    }
    
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#121212",
        px: { xs: 2, sm: 4, md: 8 },
        py: 4,
      }}
    >
      <Box
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "1000px",
          mx: "auto",
          overflowY: "auto",
          color: "white",
          mb: 4,
          p: 2,
          borderRadius: 2,
          backgroundColor: "#1E1E1E",
          boxShadow: 3,
        }}
      >
        <ReactMarkdown
          children={responses.join("\n\n")}
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        />
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "1000px",
          mx: "auto",
          p: 2,
          backgroundColor: "#1E1E1E",
          borderRadius: 2,
          boxShadow: 3,
        }}
      >
        <Typography variant="h6" color="white" gutterBottom>
          ChatGPT와 대화하기
        </Typography>
        <TextField
          fullWidth
          
          label="질문을 입력해주세요"
          variant="filled"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyUp={handleSend}
          sx={{
            input: { color: "white" },
            label: { color: "white" },
            textarea: { color: "white" },
            backgroundColor: "#2C2C2C",
            borderRadius: 1,
          }}
        />
      </Box>
    </Box>
  );
}