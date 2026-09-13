const { useState, useEffect, useRef, useMemo } = React;

/* ---------- icons ---------- */
const Mic = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <rect x="9" y="2.5" width="6" height="11.5" rx="3" fill="currentColor"/>
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"/>
    <line x1="12" y1="17.5" x2="12" y2="21.5" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round"/>
  </svg>
);
const Send = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M4 11.5 20 4l-7.5 16-2.2-6.6L4 11.5Z" fill="currentColor"/></svg>
);
const Check = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4.2 4.3L19 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
);
const Bell = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M12 3a5 5 0 0 0-5 5c0 4-1.6 5.6-2.2 6.4-.3.4 0 1.1.5 1.1h13.4c.5 0 .8-.7.5-1.1C18.6 13.6 17 12 17 8a5 5 0 0 0-5-5Z" fill="currentColor"/><path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
);
const InboxIcon = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M3 13h4l2 3h6l2-3h4M5 5h14l2 8v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5L5 5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>
);
const Play = () => (<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5l12 7-12 7V5z"/></svg>);
const Pause = () => (<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>);
const Restart = () => (<svg viewBox="0 0 24 24" fill="none"><path d="M5 12a7 7 0 1 0 2.1-5M5 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);

/* ---------- build timeline frames ---------- */
function buildFrames(){
  const F=[]; let elder=[], doctor=[], active='elder', elderMode='home', mid=0;
  const base=()=>({elder:[...elder], doctor:[...doctor], active, elderMode, speaking:false, typingE:false, draft:null, scene:'' });

  const logs = [];
  let logTime = new Date(2026, 5, 7, 14, 14, 0);
  const addLog = (tag, text) => {
    logTime.setSeconds(logTime.getSeconds() + Math.floor(Math.random() * 4) + 2);
    const timeStr = logTime.toTimeString().split(' ')[0];
    logs.push({ time: timeStr, tag, text });
  };

  const push = (x, d, orch = {}) => {
    if (orch.newLogs) {
      orch.newLogs.forEach(l => addLog(l.tag, l.text));
    }
    const orchestrator = {
      status: orch.status || 'STANDBY',
      statusLabel: orch.statusLabel || '대기 중',
      activeCycle: orch.activeCycle || null,
      activeModules: orch.activeModules || [],
      ragQuery: orch.ragQuery || null,
      kbStatus: orch.kbStatus || { medcpt: false, pubmed: false, ddxplus: false },
      diseases: orch.diseases || null,
      dashboard: orch.dashboard || null,
      logs: [...logs]
    };
    F.push({
      ...base(),
      ...x,
      duration: d,
      orchestrator,
      idx: F.length
    });
  };

  // SCENE 1 — home
  push({scene:'홈 화면'}, 2600, {
    status: 'STANDBY',
    statusLabel: '대기 중 (Standby)',
    newLogs: [{ tag: 'system', text: 'Waiting for patient consultation request...' }]
  });

  // tap → chat, listening
  elderMode='chat';
  push({speaking:true, scene:'음성 상담 시작'}, 1600, {
    status: 'SPEECH_TO_TEXT',
    statusLabel: '음성 인식 처리 중 (STT)',
    activeCycle: 'evaluate',
    activeModules: ['stt'],
    kbStatus: { medcpt: true, pubmed: false, ddxplus: false },
    newLogs: [
      { tag: 'system', text: 'Session initiated for Patient Kim Sun-ja (73).' },
      { tag: 'stt', text: 'Audio stream incoming... STT module activated.' }
    ]
  });

  // Elder speaks
  elder.push({key:mid++,from:'elder',text:'팔에 뜨거운 게 닿았는데 빨갛게 부어올랐어'});
  push({speaking:true, scene:'음성 상담'}, 2400, {
    status: 'SPEECH_TO_TEXT',
    statusLabel: '음성 인식 처리 중 (STT)',
    activeCycle: 'evaluate',
    activeModules: ['stt'],
    kbStatus: { medcpt: true, pubmed: false, ddxplus: false },
    newLogs: [
      { tag: 'stt', text: 'Parsed speech: "팔에 뜨거운 게 닿았는데 빨갛게 부어올랐어"' },
      { tag: 'cdss', text: 'Clinical entities extracted: [Symptom: Burn, Location: Arm, Sign: Erythema]' }
    ]
  });

  // AI typing
  push({typingE:true, scene:'음성 상담'}, 1200, {
    status: 'ACTIVE_QUESTIONING',
    statusLabel: '능동적 대화 추론 중',
    activeCycle: 'ask',
    activeModules: ['cdss'],
    kbStatus: { medcpt: false, pubmed: false, ddxplus: true },
    newLogs: [
      { tag: 'cdss', text: 'Decision tree triggered: Burn severity assessment requires visual wound data.' },
      { tag: 'translator', text: 'Synthesizing patient-friendly language for image request...' }
    ]
  });

  // AI sends photo request
  elder.push({key:mid++,from:'ai',text:'많이 놀라셨겠어요. 상처 부위 사진 보내주실 수 있을까요?'});
  push({scene:'음성 상담'}, 2500, {
    status: 'ACTIVE_QUESTIONING',
    statusLabel: '대화 출력 및 대기',
    activeCycle: 'ask',
    activeModules: ['stt'],
    newLogs: [
      { tag: 'system', text: 'Awaiting multimodal input (Patient Wound Photo)...' }
    ]
  });

  // Elder speaks
  push({speaking:true, scene:'음성 상담'}, 1100, {
    status: 'SPEECH_TO_TEXT',
    statusLabel: '음성 인식 처리 중 (STT)',
    activeCycle: 'evaluate',
    activeModules: ['stt'],
    kbStatus: { medcpt: true, pubmed: false, ddxplus: false },
    newLogs: [
      { tag: 'stt', text: 'Parsed speech: "물집은 없어. 사진은 이거야"' }
    ]
  });

  // Photo sent
  elder.push({key:mid++,from:'elder',text:'물집은 없어. 사진은 이거야 📷', thumb:'assets/burn_thumb.png'});
  push({speaking:true, scene:'사진 전송'}, 2900, {
    status: 'MULTIMODAL_VISION',
    statusLabel: '멀티모달 이미지 분석 중',
    activeCycle: 'evaluate',
    activeModules: ['vision'],
    ragQuery: 'Query: "arm burn erythema no blister"',
    kbStatus: { medcpt: true, pubmed: true, ddxplus: true },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '88% 신뢰도', level: 'high' },
      { name: '접촉성 피부염 (Dermatitis)', score: '45% 신뢰도', level: 'med' }
    ],
    newLogs: [
      { tag: 'vision', text: 'Image ingestion complete: assets/burn_thumb.png' },
      { tag: 'vision', text: 'VLM Analysis: Erythema detected on forearm. Blister/vesicle absent.' },
      { tag: 'cdss', text: 'Embedding search via MedCPT in PubMed RAG database...' },
      { tag: 'cdss', text: 'Matches: 2nd-degree Burn (88%), Contact Dermatitis (45%).' }
    ]
  });

  // AI typing
  push({typingE:true, scene:'음성 상담'}, 1200, {
    status: 'ACTIVE_QUESTIONING',
    statusLabel: '추가 문진 생성 중',
    activeCycle: 'ask',
    activeModules: ['cdss', 'translator'],
    kbStatus: { medcpt: false, pubmed: true, ddxplus: true },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '88% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'cdss', text: 'Triage rules require assessment of onset duration & distal joint movement.' },
      { tag: 'translator', text: 'Formulating follow-up voice query for temporal and motor evaluation.' }
    ]
  });

  // AI sends question
  elder.push({key:mid++,from:'ai',text:'사진 잘 받았어요. 언제 다치셨어요? 손가락은 어때요?'});
  push({scene:'음성 상담'}, 2500, {
    status: 'ACTIVE_QUESTIONING',
    statusLabel: '대화 출력 및 대기',
    activeCycle: 'ask',
    activeModules: ['stt'],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '88% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'system', text: 'Awaiting patient response regarding onset time and finger mobility...' }
    ]
  });

  // Elder speaks
  push({speaking:true, scene:'음성 상담'}, 1100, {
    status: 'SPEECH_TO_TEXT',
    statusLabel: '음성 인식 처리 중 (STT)',
    activeCycle: 'evaluate',
    activeModules: ['stt'],
    kbStatus: { medcpt: true, pubmed: false, ddxplus: false },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '88% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'stt', text: 'Parsed speech: "한 30분 됐고, 손가락은 괜찮아"' }
    ]
  });

  // Elder answer finish
  elder.push({key:mid++,from:'elder',text:'한 30분 됐고, 손가락은 괜찮아'});
  push({speaking:true, scene:'음성 상담'}, 2300, {
    status: 'CLINICAL_SYNTHESIS',
    statusLabel: '임상 데이터 종합 중',
    activeCycle: 'evaluate',
    activeModules: ['cdss'],
    kbStatus: { medcpt: true, pubmed: false, ddxplus: true },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '92% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'cdss', text: 'Patient parameters: 73F, 30m post heat contact, no blisters, fingers functional.' },
      { tag: 'cdss', text: 'Triage Dashboard generation initiated.' }
    ]
  });

  // SCENE 3 — doctor alert
  active='doctor';
  doctor.push({key:mid++,from:'alert'});
  push({scene:'AI 자동 보고'}, 2100, {
    status: 'REPORT_ROUTING',
    statusLabel: '의료진 연동 및 보고 중',
    activeCycle: 'plan',
    activeModules: ['cdss'],
    kbStatus: { medcpt: false, pubmed: false, ddxplus: true },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '92% 신뢰도', level: 'high' }
    ],
    dashboard: {
      name: '김순자 (여, 73세)',
      age: '73세',
      symptoms: '팔 화상 (30분 전 열 접촉)',
      meds: '혈압약 2종 복용 중',
      triage: '2도 화상 의심'
    },
    newLogs: [
      { tag: 'cdss', text: 'Pre-Visit Triage Dashboard successfully generated.' },
      { tag: 'system', text: 'EHR API called. Dispatched real-time alert to Clinic Director dashboard.' }
    ]
  });

  // Doctor reviews report
  doctor.push({key:mid++,from:'report'});
  push({scene:'보고서 확인'}, 3000, {
    status: 'PHYSICIAN_REVIEW',
    statusLabel: '보건소장 검토 중',
    activeCycle: 'plan',
    activeModules: [],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '92% 신뢰도', level: 'high' }
    ],
    dashboard: {
      name: '김순자 (여, 73세)',
      age: '73세',
      symptoms: '팔 화상 (30분 전 열 접촉)',
      meds: '혈압약 2종 복용 중',
      triage: '2도 화상 의심'
    },
    newLogs: [
      { tag: 'system', text: 'Physician dashboard active. Alert accepted.' },
      { tag: 'system', text: 'Awaiting clinician directives...' }
    ]
  });

  // Doctor typing
  push({draft:'화상 범위가 손바닥보다 큰가요? 확인해줘요', scene:'보건소장 회신'}, 2300, {
    status: 'PHYSICIAN_REVIEW',
    statusLabel: '보건소장 검토 중',
    activeCycle: 'plan',
    activeModules: [],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '92% 신뢰도', level: 'high' }
    ],
    dashboard: {
      name: '김순자 (여, 73세)',
      age: '73세',
      symptoms: '팔 화상 (30분 전 열 접촉)',
      meds: '혈압약 2종 복용 중',
      triage: '2도 화상 의심'
    },
    newLogs: [
      { tag: 'system', text: 'Physician inputs instruction draft...' }
    ]
  });

  // Doctor sends
  doctor.push({key:mid++,from:'doctor',text:'화상 범위가 손바닥보다 큰가요? 확인해줘요'});
  push({scene:'보건소장 회신'}, 2100, {
    status: 'INSTRUCTION_PARSING',
    statusLabel: '의학 지시 파악 중',
    activeCycle: 'evaluate',
    activeModules: ['cdss'],
    kbStatus: { medcpt: false, pubmed: false, ddxplus: true },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '92% 신뢰도', level: 'high' }
    ],
    dashboard: {
      name: '김순자 (여, 73세)',
      age: '73세',
      symptoms: '팔 화상 (30분 전 열 접촉)',
      meds: '혈압약 2종 복용 중',
      triage: '2도 화상 의심'
    },
    newLogs: [
      { tag: 'cdss', text: 'Physician directive: "화상 범위가 손바닥보다 큰가요? 확인해줘요"' },
      { tag: 'cdss', text: 'Parsing query intent: Quantitative assessment of Burn Surface Area (BSA).' }
    ]
  });

  // SCENE 4 — elder questions
  active='elder';
  push({typingE:true, scene:'질문 전달'}, 1300, {
    status: 'LAYMAN_TRANSLATION',
    statusLabel: '어르신 용어 번역 중',
    activeCycle: 'ask',
    activeModules: ['translator'],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '92% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'translator', text: 'Translating clinical metric "BSA palm comparison" into layman vernacular.' },
      { tag: 'translator', text: 'Generated phrasing: "빨간 부위가 손바닥보다 큰가요, 작은가요?"' }
    ]
  });

  // AI sends question
  elder.push({key:mid++,from:'ai',text:'빨간 부위가 손바닥보다 큰가요, 작은가요?'});
  push({scene:'질문 전달'}, 2500, {
    status: 'ACTIVE_QUESTIONING',
    statusLabel: '대화 출력 및 대기',
    activeCycle: 'ask',
    activeModules: ['stt'],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '92% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'system', text: 'Awaiting patient input regarding burn surface size...' }
    ]
  });

  // Elder speaks
  push({speaking:true, scene:'음성 상담'}, 1100, {
    status: 'SPEECH_TO_TEXT',
    statusLabel: '음성 인식 처리 중 (STT)',
    activeCycle: 'evaluate',
    activeModules: ['stt'],
    kbStatus: { medcpt: true, pubmed: false, ddxplus: false },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '92% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'stt', text: 'Parsed speech: "손바닥보다는 작은 것 같아"' }
    ]
  });

  // Elder finishes answer
  elder.push({key:mid++,from:'elder',text:'손바닥보다는 작은 것 같아'});
  push({speaking:true, scene:'음성 상담'}, 2300, {
    status: 'ANSWER_QUANTIFYING',
    statusLabel: '답변 임상 데이터화 중',
    activeCycle: 'evaluate',
    activeModules: ['cdss'],
    kbStatus: { medcpt: true, pubmed: false, ddxplus: true },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'cdss', text: 'Answer quantified: BSA < palm area (localized minor burn).' },
      { tag: 'cdss', text: 'Calibration complete. Calibrating diagnosis confidence to 95%.' }
    ]
  });

  // SCENE 5 — doctor system update
  active='doctor';
  doctor.push({key:mid++,from:'system',text:'환자 답변 · 빨간 부위가 손바닥보다 작음'});
  push({scene:'환자 답변 수신'}, 2200, {
    status: 'REPORT_ROUTING',
    statusLabel: '진료 대시보드 업데이트 중',
    activeCycle: 'plan',
    activeModules: ['cdss'],
    kbStatus: { medcpt: false, pubmed: false, ddxplus: true },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    dashboard: {
      name: '김순자 (여, 73세)',
      age: '73세',
      symptoms: '팔 화상 (손바닥 미만 확인)',
      meds: '혈압약 2종 복용 중',
      triage: '2도 화상 (경증)'
    },
    newLogs: [
      { tag: 'system', text: 'Updating physician dashboard: BSA size updated to < palm.' },
      { tag: 'system', text: 'Awaiting clinician\'s final care directive...' }
    ]
  });

  // Doctor typing
  push({draft:'48시간 내에 내원 필요하다고 전달해줘요', scene:'진료 지시'}, 2300, {
    status: 'PHYSICIAN_REVIEW',
    statusLabel: '보건소장 검토 중',
    activeCycle: 'plan',
    activeModules: [],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    dashboard: {
      name: '김순자 (여, 73세)',
      age: '73세',
      symptoms: '팔 화상 (손바닥 미만 확인)',
      meds: '혈압약 2종 복용 중',
      triage: '2도 화상 (경증)'
    },
    newLogs: [
      { tag: 'system', text: 'Physician inputs final care directive...' }
    ]
  });

  // Doctor sends
  doctor.push({key:mid++,from:'doctor',text:'48시간 내에 내원 필요하다고 전달해줘요'});
  push({scene:'진료 지시'}, 2200, {
    status: 'DIRECTIVE_PARSING',
    statusLabel: '최종 처방 해석 중',
    activeCycle: 'evaluate',
    activeModules: ['cdss'],
    kbStatus: { medcpt: false, pubmed: false, ddxplus: true },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    dashboard: {
      name: '김순자 (여, 73세)',
      age: '73세',
      symptoms: '팔 화상 (손바닥 미만 확인)',
      meds: '혈압약 2종 복용 중',
      triage: '2도 화상 (경증)'
    },
    newLogs: [
      { tag: 'cdss', text: 'Physician directive: "48시간 내에 내원 필요하다고 전달해줘요"' },
      { tag: 'cdss', text: 'Parsing intent: Clinic visit route. Max threshold: 48 hours.' }
    ]
  });

  // SCENE 6 — elder final
  active='elder';
  push({typingE:true, scene:'안내 전달'}, 1300, {
    status: 'LAYMAN_TRANSLATION',
    statusLabel: '처방 번역 및 안내 생성 중',
    activeCycle: 'ask',
    activeModules: ['translator'],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'translator', text: 'Translating doctor\'s prescription "Visit within 48 hours".' },
      { tag: 'translator', text: 'Generated translation: "의사 선생님이 이틀 안에 오시라고 하세요."' }
    ]
  });

  // AI sends booking proposal
  elder.push({key:mid++,from:'ai',text:'의사 선생님이 이틀 안에 오시라고 하세요. 내일 오전 10시 괜찮으세요?'});
  push({scene:'예약 안내'}, 2700, {
    status: 'BOOKING_AGENCY',
    statusLabel: '보건소 예약 연동 중',
    activeCycle: 'plan',
    activeModules: ['booking'],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'booking', text: 'Querying local clinic schedule calendar API...' },
      { tag: 'booking', text: 'Found open slot: Tomorrow 10:00 AM. Formulating booking proposal.' }
    ]
  });

  // Elder speaks
  push({speaking:true, scene:'음성 상담'}, 1100, {
    status: 'SPEECH_TO_TEXT',
    statusLabel: '음성 인식 처리 중 (STT)',
    activeCycle: 'evaluate',
    activeModules: ['stt'],
    kbStatus: { medcpt: true, pubmed: false, ddxplus: false },
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'stt', text: 'Parsed speech: "어, 괜찮아"' }
    ]
  });

  // Elder accept booking
  elder.push({key:mid++,from:'elder',text:'어, 괜찮아', nowrap:true});
  push({speaking:true, scene:'예약 확정'}, 1900, {
    status: 'TRANSACTION_COMPLETE',
    statusLabel: '예약 트랜잭션 진행 중',
    activeCycle: 'check',
    activeModules: ['booking'],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'booking', text: 'Patient slot confirmation received: [Yes].' },
      { tag: 'booking', text: 'Committing transaction: Register appointment for Patient Kim Sun-ja.' }
    ]
  });

  // AI typing booking card
  push({typingE:true, scene:'예약 확정'}, 1100, {
    status: 'TRANSACTION_COMPLETE',
    statusLabel: '예약 확정 정보 생성 중',
    activeCycle: 'check',
    activeModules: ['booking'],
    diseases: [
      { name: '2도 열화상 (2nd-degree Burn)', score: '95% 신뢰도', level: 'high' }
    ],
    newLogs: [
      { tag: 'booking', text: 'EHR database commit completed. Transaction ID: TX-604812.' },
      { tag: 'translator', text: 'Generating booking visual card object...' }
    ]
  });

  // Show booking card
  elder.push({key:mid++,from:'booking'});
  push({scene:'예약 완료 ✓'}, 4200, {
    status: 'TRANSACTION_COMPLETE',
    statusLabel: '예약 완료 (Finished)',
    activeCycle: 'check',
    activeModules: ['booking'],
    newLogs: [
      { tag: 'system', text: 'Booking card sent. Patient notified.' },
      { tag: 'system', text: 'Active session closed. Returning to standby.' }
    ]
  });

  return F;
}
const FRAMES = buildFrames();
const TOTAL = FRAMES.reduce((s,f)=>s+f.duration,0);

