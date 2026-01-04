export function loadKakao(jsKey) {
  // Promise: SDK 로드가 “나중에 끝나는 작업”이라서 await로 기다리게 만들려고 사용
  return new Promise((resolve, reject) => {
    // 이미 로드되어 있으면 중복으로 script를 추가하지 않고 그대로 재사용
    if (window.kakao?.maps) {
      resolve(window.kakao);
      return;
    }

    // 키가 비어있으면 어차피 실패하므로, 원인을 빨리 알 수 있게 에러를 만든다
    if (!jsKey) {
      reject(new Error("VITE_KAKAO_JS_KEY is missing"));
      return;
    }

    // script 태그 생성: 카카오 SDK를 브라우저에 다운로드시키기 위해 필요
    const script = document.createElement("script");

    // async: 로딩이 화면을 멈추게 하지 않도록 비동기 로드
    script.async = true;

    // https로 고정: 프로토콜 자동 선택(//)에서 생길 수 있는 문제를 제거하기 위함
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&autoload=false`;

    // 로드 성공 시: kakao.maps.load로 내부 초기화가 끝난 뒤 resolve
    script.onload = () => {
      window.kakao.maps.load(() => resolve(window.kakao));
    };

    // 로드 실패 시: reject. 지금 네 콘솔의 script error가 여기로 들어온다.
    script.onerror = () => reject(new Error("Kakao Maps SDK script load error"));

    // head에 붙이는 순간 실제 다운로드가 시작된다
    document.head.appendChild(script);
  });
}
