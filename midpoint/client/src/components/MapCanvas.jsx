import { useEffect, useRef } from "react";
import { loadKakao } from "../utils/loadKakao";

export default function MapCanvas() {
  // 지도 DOM(도화지) div를 가리키는 ref
  const containerRef = useRef(null);

  // 지도 객체를 저장하는 ref (리렌더링되어도 유지)
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      // 1) SDK 로드 (여기까지 왔으면 SDK는 200으로 로드됨)
      const kakao = await loadKakao(import.meta.env.VITE_KAKAO_JS_KEY);

      // 2) 현재 container DOM이 실제로 잡혔는지 확인 (null이면 지도 생성 불가)
      console.log("containerRef:", containerRef.current);

      // 3) 이미 지도 만들었으면 중복 생성 방지
      if (mapRef.current) return;

      // 4) 지도 생성 전에 컨테이너 크기 확인 (0이면 안 보임)
      const rect = containerRef.current.getBoundingClientRect();
      console.log("container size:", rect.width, rect.height);

      // 5) 지도 중심 좌표(서울시청)
      const center = new kakao.maps.LatLng(37.5665, 126.9780);

      // 6) 지도 옵션
      const options = { center, level: 5 };

      // 7) 지도 생성
      mapRef.current = new kakao.maps.Map(containerRef.current, options);
      console.log("map created:", mapRef.current);

      // 8) 생성 직후 화면 갱신(레이아웃 계산)
      //    flex/position 등에서 지도 타일이 안 뜨는 경우가 있어 강제로 relayout
      setTimeout(() => {
        mapRef.current.relayout();
        mapRef.current.setCenter(center);
        console.log("relayout done");
      }, 0);
    })();
  }, []);

  // 9) 컨테이너 div에 "확실한 크기"를 준다
  //    height가 0이면 지도가 그려질 공간이 없어서 안 보임
  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "#eee" // 지도 안 뜰 때 컨테이너가 보이는지 확인용(임시)
      }}
    />
  );
}