/* ---------- status bar ---------- */
function StatusBar({time}){
  return (
    <div className="statusbar">
      <span>{time}</span>
      <span className="sig">
        <span className="bars">
          <i style={{height:'5px'}}/><i style={{height:'8px'}}/><i style={{height:'11px'}}/><i style={{height:'13px'}}/>
        </span>
        <span className="batt"/>
      </span>
    </div>
  );
}

/* ---------- elder chat bubbles ---------- */
function ElderMsg({m}){
  if(m.from==='booking'){
    return (
      <div className="row left" style={{justifyContent:'center'}}>
        <div className="booking" style={{maxWidth:'94%'}}>
          <div className="top">
            <span className="ck"><Check/></span>
            <span className="bt">내일 오전 10시<br/>보건소 예약 완료되었습니다</span>
          </div>
          <div className="when">
            <span className="dl">예약 일시</span>
            <span className="dv">6월 5일 (목) 오전 10:00</span>
          </div>
        </div>
      </div>
    );
  }
  const ai = m.from==='ai';
  return (
    <div className={"row "+(ai?'left':'right')}>
      <div className="bcol" style={{alignItems: ai?'flex-start':'flex-end'}}>
        <div className={"bubble "+(ai?'ai':'elder')} style={m.nowrap?{whiteSpace:'nowrap'}:undefined}>
          {m.text}
          {m.thumb && <img className="thumb" src={m.thumb} alt="상처 사진"/>}
        </div>
        <span className="meta">{ai?'메디 AI':'어르신'}</span>
      </div>
    </div>
  );
}

