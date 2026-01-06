import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
const router = express.Router(); 

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

app.get("/api/transit/route", async (req, res) => {
  try {
    // 쿼리 스트링에서 좌표를 꺼낸다. 프론트가 /route?SX=127.0&SY=37.5... 이렇게 보내면 여기로 들어온다.
    const {SX, SY, EX, EY, OPT} = req.query;

    // 5) 필수값 검증: ODsay 문서에서 SX,SY,EX,EY는 필수(Y)다. :contentReference[oaicite:8]{index=8}
    //    없으면 ODsay까지 가지 말고 우리 서버가 즉시 400으로 끊는다(디버깅이 쉬워짐).
    if (!SX || !SY || !EX || !EY){
      return res.status(400).json({
        ok: false,
        message: "SX, SY, EX, EY are required",
      });
    }

    // 서버 환경변수에서 ODsay 키를 가져온다.
    const apiKey = process.env.ODSAY_API_KEY;
    console.log("ODSAY key length:", apiKey?.length);
    console.log("ODSAY key tail:", apiKey?.slice(-4));
    if (!apiKey) {
      return res.status(500).json({
        ok: false,
        message: "ODSAY_API_KEY is missing in server env",
      });
    }

    // ODsay에 보낼 파라미터 만들기
    const params = {
      apiKey, // 문서 공통 필수,
      SX, SY, EX, EY,      // 문서 필수
      OPT: OPT ?? 0,       // 없으면 0
      lang: 0,             // 0=국문 :contentReference[oaicite:10]{index=10}
      output: "json",
    };

    // ODsay 호출
    const odsayRes = await axios.get(
       "https://api.odsay.com/v1/api/searchPubTransPathT",
      { params }
    );
    // 프론트에 전달
    return res.json({
      ok: true,
      data: odsayRes.data,
    });
  } catch(err){
    // 에러처리
    const status = err.response?.status ?? 500;
    const detail = err.response?.data ?? {message: err.message};

    return res.status(status).json({
      ok: false,
      message: "ODsay request failed",
      detail,
    });
  }
});


const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
