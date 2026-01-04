import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// JSON 바디를 읽게 해주는 설정
app.use(express.json());

// 프론트(브라우저)에서 요청 허용
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN, // 허용할 프론트 주소
    credentials: true // 쿠키 / 인증정보 포함 요청을 허용할지 여부
  })
);

// 서버가 살아있는지 확인하는 테스트용 API
app.get("/health", (req, res) => {
  res.json({ ok: true }); 
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