/* ---------- doctor items ---------- */
function DoctorItem({m}){
  if(m.from==='alert') return (
    <div className="row left" style={{display:'block'}}>
      <div className="alert">
        <span className="ico"><Bell/></span>
        <div>
          <div className="t">AI 자동 보고</div>
          <div className="s">메디 AI가 환자 상태를 분석했습니다</div>
        </div>
        <span className="badge">방금</span>
      </div>
    </div>
  );
  if(m.from==='report') return (
    <div className="row left" style={{display:'block'}}>
      <div className="report">
        <div className="head">
          <img className="pic" src="assets/burn_thumb.png" alt="상처"/>
          <div>
            <div className="pt">60세 여성</div>
            <div className="pp">팔 화상 · 음성 상담</div>
          </div>
        </div>
        <ul>
          <li><span className="d"/>30분 전 열 접촉</li>
          <li className="warn"><span className="d"/>2도 화상 의심</li>
          <li><span className="d"/>사진 첨부됨 · 손가락 정상</li>
        </ul>
        <div className="ai">⬤ 메디 AI 분석 요약</div>
      </div>
    </div>
  );
  if(m.from==='system') return (
    <div className="row" style={{justifyContent:'center'}}>
      <div className="syschip">{m.text}</div>
    </div>
  );
  // doctor reply
  return (
    <div className="row right">
      <div className="bcol" style={{alignItems:'flex-end'}}>
        <div className="bubble doctor">{m.text}</div>
        <span className="meta">보건소장</span>
      </div>
    </div>
  );
}

