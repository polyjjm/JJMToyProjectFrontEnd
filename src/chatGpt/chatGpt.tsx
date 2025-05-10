import React, { useState } from "react";
import { Box, TextField } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github.css"; // 하이라이팅 스타일 적용

export default function ChatGpt() {
  const [input, setInput] = useState("");
  const [responses, setResponses] = useState<string[]>([]); // responses를 배열로 관리
  const [loading, setLoading] = useState(false);

  const typeWriterEffect = (text: string, delay = 100) => {
    let i = 0;
    let temp = "";
    const interval = setInterval(() => {
      temp += text.charAt(i);
      setResponses((prevResponses) => [
        ...prevResponses.slice(0, prevResponses.length - 1), // 마지막 답변을 제거하고
        temp, // 새로운 부분만 추가
      ]);
      i++;
      if (i >= text.length) clearInterval(interval);
    }, delay);
  };

  const handleSend = async (e: any) => {
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
      setResponses((prevResponses) => [...prevResponses, ""]); // 빈 문자열로 응답 시작
      typeWriterEffect(answer, 30); // 💡 애니메이션 효과 시작
      setInput("");
      setLoading(false);
    }
  };

  return (
    <Box style={{ display: "flex", flexWrap: "wrap", backgroundColor: "#212121" }}>
      <Box
        style={{
          marginTop: 20,
          width: 1200,
          margin: "auto",
          maxHeight: "600px",
          minHeight: "600px",
          padding: "1rem",
        }}
        sx={{ overflowY: "auto", overflowX: "hidden", color: "white" }}
      >
        {/* 마크다운 렌더링 */}
        <ReactMarkdown
          children={responses.join("\n\n")} // 응답들을 줄바꿈으로 구분
          remarkPlugins={[remarkGfm]} // GFM (GitHub Flavored Markdown) 지원
          rehypePlugins={[rehypeHighlight]} // 코드 하이라이팅 지원
        />
      </Box>

      <Box style={{ maxWidth: 1100, margin: "auto" }}>
        <h2 style={{ color: "white" }}>ChatGPT와 대화하기</h2>
        <TextField
          label="질문을 입력해주세요"
          variant="filled"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          style={{ width: "1100px", backgroundColor: "#303030" }}
          sx={{
            input: { color: "white" },
            label: { color: "white" },
            borderRadius: "10px",
          }}
          onKeyUp={handleSend}
        />
      </Box>
    </Box>
  );
}