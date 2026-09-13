# medial-demo

`medial-demo.siwon.it.kr` — MEDial 음성 상담 데모 페이지.

- 빌드 단계가 없다. `dist/`의 파일이 그대로 사이트다(`index.html` + `app.jsx` + `assets/`).
  브라우저에서 Babel이 JSX를 그 자리에서 변환한다.
- 배포는 `master`에 push하면 Cloudflare가 `npx wrangler deploy`로 올린다.
  급하면 `npx wrangler deploy`를 직접 돌린다.
- 도메인은 `wrangler.jsonc`의 `routes`에 선언돼 있다.

## 내력

원래 Netlify에 손으로 올리던 사이트라 저장소가 없었다. 2026-09-13 Cloudflare 이사 때
라이브에서 파일을 받아 옮겼고, 다른 17개와 같은 꼴로 맞추려고 이 저장소를 만들었다.