/* ---------- AI Orchestrator Panel ---------- */
function AIOrchestrator({ f }){
  const orch = f.orchestrator || {};
  const termRef = useRef(null);
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [orch.logs]);

  // Determine panel pulsing neon border style class
  let panelPulseClass = '';
  if (orch.activeCycle === 'evaluate') panelPulseClass = 'pulse-teal';
  else if (orch.activeCycle === 'ask') panelPulseClass = 'pulse-amber';
  else if (orch.activeCycle === 'plan' || orch.activeCycle === 'check') {
    if (orch.status === 'TRANSACTION_COMPLETE') panelPulseClass = 'pulse-teal';
    else panelPulseClass = 'pulse-blue';
  }

  // Determine cycle node classes
  const isCycleActive = (cycleName) => orch.activeCycle === cycleName;
  const cycleColorClass = (cycleName) => {
    if (cycleName === 'evaluate') return 'teal';
    if (cycleName === 'ask') return 'amber';
    return 'blue'; // plan / check
  };

  // Determine core state color
  let coreColor = 'standby';
  if (orch.status !== 'STANDBY') {
    if (orch.activeCycle === 'ask') coreColor = 'amber';
    else if (orch.activeCycle === 'plan' || orch.activeCycle === 'check') {
      if (orch.status === 'TRANSACTION_COMPLETE') coreColor = 'teal';
      else coreColor = 'blue';
    }
    else coreColor = 'teal';
  }

  // Calculate cycle line progress width (percentage)
  let progressWidth = '0%';
  if (orch.activeCycle === 'evaluate') progressWidth = '33.33%';
  else if (orch.activeCycle === 'ask') progressWidth = '0%';
  else if (orch.activeCycle === 'plan') progressWidth = '66.66%';
  else if (orch.activeCycle === 'check') progressWidth = '100%';

  return (
    <div className="col orchestrator">
      <div className="role">
        <span className="chip"><span className="dot" style={{background: '#002C72'}}/><span className="name">AI Orchestrator</span></span>
        <span className="sub">MEDial Core Platform</span>
      </div>
      <div className="orchestrator-panel">
        
        {/* Module 1: System State & Conversation Cycle */}
        <div className={"orch-module orch-module-status " + panelPulseClass}>
          
          <div className="orch-header" style={{ borderBottom: 'none', paddingBottom: '0' }}>
            <div className="orch-status-badge">
              <span className={"orch-status-dot " + coreColor} />
              <span>{orch.status === 'STANDBY' ? 'SYSTEM STANDBY' : 'ORCHESTRATING'}</span>
            </div>
            <div className="orch-status-text">{orch.statusLabel || '대기 중'}</div>
          </div>

          <div className="orch-cycle" style={{ marginTop: '12px' }}>
            <div className="orch-cycle-line-container">
              <div className="orch-cycle-line" />
              <div className="orch-cycle-line-progress" style={{ width: progressWidth }} />
            </div>
            
            <div className={"orch-cycle-node " + (isCycleActive('ask') ? 'active ' + cycleColorClass('ask') : '')}>
              <div className="orch-cycle-dot">Ask</div>
              <div className="orch-cycle-label">질문 생성</div>
            </div>
            <div className={"orch-cycle-node " + (isCycleActive('evaluate') ? 'active ' + cycleColorClass('evaluate') : '')}>
              <div className="orch-cycle-dot">Eval</div>
              <div className="orch-cycle-label">증상 평가</div>
            </div>
            <div className={"orch-cycle-node " + (isCycleActive('plan') ? 'active ' + cycleColorClass('plan') : '')}>
              <div className="orch-cycle-dot">Plan</div>
              <div className="orch-cycle-label">경로 계획</div>
            </div>
            <div className={"orch-cycle-node " + (isCycleActive('check') ? 'active ' + cycleColorClass('check') : '')}>
              <div className="orch-cycle-dot">Check</div>
              <div className="orch-cycle-label">의사 확인</div>
            </div>
          </div>
        </div>

        {/* Module 2: Knowledge Base & Clinical CDSS */}
        <div className={"orch-module orch-module-cdss " + panelPulseClass} style={{ flex: '1 1 auto', minHeight: 0 }}>
          
          <div className="orch-cdss">
            <div className="orch-kb-box" style={{ flex: '1 1 auto', minHeight: 0 }}>
              <div className="orch-kb-header">
                <span>Knowledge Base & Tools</span>
                <div className="orch-kb-chips">
                  <span className={"orch-kb-chip " + (orch.kbStatus?.medcpt ? 'active' : '')}>MedCPT</span>
                  <span className={"orch-kb-chip " + (orch.kbStatus?.pubmed ? 'active blue' : '')}>PubMed RAG</span>
                  <span className={"orch-kb-chip " + (orch.kbStatus?.ddxplus ? 'active amber' : '')}>DDXPlus</span>
                </div>
              </div>
              
              {orch.ragQuery && (
                <div className="orch-rag-query" title={orch.ragQuery}>
                  {orch.ragQuery}
                </div>
              )}

              {/* Suspected Diseases or Dashboard Summary */}
              {orch.dashboard ? (
                <div className="orch-dashboard-summary" style={{ overflowY: 'auto', flex: '1 1 auto' }}>
                  <div className="orch-dashboard-title">Pre-Visit Triage Dashboard</div>
                  <div className="orch-dashboard-grid" style={{ marginTop: '8px' }}>
                    <div className="orch-dashboard-cell">
                      <span>환자명</span>
                      <b>{orch.dashboard.name}</b>
                    </div>
                    <div className="orch-dashboard-cell">
                      <span>추정 트리아지</span>
                      <b style={{color:'#46D6A6'}}>{orch.dashboard.triage}</b>
                    </div>
                    <div className="orch-dashboard-cell" style={{gridColumn: 'span 2'}}>
                      <span>주요 증상</span>
                      <b>{orch.dashboard.symptoms}</b>
                    </div>
                    <div className="orch-dashboard-cell" style={{gridColumn: 'span 2'}}>
                      <span>복용 약물</span>
                      <b>{orch.dashboard.meds}</b>
                    </div>
                  </div>
                </div>
              ) : orch.diseases ? (
                <div className="orch-disease-list" style={{ overflowY: 'auto', flex: '1 1 auto' }}>
                  {orch.diseases.map((d, index) => (
                    <div key={index} className={"orch-disease-item " + d.level}>
                      <span className="orch-disease-name">{d.name}</span>
                      <span className={"orch-disease-score " + (d.level==='med'?'med':'')}>{d.score}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4A5868', fontSize: '12px', fontStyle: 'italic'}}>
                  지식 데이터 조회 대기 중...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Module 3: Reasoning Activity Log */}
        <div className={"orch-module orch-module-terminal " + panelPulseClass} style={{ height: '260px' }}>
          
          <div className="orch-terminal" ref={termRef}>
            {orch.logs?.map((l, index) => (
              <div key={index} className="orch-log-line">
                <span className="orch-log-time">[{l.time}]</span>
                <span className={"orch-log-tag tag-" + l.tag}>{l.tag.toUpperCase()}</span>
                <span className="orch-log-text">{l.text}</span>
              </div>
            ))}
            {orch.logs?.length === 0 && (
              <div style={{color: '#4A5868', fontStyle: 'italic'}}>Terminal initialized...</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ---------- elder phone ---------- */
function ElderPhone({f, live}){
  const sc = useRef(null);
  useEffect(()=>{ if(sc.current) sc.current.scrollTop = sc.current.scrollHeight; });
  const home = f.elderMode==='home';
  return (
    <div className={"col elder "+(live?'live':'idle')}>
      <div className="role">
        <span className="chip"><span className="dot"/><span className="name">어르신</span></span>
        <span className="sub">환자 - 김순자 73세</span>
      </div>
      <div className="phone">
        <div className={"screen "+(home?'dark':'')}>
          <div className="island"/>
          <StatusBar time="오후 2:14"/>
          {home ? (
            <div className="home">
              <div className="hello">안녕하세요</div>
              <div className="hname">김순자 어르신</div>
              <div className="prompt">어디가 불편하신가요?<br/>버튼을 누르고 말씀해 주세요</div>
              <div className="big">
                <div className="bigbtn">
                  <span className="ring"/><span className="ring"/>
                  <Mic/>
                </div>
                <div className="biglabel">메디에게 말하기</div>
              </div>
            </div>
          ) : (
            <div className="chat">
              <div className="chathead">
                <span className="av ai">메</span>
                <div>
                  <div className="who">메디</div>
                  <div className="where">AI 건강 도우미</div>
                </div>
                {live && <div className="live"><i/>듣는 중</div>}
              </div>
              <div className="scroll" ref={sc}>
                {f.elder.map(m=> <ElderMsg key={m.key} m={m}/>)}
                {f.typingE && <div className="row left"><div className="typing"><i/><i/><i/></div></div>}
                <div style={{height:'96px',flex:'0 0 auto'}}/>
              </div>
              <div className="micwrap">
                {f.speaking && (
                  <div className="listening">
                    <span className="wave"><i/><i/><i/><i/><i/></span>
                    말씀하세요
                  </div>
                )}
                <div className={"mic "+(f.speaking?'on':'off')}>
                  {f.speaking && <><span className="pr"/><span className="pr"/></>}
                  <Mic/>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- doctor phone ---------- */
function DoctorPhone({f, live}){
  const sc = useRef(null);
  useEffect(()=>{ if(sc.current) sc.current.scrollTop = sc.current.scrollHeight; });
  const idle = f.doctor.length===0;
  return (
    <div className={"col doctor "+(live?'live':'idle')}>
      <div className="role">
        <span className="chip"><span className="dot"/><span className="name">보건소장</span></span>
        <span className="sub">의사 - OO면 보건소</span>
      </div>
      <div className="phone">
        <div className={"screen "+(idle?'dark':'')}>
          <div className="island"/>
          <StatusBar time="오후 2:15"/>
          {idle ? (
            <div className="docidle">
              <div className="dh">OO면 보건소 · 원격 모니터링</div>
              <div className="dt">실시간 환자 현황</div>
              <div className="grid">
                <div className="stat"><div className="n">12</div><div className="l">오늘 상담</div></div>
                <div className="stat"><div className="n tl">0</div><div className="l">대기 보고</div></div>
              </div>
              <div className="empty">
                <div className="ic"><InboxIcon/></div>
                <p>새로운 AI 보고를<br/>기다리는 중입니다</p>
              </div>
            </div>
          ) : (
            <div className="chat">
              <div className="chathead">
                <span className="av dr"><Bell/></span>
                <div>
                  <div className="who">AI 보고 · 김순자</div>
                  <div className="where">메디 AI 연동</div>
                </div>
                {live && <div className="live" style={{color:'#1FA8DC'}}><i style={{background:'#1FA8DC'}}/>검토 중</div>}
              </div>
              <div className="scroll" ref={sc}>
                {f.doctor.map(m=> <DoctorItem key={m.key} m={m}/>)}
                <div style={{height:'10px',flex:'0 0 auto'}}/>
              </div>
              <div className="docinput">
                <div className="field">
                  {f.draft ? <span>{f.draft}<span className="caret"/></span> : <span className="ph">환자에게 전달할 지시 입력…</span>}
                </div>
                <div className={"send "+(f.draft?'hot':'')}><Send/></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- app ---------- */
function App(){
  const hash = new URLSearchParams((location.hash||'').replace('#',''));
  const hf = hash.has('f') ? parseInt(hash.get('f')) : null;
  const [i, setI] = useState(()=>{
    if(hf!=null && hf>=0 && hf<FRAMES.length) return hf;
    const v=parseInt(localStorage.getItem('medial_frame')); return (v>=0 && v<FRAMES.length)?v:0;
  });
  const [playing, setPlaying] = useState(hf==null);
  const [scale, setScale] = useState(1);

  useEffect(()=>{
    const fit=()=> setScale(Math.min(window.innerWidth/1920, (window.innerHeight-72)/1080));
    fit(); window.addEventListener('resize', fit); return ()=>window.removeEventListener('resize', fit);
  },[]);
  useEffect(()=>{ localStorage.setItem('medial_frame', i); },[i]);
  useEffect(()=>{ window.__setFrame=(n)=>{ setPlaying(false); setI(n); }; window.__play=()=>setPlaying(true); },[]);
  useEffect(()=>{
    if(!playing) return;
    if(i>=FRAMES.length-1){ const t=setTimeout(()=>setI(0), 3800); return ()=>clearTimeout(t); }
    const t=setTimeout(()=>setI(v=>v+1), FRAMES[i].duration);
    return ()=>clearTimeout(t);
  },[i, playing]);

  const f = FRAMES[i];
  const elapsed = useMemo(()=> FRAMES.slice(0,i).reduce((s,x)=>s+x.duration,0), [i]);
  const pct = Math.min(100, (elapsed / TOTAL) * 100 + (f.duration/TOTAL)*0 );

  const seek=(e)=>{
    const r=e.currentTarget.getBoundingClientRect();
    const ratio=(e.clientX-r.left)/r.width; let acc=0;
    for(let k=0;k<FRAMES.length;k++){ acc+=FRAMES[k].duration; if(acc/TOTAL>=ratio){ setI(k); return; } }
    setI(FRAMES.length-1);
  };

  return (
    <div className="viewport">
      <div className="stagearea">
      <div className="sizer" style={{width:1920*scale, height:1080*scale}}>
      <div className="stage" style={{transform:`scale(${scale})`}}>
        <div className="topbar">
          <div className="brand">
            <img src="assets/logo.png" alt="MEDial"/>
            <span className="wm"><b>MED</b>ial</span>
          </div>
          <div className="controls">
            <button className="ctlbtn" onClick={()=>{ setI(0); setPlaying(true); }} title="처음부터"><Restart/></button>
            <button className="ctlbtn play" onClick={()=>setPlaying(p=>!p)} title="재생/일시정지">{playing?<Pause/>:<Play/>}</button>
            <div className="track" onClick={seek}><div className="fill" style={{width:pct+'%'}}/></div>
            <div className="scene"><b>{f.scene}</b></div>
          </div>
        </div>
        
        <div className="phones">
          <ElderPhone f={f} live={f.active==='elder'}/>
          <AIOrchestrator f={f}/>
          <DoctorPhone f={f} live={f.active==='doctor'}/>
        </div>
      </div>
      </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
