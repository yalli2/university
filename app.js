// UniPrep 2027 — 스스로 준비하는 대입 · app
const store={get(k,d){try{const v=localStorage.getItem('up_'+k);return v?JSON.parse(v):d}catch(e){return d}},set(k,v){try{localStorage.setItem('up_'+k,JSON.stringify(v))}catch(e){}}};
const B=window.BASE||{},GD=window.GUIDES||[],UV=window.UNIV||[];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const $=s=>document.querySelector(s);
const META={
 gyogwa:{s:'교과',grp:'수시',ic:'A+',short:'학생부교과',sub:'내신 등급 중심 · 학교장추천'},
 jonghap:{s:'종합',grp:'수시',ic:'📘',short:'학생부종합',sub:'학생부 전체 · 서류와 면접'},
 nonsul:{s:'논술',grp:'수시',ic:'✎',short:'논술',sub:'대학별 논술고사 · 수능최저'},
 'susi-common':{s:'수시',grp:'수시',ic:'6',short:'수시 공통 전략',sub:'6장 지원 · 수능최저 · 전략'},
 jungsi:{s:'정시',grp:'정시',ic:'가나다',short:'정시(수능)',sub:'수능 성적 · 가/나/다군'},
 music:{s:'예체능',grp:'예체능',ic:'♪',short:'음악',sub:'실기 · 수능 · 내신'},
 theater:{s:'예체능',grp:'예체능',ic:'🎬',short:'연극·영화',sub:'연기·연출·영상 실기'},
 art:{s:'예체능',grp:'예체능',ic:'✦',short:'미술',sub:'실기형 · 비실기형'},
 pe:{s:'예체능',grp:'예체능',ic:'⚑',short:'체육',sub:'실기종목 · 체력'},
 college:{s:'전문대',grp:'기타',ic:'🛠',short:'전문대',sub:'수시 1·2차 · 정시'},
 social:{s:'사회통합',grp:'기타',ic:'🤝',short:'사회통합(기회균형)',sub:'자격 요건 · 서류 준비'}
};
const ORDER=Object.keys(META);
const GUIDES=GD.slice().sort((a,b)=>ORDER.indexOf(a.id)-ORDER.indexOf(b.id));
const gById=id=>GUIDES.find(g=>g.id===id);
const STAGES=['고1','고2','고3 1학기','고3 여름방학','원서접수(9월)','전형기간','수능 전','수능 후','정시 원서접수(1월)'];
const normStage=s=>{s=String(s||'');if(STAGES.includes(s))return s;
  if(/고1/.test(s))return'고1';if(/고2/.test(s))return'고2';if(/여름/.test(s))return'고3 여름방학';if(/1학기|고3/.test(s)&&!/9월|원서/.test(s))return'고3 1학기';
  if(/정시/.test(s))return'정시 원서접수(1월)';if(/9월|원서/.test(s))return'원서접수(9월)';if(/수능 후/.test(s))return'수능 후';if(/수능 전|수능/.test(s))return'수능 전';if(/전형/.test(s))return'전형기간';return'고3 1학기'};
// all checklist items
const ITEMS=[];GUIDES.forEach(g=>(g.checklist||[]).forEach((c,i)=>ITEMS.push({key:g.id+'#'+i,g:g.id,stage:normStage(c.stage),text:c.text,why:c.why||''})));
const S={tab:'home',gid:GUIDES[0]?.id||'gyogwa',stage:'all',cgs:null,q:'',reg:new Set(),kind:new Set(),types:new Set(),sort:'name',uq:'',ovSort:'jungsi',onlyLeft:false};
let done=new Set(store.get('done',[]));
let prof=store.get('prof',{grade:'고3',goals:['gyogwa','jonghap','jungsi']});
let fav=new Set(store.get('fav',[]));
let plan=store.get('plan',{susi:[],jungsi:{}});
const save=()=>{store.set('done',[...done]);store.set('prof',prof);store.set('fav',[...fav]);store.set('plan',plan)};

// ---------- dates ----------
const today=(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),d.getDate())})();
const pd=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const diff=s=>Math.round((pd(s)-today)/864e5);
const dlabel=n=>n===0?'D-DAY':n>0?'D-'+n:'D+'+(-n);
const SCH=(B.schedule||[]);
const EVCOL=['#E5194B','#20232a','#ea580c','#bbbbbb','#9DB51E','#0d9488','#E5194B','#ea580c','#7c3aed','#db2777','#20232a','#2563eb','#0d9488','#7c3aed','#E5194B','#ea580c','#7c3aed','#db2777','#92400e','#6b7280'];
const evColor=e=>EVCOL[SCH.indexOf(e)]||'#888';
const nextEv=()=>SCH.find(e=>diff(e.e)>=0);
const suneung=SCH.find(e=>e.g==='수능'&&e.t.includes('시험'));
const curStage=()=>{if(prof.grade==='고1')return'고1';if(prof.grade==='고2')return'고2';
  const n=today;const y=n.getFullYear(),m=n.getMonth()+1;
  if(suneung&&diff(suneung.s)<0){return diff('2027-01-04')>=-4?'정시 원서접수(1월)':'수능 후'}
  if(m>=7&&m<=8)return'고3 여름방학';if(m===9)return'원서접수(9월)';if(m>=10&&m<=11)return'수능 전';return'고3 1학기'};
const curStages=()=>{const c=curStage();return c==='수능 전'?['수능 전','전형기간']:c==='수능 후'?['수능 후','전형기간']:[c]};

// ---------- common bits ----------
function tableHTML(t,i){if(!t||!t.rows||!t.rows.length)return'';const id='t'+Math.random().toString(36).slice(2,8);
  return `<div class="tbl-t"><span>${esc(t.title||'')}</span>${t.rows.length>12?`<input class="tfilter noprint" data-tf="${id}" placeholder="표 안에서 찾기">`:''}</div>
  <div class="tbl"><table id="${id}"><thead><tr>${(t.headers||[]).map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map(r=>`<tr>${r.map(c=>`<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>${t.note?`<div class="tbl-n">${esc(t.note)}</div>`:''}`}
function progOf(list){const n=list.length,d=list.filter(x=>done.has(x.key)).length;return{n,d,p:n?Math.round(d/n*100):0}}
function ring(p){const r=46,c=2*Math.PI*r;return `<svg viewBox="0 0 110 110"><circle cx="55" cy="55" r="${r}" fill="none" stroke="#eee" stroke-width="12"/><circle cx="55" cy="55" r="${r}" fill="none" stroke="#E5194B" stroke-width="12" stroke-dasharray="${c*p/100} ${c}" transform="rotate(-90 55 55)" stroke-linecap="butt"/><text x="55" y="62" text-anchor="middle" font-size="22" font-weight="800" fill="#161616">${p}%</text></svg>`}
function head(sm,title,desc,extra=''){return `<div class="pagehead"><div class="inner"><div class="crumb">HOME › ${esc(title)}</div><small>${sm}</small><h1>${esc(title)}</h1><p>${desc}</p>${extra}</div></div>`}
const myItems=()=>ITEMS.filter(x=>prof.goals.includes(x.g)||x.g==='susi-common'&&prof.goals.some(g=>META[g]&&META[g].grp==='수시'));

// ---------- HOME ----------
function homeView(){
  const su=suneung,dn=su?diff(su.s):null,nx=nextEv();
  const my=myItems(),pr=progOf(my),cs=curStage();
  const cl=curStages();const nowItems=my.filter(x=>cl.includes(x.stage)&&!done.has(x.key)).slice(0,3);
  const up=SCH.filter(e=>diff(e.e)>=0).slice(0,6);
  return `<section class="hero"><div class="hero-l"><small>2027 UNIVERSITY ADMISSIONS</small>
   <h1>대입, 이제<br><em>스스로</em> 챙긴다</h1>
   ${su&&dn>=0?`<div class="ddbig"><b>${dlabel(dn)}</b><span>2027 수능 · ${esc(su.d)}</span></div>`:nx?`<div class="ddbig"><b>${dlabel(diff(nx.s))}</b><span>${esc(nx.t)}</span></div>`:''}
   <p>서울시교육청 「2027 대입전형의 이해와 대비」 자료집을 바탕으로 전형별 핵심·대학별 전형계획·학년별 할 일을 한곳에 정리했습니다.</p>
   <div class="stats"><div><b>${GUIDES.length}</b>전형 가이드</div><div><b>${UV.length}</b>대학 전형계획</div><div><b>${ITEMS.length}</b>체크 항목</div></div></div>
   <div class="mybox"><h2><span>나의</span> 준비 현황</h2>
    <div class="ring">${ring(pr.p)}<div class="rt"><b>${pr.d} / ${pr.n} 완료</b>지금 단계: <strong>${esc(cs)}</strong><br>목표 전형 ${prof.goals.length}개 기준</div></div>
    <div class="setup"><h4>나는 지금</h4><div class="chips">${['고1','고2','고3'].map(g=>`<span class="chip ${prof.grade===g?'on':''}" data-grade="${g}">${g}</span>`).join('')}</div>
     <h4>목표 전형 (복수 선택)</h4><div class="chips">${ORDER.filter(id=>gById(id)&&id!=='susi-common').map(id=>`<span class="chip ${prof.goals.includes(id)?'on':''}" data-goal="${id}">${esc(META[id].short)}</span>`).join('')}</div></div>
    ${nowItems.length?nowItems.map(x=>`<div class="nextup" data-go="plan"><small>지금 할 일 · ${esc(META[x.g]?.short||'')}</small><div>${esc(x.text)}</div></div>`).join(''):`<div class="nextup" data-go="plan"><small>체크리스트</small><div>단계별 할 일 전체 보기 →</div></div>`}
   </div>
   <div class="sched"><h2>다가오는 일정 <a data-go="sched">전체</a></h2><div class="m">오늘 ${today.getMonth()+1}월 ${today.getDate()}일 기준</div><ul>
    ${up.map(e=>`<li data-go="sched"><div class="t"><span class="dd">${diff(e.s)>0?dlabel(diff(e.s)):'진행 중'}</span>${esc(e.t)}</div><div class="d">${esc(e.d)}</div></li>`).join('')||'<li>2027 대입 일정이 모두 끝났습니다.</li>'}</ul></div></section>
  <section class="blk"><div class="inner"><div class="blk-h"><div><h2>전형별 가이드</h2><p>어떤 전형인지, 어떻게 평가하는지, 언제 무엇을 해야 하는지</p></div><a class="more" data-go="guide">전체 보기 →</a></div>
   <div class="tiles">${GUIDES.filter(g=>g.id!=='susi-common').slice(0,8).map((g,i)=>{const m=META[g.id]||{};const p=progOf(ITEMS.filter(x=>x.g===g.id));
     return `<div class="tile gtile ${i===2?'red':i===4?'dark':''}" data-guide="${g.id}"><span class="arrow">↗</span><span class="gl">${esc(m.ic||'')}</span><h3>${esc(m.short||g.title)}</h3><span class="tc">${esc(m.sub||'')}</span><div><span class="ptile">체크 ${p.d}/${p.n}</span><div class="pbar"><div style="width:${p.p}%"></div></div></div></div>`}).join('')}</div></div></section>
  <section class="blk" style="padding-top:0"><div class="inner"><div class="blk-h"><div><h2>2027 대입 한눈에</h2><p>모집 인원과 꼭 알아야 할 변화</p></div><a class="more" data-go="ov">자세히 →</a></div>
   <div class="split"><div class="lvl" data-go="ov"><div class="big">80.3%</div><div><h3>수시 277,583명</h3><p>전체 모집인원 345,717명 중 수시 비중이 계속 늘고 있어요. 비수도권은 수시 89.5%.</p></div></div>
   <div class="lvl h" data-go="ov"><div class="big">40.6%</div><div><h3>수도권 주요대 정시</h3><p>수도권 주요 37개 대학은 정시 수능 비중이 40.6% — 수능 준비도 놓치면 안 돼요.</p></div></div></div></div></section>
  <section class="blk" style="padding-top:0"><div class="inner"><div class="blk-h"><div><h2>대학별 전형계획</h2><p>${UV.length}개 4년제 대학의 수시·정시 전형, 수능최저, 반영비율</p></div><a class="more" data-go="univ">대학 찾기 →</a></div>
   <div class="board">${UV.filter(u=>fav.has(u.id)).concat(UV.filter(u=>!fav.has(u.id))).slice(0,8).map(u=>`<div class="row" data-open="${u.id}"><span class="cat ${u.region==='서울'?'':'i'}">${esc(u.region)}</span><span class="tt">${fav.has(u.id)?'★ ':''}${esc(u.name)} <span class="sm">${(u.types||[]).join(' · ')}</span></span><span class="sm">수시 ${(u.susi||[]).length}개 전형</span><span><b>정시 ${(u.jungsi||[]).length}</b></span></div>`).join('')}</div></div></section>
  <section class="blk guide"><div class="inner"><div class="blk-h"><div><h2>이 사이트 활용법</h2></div></div>
   <div class="steps"><div class="step"><h3>학년·목표 전형 설정</h3><p>홈에서 학년과 관심 전형을 고르면 나에게 맞는 체크리스트만 모아 보여줘요.</p></div>
   <div class="step"><h3>전형 가이드 읽기</h3><p>전형별 핵심·평가 방법·2027 변경사항·주의점을 표와 함께 확인하세요.</p></div>
   <div class="step"><h3>단계별 체크</h3><p>고1부터 정시 원서접수까지 단계별 할 일을 체크하면 진행률이 저장돼요(이 브라우저).</p></div>
   <div class="step"><h3>지원 플래너</h3><p>관심 대학을 ★로 모은 뒤 수시 6장·정시 가/나/다군 조합을 짜고 수능최저를 비교하세요.</p></div></div></div></section>`}

// ---------- GUIDE ----------
function guideView(){const g=gById(S.gid)||GUIDES[0];if(!g)return head('GUIDE','전형 가이드','자료 준비 중');const m=META[g.id]||{};
  const items=ITEMS.filter(x=>x.g===g.id),pr=progOf(items);
  const secs=[['sum','개요'],['key','핵심 포인트'],['eval','평가 방법'],['chg','2027 변경사항'],['tbl','자료 표'],['chk','할 일 체크리스트'],['tip','준비 팁'],['warn','주의사항'],['lnk','관련 사이트']].filter(([k])=>({sum:1,key:(g.keyPoints||[]).length,eval:(g.howEvaluated||[]).length,chg:(g.changes2027||[]).length,tbl:(g.tables||[]).length,chk:items.length,tip:(g.tips||[]).length,warn:(g.cautions||[]).length,lnk:(g.links||[]).length})[k]);
  const L=(a,c='')=>`<ul class="pts ${c}">${(a||[]).map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
  return `<div class="pagehead"><div class="inner"><div class="crumb">HOME › 전형 가이드 › ${esc(m.grp||'')}</div><small>${esc(m.grp||'')} · 자료집 ${g.page||''}쪽~</small><h1>${esc(g.title)}</h1><p>체크리스트 ${pr.d}/${pr.n} 완료 (${pr.p}%)</p></div></div>
  <nav class="gnav"><div class="inner" style="display:flex">${GUIDES.map(x=>`<button class="${x.id===g.id?'on':''}" data-guide="${x.id}">${esc(META[x.id]?.short||x.title)}</button>`).join('')}</div></nav>
  <div class="inner glayout"><aside class="toc">${secs.map(([k,n])=>`<a data-jump="g-${k}">${n}</a>`).join('')}<a data-print="1">🖨 이 페이지 인쇄</a></aside><div>
   <div class="gsec" id="g-sum"><p class="lead">${esc(g.summary||'')}</p></div>
   ${(g.keyPoints||[]).length?`<div class="gsec" id="g-key"><h2>핵심 포인트</h2>${L(g.keyPoints)}</div>`:''}
   ${(g.howEvaluated||[]).length?`<div class="gsec" id="g-eval"><h2>평가 방법</h2>${L(g.howEvaluated)}</div>`:''}
   ${(g.changes2027||[]).length?`<div class="gsec" id="g-chg"><h2>2027 변경사항</h2>${L(g.changes2027,'ch')}</div>`:''}
   ${(g.tables||[]).length?`<div class="gsec" id="g-tbl"><h2>자료 표</h2>${g.tables.map(tableHTML).join('')}</div>`:''}
   ${items.length?`<div class="gsec" id="g-chk"><h2>할 일 체크리스트</h2><div class="prog"><div style="width:${pr.p}%"></div></div>${chkList(items,true)}</div>`:''}
   ${(g.tips||[]).length?`<div class="gsec" id="g-tip"><h2>준비 팁</h2>${L(g.tips,'tip')}</div>`:''}
   ${(g.cautions||[]).length?`<div class="gsec" id="g-warn"><h2>주의사항</h2>${L(g.cautions,'warn')}</div>`:''}
   ${(g.links||[]).length?`<div class="gsec" id="g-lnk"><h2>관련 사이트</h2><div class="links">${g.links.map(l=>`<a class="lk" href="${esc(l.url)}" target="_blank" rel="noopener"><span class="ccb g">LINK</span><span class="lt">${esc(l.label)}</span><span class="ar">↗</span></a>`).join('')}</div></div>`:''}
   <div class="note">출처: ${esc(B.source||'')}. 전형 계획은 대학 사정으로 바뀔 수 있으니 반드시 대학이 발표하는 최종 모집요강을 확인하세요.</div>
  </div></div>`}
function chkList(items,showStage){return `<ul class="chk">${items.map(x=>`<li class="${done.has(x.key)?'done':''}" data-ck="${esc(x.key)}"><input type="checkbox" ${done.has(x.key)?'checked':''} tabindex="-1" aria-label="완료"><div><div class="meta">${showStage?`<span class="st">${esc(x.stage)}</span>`:''}<span class="gs">${esc(META[x.g]?.short||x.g)}</span></div><div class="tx">${esc(x.text)}</div>${x.why?`<div class="wy">${esc(x.why)}</div>`:''}</div></li>`).join('')}</ul>`}

// ---------- PLAN (checklist) ----------
function planView(){
  const base=S.cgs?ITEMS.filter(x=>x.g===S.cgs):myItems();
  const cs=curStage();
  const cnt=st=>base.filter(x=>x.stage===st);
  let list=S.stage==='all'?base:base.filter(x=>x.stage===S.stage);if(S.onlyLeft)list=list.filter(x=>!done.has(x.key));
  const pr=progOf(base);
  const order=STAGES.filter(st=>cnt(st).length);
  const grouped=S.stage==='all'?order.map(st=>{const l=list.filter(x=>x.stage===st);return l.length?`<h3 style="margin:28px 0 6px;font-size:17px">${esc(st)} ${curStages().includes(st)?'<span class="dday-chip" style="background:var(--lime);color:var(--ink)">지금</span>':''}</h3>${chkList(l,false)}`:''}).join(''):chkList(list,false);
  return head('MY CHECKLIST','나의 체크리스트',`학년·목표 전형에 맞춘 단계별 할 일 — 체크하면 이 브라우저에 저장됩니다.`)+
  `<div class="inner layout"><aside class="filters" id="filters"><div class="fh">보기 설정<button data-reset="plan">초기화 ↺</button></div>
   <div class="fg"><h4>전형 <span class="sm">${S.cgs?'':'목표 전형'}</span></h4><div class="chips"><span class="chip ${!S.cgs?'on':''}" data-cgs="">나의 목표 전형</span>${GUIDES.map(g=>`<span class="chip ${S.cgs===g.id?'on':''}" data-cgs="${g.id}">${esc(META[g.id]?.short||g.title)}<span class="c">${ITEMS.filter(x=>x.g===g.id).length}</span></span>`).join('')}</div></div>
   <div class="fg"><h4>목표 전형 바꾸기</h4><div class="chips">${ORDER.filter(id=>gById(id)&&id!=='susi-common').map(id=>`<span class="chip ex ${prof.goals.includes(id)?'on':''}" data-goal="${id}">${esc(META[id].short)}</span>`).join('')}</div></div>
   <div class="fg"><label style="font-size:14px;cursor:pointer"><input type="checkbox" id="onlyLeft" ${S.onlyLeft?'checked':''} style="accent-color:var(--red)"> 남은 일만 보기</label></div>
   <div class="fg"><button class="btn s" data-print="1" style="width:100%;justify-content:center">🖨 체크리스트 인쇄</button></div></aside>
  <div><div class="toolbar"><div class="count"><b>${pr.d}</b> / ${pr.n} 완료 · ${pr.p}%</div><button class="ftbtn" data-ft="1">⚙ 보기 설정</button></div>
   <div class="prog"><div style="width:${pr.p}%"></div></div>
   <div class="stagebar"><button class="${S.stage==='all'?'on':''}" data-stage="all">전체<b>${base.length}</b></button>${order.map(st=>`<button class="${S.stage===st?'on':''} ${curStages().includes(st)?'now':''}" data-stage="${esc(st)}">${esc(st)}<b>${cnt(st).filter(x=>done.has(x.key)).length}/${cnt(st).length}</b></button>`).join('')}</div>
   ${list.length?grouped:'<div class="empty">표시할 항목이 없어요. 목표 전형을 선택해 보세요.</div>'}</div></div>`}

// ---------- SCHEDULE ----------
function schedView(){
  const months=[];for(let y=2026,m=5;!(y===2027&&m===3);){months.push([y,m]);m++;if(m>12){m=1;y++}}
  const evsOn=(d)=>SCH.filter(e=>pd(e.s)<=d&&d<=pd(e.e)&&!(e.t.includes('전형기간')));
  const cellStyle=(es)=>{if(!es.length)return'';if(es.length===1)return`background:${evColor(es[0])}`;const n=es.length;return`background:linear-gradient(135deg,${es.map((e,i)=>`${evColor(e)} ${i*100/n}% ${(i+1)*100/n}%`).join(',')})`};
  return head('SCHEDULE','2027 대입 일정','수시·수능·정시·추가모집 전체 일정과 D-day',`<div class="quick"><button class="on">2027 대입</button></div>`)+
  `<div class="inner" style="padding:34px 24px 70px"><div class="legend"><span><i class="ca" style="background:var(--red)"></i>수시</span><span><i style="background:var(--lime-d)"></i>수능</span><span><i style="background:var(--navy)"></i>정시</span><span><i style="background:#888"></i>추가모집</span></div>
   <div class="tline">${SCH.map(e=>{const a=diff(e.s),b=diff(e.e);const past=b<0,cur=a<=0&&b>=0;
     return `<div class="tev g-${e.g} ${past?'past':''} ${cur?'cur':''}"><div class="when">${esc(e.d)}</div><div class="what"><b><span class="gbadge gb-${e.g}">${e.g}</span>${esc(e.t)}</b><small>2026 대입: ${esc(e.prev||'')}</small></div><div class="dd ${a>=0&&a<=30?'soon':''}">${cur?'진행 중':past?'종료':dlabel(a)}</div></div>`}).join('')}</div>
   <div class="note" style="margin-top:24px">${(B.scheduleNotes||[]).map(esc).join('<br>')}</div>
   <div class="months">${months.map(([y,m])=>{const f=new Date(y,m-1,1),days=new Date(y,m,0).getDate();let c='<tr>'+'<td></td>'.repeat(f.getDay());
     for(let d=1;d<=days;d++){const dt=new Date(y,m-1,d),es=evsOn(dt);c+=`<td class="${es.length?'ev':''} ${+dt===+today?'today':''}" ${es.length?`style="${cellStyle(es)}" title="${esc(es.map(e=>e.t).join(' / '))}"`:''}>${d}</td>`;if(dt.getDay()===6)c+='</tr><tr>'}
     const evs=SCH.filter(e=>{const s=pd(e.s);return s.getFullYear()===y&&s.getMonth()===m-1});
     return evs.length||true?`<div class="mon"><h4>${y}년 ${m}월</h4><table><tr>${'일월화수목금토'.split('').map(x=>`<th>${x}</th>`).join('')}</tr>${c}</tr></table>${evs.map(e=>`<div class="evl"><i style="background:${evColor(e)}"></i><span class="gbadge gb-${e.g}">${e.g}</span><span>${pd(e.s).getDate()}${e.e!==e.s?'~'+(pd(e.e).getMonth()===pd(e.s).getMonth()?'':(pd(e.e).getMonth()+1)+'/')+pd(e.e).getDate():''}일 ${esc(e.t)}</span></div>`).join('')}</div>`:''}).join('')}</div>
   <p class="src">수시 전형기간(9. 12. ~ 12. 17.)은 대학별 면접·논술·실기 일정이 다르므로 모집요강에서 확인하세요.</p></div>`}

// ---------- UNIVERSITIES ----------
const REGIONS=['서울','경기·인천','강원','충청·세종','경상','전라·제주','특수목적'];
const KINDS=['일반대','교육대','과학기술원','특수목적'];
const TYPES=['교과','종합','논술','실기','기타'];
function uMatch(u){if(S.reg.size&&!S.reg.has(u.region))return false;if(S.kind.size&&!S.kind.has(u.kind))return false;
  if(S.types.size&&![...S.types].every(t=>(u.types||[]).includes(t)))return false;
  if(S.uq){const h=[u.name,u.region,...(u.susi||[]).flatMap(s=>[s.name,s.method,s.min]),...(u.jungsi||[]).flatMap(j=>[j.name,j.ratio]),...(u.notes||[])].join(' ').toLowerCase();if(!S.uq.toLowerCase().split(/\s+/).every(w=>h.includes(w)))return false}
  return true}
function univView(){let l=UV.filter(uMatch);if(S.sort==='fav')l.sort((a,b)=>fav.has(b.id)-fav.has(a.id));if(S.sort==='susi')l.sort((a,b)=>(b.susiTotal||0)-(a.susiTotal||0));
  const cnt=(f)=>UV.filter(f).length;
  return head('UNIVERSITIES','대학별 전형계획',`${UV.length}개 4년제 대학의 2027 수시·정시 전형 — ★로 관심 대학을 모아 지원 플래너에서 조합해 보세요.`)+
  `<div class="inner layout"><aside class="filters" id="filters"><div class="fh">필터<button data-reset="univ">초기화 ↺</button></div>
   <div class="fg"><input class="fsearch" id="uq" placeholder="대학명·전형명·키워드 (예: 지역균형, 의예)" value="${esc(S.uq)}"></div>
   <div class="fg"><h4>지역</h4><div class="chips">${REGIONS.map(r=>`<span class="chip ${S.reg.has(r)?'on':''}" data-reg="${r}">${r}<span class="c">${cnt(u=>u.region===r)}</span></span>`).join('')}</div></div>
   <div class="fg"><h4>대학 유형</h4><div class="chips">${KINDS.map(r=>`<span class="chip ${S.kind.has(r)?'on':''}" data-kind="${r}">${r}<span class="c">${cnt(u=>u.kind===r)}</span></span>`).join('')}</div></div>
   <div class="fg"><h4>수시 전형 유형 <span class="sm">모두 포함</span></h4><div class="chips">${TYPES.map(r=>`<span class="chip ex ${S.types.has(r)?'on':''}" data-type="${r}">${r}<span class="c">${cnt(u=>(u.types||[]).includes(r))}</span></span>`).join('')}</div></div>
   <div class="fg"><h4>관심 대학</h4><span class="chip ${S.sort==='fav'?'on':''}" data-sort="fav">★ ${fav.size}개 먼저 보기</span></div></aside>
  <div><div class="toolbar"><div class="count"><b>${l.length}</b>개 대학</div><div style="display:flex;gap:8px"><button class="ftbtn" data-ft="1">⚙ 필터</button><select id="usort"><option value="name" ${S.sort==='name'?'selected':''}>가나다순</option><option value="susi" ${S.sort==='susi'?'selected':''}>수시 모집인원 많은 순</option><option value="fav" ${S.sort==='fav'?'selected':''}>관심 대학 먼저</option></select></div></div>
   ${l.length?`<div class="grid">${l.map(uCard).join('')}</div>`:'<div class="empty">조건에 맞는 대학이 없어요.</div>'}</div></div>`}
function uCard(u){const gs=['가','나','다'].filter(g=>(u.jungsi||[]).some(x=>(x.groups||'').includes(g+'군')));const j=gs.length?'정시 '+gs.join('·')+'군':(u.jungsi||[]).length?'정시 '+u.jungsi.length+'개':'';
  return `<div class="card ${u.region==='서울'?'':'intl'}" data-open="${u.id}"><button class="star ${fav.has(u.id)?'on':''}" data-fav="${u.id}" aria-label="관심">★</button>
   <div class="top"><span class="s">${esc(u.region)}</span><span class="l">· ${esc(u.kind)}</span></div><h4>${esc(u.name)}</h4>
   <div class="tags">${(u.types||[]).map(t=>`<span class="tbadge t-${t}">${t}</span>`).join('')}</div>
   <div class="desc">${(u.susi||[]).slice(0,4).map(s=>esc(s.name)+(s.count?` ${s.count}명`:'')).join(' · ')}</div>
   <div class="due"><span class="dl">${u.susiTotal?`수시 ${u.susiTotal.toLocaleString()}명`:'수시 '+(u.susi||[]).length+'개 전형'}</span><span class="go">${esc(j)} →</span></div></div>`}
function openUniv(id){const u=UV.find(x=>x.id===id);if(!u)return;
  const inPlan=(i)=>plan.susi.some(p=>p.u===u.id&&p.i===i);
  $('#modal').innerHTML=`<div class="mhead ${u.region==='서울'?'dom':''}"><small>${esc(u.region)} · ${esc(u.kind)} · 자료집 ${u.page||''}쪽</small><h2>${esc(u.name)}</h2><div class="en">${(u.types||[]).join(' · ')}</div><button class="close" data-close="1" aria-label="닫기">✕</button></div>
  <div class="mbody"><div class="acts" style="margin-top:0"><button class="btn ${fav.has(u.id)?'p':'s'}" data-fav="${u.id}">${fav.has(u.id)?'★ 관심 대학':'☆ 관심 대학 추가'}</button><button class="btn s" data-go="apply" data-close="1">지원 플래너 →</button></div>
   <div class="sec"><h3>수시 전형 <span class="sm">${(u.susi||[]).length}개</span></h3>${(u.susi||[]).map((s,i)=>`<div class="srow"><div><h5><span class="tbadge t-${esc(s.type)}">${esc(s.type)}</span>${esc(s.name)} ${s.count?`<span class="sm">${s.count}명</span>`:''}</h5><div class="m">${esc(s.method||'')}</div></div><button class="addb ${inPlan(i)?'on':''}" data-addsusi="${u.id}|${i}">${inPlan(i)?'✓ 플래너':'+ 수시 플래너'}</button>${s.min?`<div class="mn ${/없음|^X$|미적용/.test(s.min)?'none':''}">수능최저 · ${esc(s.min)}</div>`:''}</div>`).join('')||'<p class="sm">정보 없음</p>'}</div>
   ${(u.gyogwaCalc||[]).length?`<div class="sec"><h3>교과 반영 방법</h3><ul class="pts">${u.gyogwaCalc.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
   <div class="sec"><h3>정시 전형</h3>${(u.jungsi||[]).map((j,i)=>`<div class="srow"><div><h5><span class="tbadge t-종합">정시</span>${esc(j.name||'')} <span class="sm">${esc(j.groups||'')}</span></h5><div class="m">${esc(j.method||'')}${j.ratio?' · '+esc(j.ratio):''}</div>${j.note?`<div class="sm">${esc(j.note)}</div>`:''}</div><button class="addb" data-addj="${u.id}|${i}">+ 정시 플래너</button></div>`).join('')||'<p class="sm">정보 없음</p>'}
   ${u.english?`<dl class="kv"><dt>영어 반영</dt><dd>${esc(u.english)}</dd></dl>`:''}</div>
   ${(u.notes||[]).length?`<div class="sec"><h3>참고</h3><ul class="pts warn">${u.notes.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:''}
   <div class="warn">2027 대입 시행계획 기준 요약입니다. 모집인원·수능최저·반영비율은 바뀔 수 있으니 반드시 대학 모집요강을 확인하세요.</div></div>`;
  $('#mbg').classList.add('open');document.body.style.overflow='hidden'}
function closeM(){$('#mbg').classList.remove('open');document.body.style.overflow=''}

// ---------- PLANNER ----------
function applyView(){const su=plan.susi.map(p=>({p,u:UV.find(x=>x.id===p.u)})).filter(x=>x.u&&x.u.susi&&x.u.susi[x.p.i]);
  const favs=UV.filter(u=>fav.has(u.id));
  const grp=['가','나','다'];
  const slot=(k,i)=>{if(k){const s=k.u.susi[k.p.i];return `<div class="slot f"><button class="x" data-rmsusi="${i}" aria-label="삭제">✕</button><span class="n">수시 ${i+1}</span><h5>${esc(k.u.name)}</h5><div><span class="tbadge t-${esc(s.type)}">${esc(s.type)}</span> <b style="font-size:14px">${esc(s.name)}</b>${s.count?` <span class="sm">${s.count}명</span>`:''}</div><div class="m">${esc(s.method||'')}</div>${s.min?`<div class="mn">수능최저: ${esc(s.min)}</div>`:''}</div>`}
    return `<div class="slot"><span class="n">수시 ${i+1}</span><select data-pick="${i}"><option value="">관심 대학에서 선택…</option>${favs.map(u=>`<optgroup label="${esc(u.name)}">${(u.susi||[]).map((s,j)=>`<option value="${u.id}|${j}">${esc(s.type)} · ${esc(s.name)}</option>`).join('')}</optgroup>`).join('')}</select><p class="sm">${favs.length?'또는 대학 상세에서 “+ 수시 플래너”':'먼저 대학 찾기에서 ★ 관심 대학을 추가하세요.'}</p></div>`};
  const jslot=(g)=>{const v=plan.jungsi[g];const u=v&&UV.find(x=>x.id===v.u);const j=u&&u.jungsi&&u.jungsi[v.i];
    if(j)return `<div class="slot f jf"><button class="x" data-rmj="${g}" aria-label="삭제">✕</button><span class="n">정시 ${g}군</span><h5>${esc(u.name)}</h5><div class="m"><b>${esc(j.name||'')}</b> · ${esc(j.groups||'')}</div><div class="m">${esc(j.method||'')}</div>${j.ratio?`<div class="mn">${esc(j.ratio)}</div>`:''}</div>`;
    const opts=favs.flatMap(u=>(u.jungsi||[]).map((j,i)=>({u,j,i}))).filter(x=>!x.j.groups||x.j.groups.includes(g+'군'));
    return `<div class="slot"><span class="n">정시 ${g}군</span><select data-pickj="${g}"><option value="">관심 대학에서 선택…</option>${opts.map(x=>`<option value="${x.u.id}|${x.i}">${esc(x.u.name)} · ${esc(x.j.name||'')}</option>`).join('')}</select><p class="sm">${g}군 모집이 있는 관심 대학만 표시</p></div>`};
  const n=su.length;const nonsulCnt=su.filter(k=>k.u.susi[k.p.i].type==='논술').length;
  return head('PLANNER','지원 플래너','수시 최대 6장 + 정시 가·나·다군 1장씩 — 관심 대학으로 나만의 지원 조합을 짜 보세요.')+
  `<div class="inner" style="padding:34px 24px 70px">
   <div class="blk-h"><div><h2>수시 6장</h2><p>수시는 최대 6개 전형까지 지원할 수 있어요(산업대·전문대·과학기술원·사관학교 등 일부는 횟수 제한 제외 — 모집요강 확인).</p></div><span class="count"><b>${n}</b> / 6</span></div>
   <div class="slots">${Array.from({length:6},(_,i)=>slot(su[i],i)).join('')}</div>
   ${n>=6?'<div class="bad">수시 6장을 모두 채웠어요. 더 추가하려면 기존 카드를 삭제하세요.</div>':n?`<div class="ok">${6-n}장 남았어요. ${nonsulCnt?'논술 전형은 수능 전·후 시험일이 겹치지 않는지 꼭 확인하세요.':''}</div>`:''}
   ${su.length?`<div class="tbl ptbl"><table><thead><tr><th>#</th><th>대학</th><th>유형</th><th>전형</th><th>전형방법</th><th>수능최저</th></tr></thead><tbody>${su.map((k,i)=>{const s=k.u.susi[k.p.i];return `<tr><td>${i+1}</td><td>${esc(k.u.name)}</td><td>${esc(s.type)}</td><td>${esc(s.name)}</td><td>${esc(s.method||'')}</td><td>${esc(s.min||'')}</td></tr>`}).join('')}</tbody></table></div>`:''}
   <div class="blk-h" style="margin-top:40px"><div><h2>정시 가·나·다군</h2><p>정시는 군별로 1개씩, 최대 3개 대학에 지원해요.</p></div></div>
   <div class="slots">${grp.map(jslot).join('')}</div>
   <div class="acts noprint"><button class="btn s" data-print="1">🖨 플랜 인쇄</button><button class="btn s" data-go="univ">대학 더 찾기 →</button><button class="btn s" data-clearplan="1">플랜 비우기</button></div></div>`}

// ---------- OVERVIEW ----------
function ovView(){const M=(B.major||[]).map(r=>({n:r[0],g:r[1],j:r[2],ns:r[3],s:r[4],t:r[1]+r[2]+r[3]+r[4]}));
  const k=S.ovSort;const key={gyogwa:x=>x.g/x.t,jonghap:x=>x.j/x.t,nonsul:x=>x.ns/x.t,jungsi:x=>x.s/x.t,total:x=>x.t}[k];M.sort((a,b)=>key(b)-key(a));
  const T=(o,title)=>o?tableHTML({title,headers:o.headers,rows:o.rows}):'';
  return head('OVERVIEW','2027 대입 한눈에','모집 인원 흐름, 수도권 주요대 전형 비율, 의약학·전공자율선택제, 학교폭력 반영, 대학별 변경사항')+
  `<div class="inner" style="padding:34px 24px 70px">
   <div class="kpis"><div class="kpi r"><small>전체 모집인원</small><b>345,717</b><span>전년 대비 +538명</span></div><div class="kpi"><small>수시</small><b>277,583</b><span>80.3% · 계속 증가</span></div><div class="kpi"><small>정시</small><b>68,134</b><span>19.7% · 계속 감소</span></div><div class="kpi"><small>의대 모집인원</small><b>4,957</b><span>수시 68.93% (변동 가능)</span></div></div>
   <div class="gsec"><h2>수도권 주요대 전형별 모집 비율</h2><p class="sm">${esc(B.majorNote||'')}</p>
    <div class="legend"><span><i class="c1"></i>학생부교과</span><span><i class="c2"></i>학생부종합</span><span><i class="c3"></i>논술</span><span><i class="c4"></i>정시 수능</span>
     <span style="margin-left:auto">정렬: ${[['jungsi','정시'],['jonghap','종합'],['gyogwa','교과'],['nonsul','논술'],['total','총인원']].map(([v,l])=>`<button class="sortbtn ${k===v?'on':''}" data-ov="${v}">${l}</button>`).join(' ')}</span></div>
    <div class="bars">${M.map(x=>{const p=v=>(v/x.t*100);const u=UV.find(u=>u.name.replace('대학교','대').replace('여자대','여대')===x.n||u.name.startsWith(x.n.replace(/대$/,'')));
      return `<div class="bar" ${u?`data-open="${u.id}"`:''} title="교과 ${x.g} · 종합 ${x.j} · 논술 ${x.ns} · 정시 ${x.s}"><span class="bn">${esc(x.n)}</span><span class="bt2"><i class="c1" style="width:${p(x.g)}%"></i><i class="c2" style="width:${p(x.j)}%"></i><i class="c3" style="width:${p(x.ns)}%"></i><i class="c4" style="width:${p(x.s)}%"></i></span><span class="bv">${k==='total'?x.t.toLocaleString():Math.round(key(x)*100)+'%'}</span></div>`}).join('')}</div></div>
   <div class="gsec"><h2>시기별 모집인원 추이</h2>${T(B.byPeriod,'')}<ul class="pts"><li>수시는 계속 증가, 정시는 계속 감소 추세입니다.</li><li>시행계획(2025. 4. 30.) 기준 인원으로, 의대 정원·첨단학과·구조조정에 따라 실제 인원은 달라질 수 있어 모집요강에서 확정 인원을 확인해야 합니다.</li></ul></div>
   <div class="gsec"><h2>권역별 전형별 모집인원</h2>${T(B.byRegion,'')}<ul class="pts"><li>수도권은 수시 65.8%·정시 34.2%, 비수도권은 수시 89.5%·정시 10.5%입니다.</li><li>수도권 대학을 원한다면 학생부교과·학생부종합·논술·수능까지 모두 고려해 준비해야 합니다.</li></ul></div>
   <div class="gsec"><h2>의·치·한·약·수의대 모집인원</h2>${T(B.medical,'')}<p class="sm">${esc(B.medicalNote||'')}</p></div>
   <div class="gsec"><h2>전공자율선택제 모집인원</h2>${T(B.freeMajor,'')}<p class="sm">${esc(B.freeMajorNote||'')}</p></div>
   <div class="gsec"><h2>사회통합전형 모집인원</h2>${T(B.social,'')}<p class="sm">사회통합전형에는 기회균형·지역균형·지역인재전형이 있으며, 서울 수험생에게 해당하는 것은 기회균형과 지역균형(교과성적을 활용하는 학교장추천 전형)입니다.</p></div>
   <div class="gsec"><h2>학교폭력 조치사항 대입 반영</h2><p class="lead" style="font-size:15px">${esc(B.violenceNote||'')}</p>${(B.violence||[]).map(v=>tableHTML({title:v.k+' — '+v.d,headers:['전형','대학'],rows:v.rows})).join('')}</div>
   <div class="gsec"><h2>2026 대비 수도권 대학 주요 변경사항</h2>${tableHTML({title:'',headers:['대학','변경사항'],rows:B.changes||[]})}</div>
   <p class="src">출처: ${esc(B.source||'')}</p></div>`}

// ---------- shell ----------
const TABS=[['home','홈'],['guide','전형 가이드'],['plan','나의 체크리스트'],['sched','대입 일정'],['univ','대학별 전형'],['apply','지원 플래너'],['ov','2027 한눈에']];
function render(){const v={home:homeView,guide:guideView,plan:planView,sched:schedView,univ:univView,apply:applyView,ov:ovView}[S.tab]||homeView;
  $('#content').innerHTML=v();
  $('#menu').innerHTML=TABS.slice(1).map(([k,n])=>`<button class="${S.tab===k?'on':''}" data-go="${k}">${n}</button>`).join('');
  $('#utilNav').innerHTML=[['sched','📅 일정'],['plan','✔ 체크리스트'],['apply','🎯 지원 플래너'],['univ','🏫 대학 찾기']].map(([k,n])=>`<a class="${S.tab===k?'on':''}" data-go="${k}">${n}</a>`).join('');
  const su=suneung;$('#today').innerHTML=su&&diff(su.s)>=0?`수능 <span class="dday-chip">${dlabel(diff(su.s))}</span>`:`${today.getFullYear()}.${today.getMonth()+1}.${today.getDate()}`;
  $('#foot').innerHTML=`<div class="links">${TABS.map(([k,n])=>`<a data-go="${k}">${n}</a>`).join('')}</div><div class="flex"><div><div class="flogo">Uni<b>Prep</b> 2027</div><p>출처: ${esc(B.source||'')}<br>대학입학전형 계획과 전형요강은 대학 사정에 따라 바뀔 수 있으므로, 반드시 대학이 발표하는 최종 모집요강을 확인하세요.<br>체크 기록·관심 대학·플랜은 이 기기의 브라우저에만 저장됩니다.</p></div><div style="text-align:right">© 다인에듀 (후안샘)</div></div>`;
  document.querySelectorAll('[data-tf]').forEach(inp=>inp.addEventListener('input',()=>{const q=inp.value.toLowerCase();document.querySelectorAll('#'+inp.dataset.tf+' tbody tr').forEach(tr=>tr.style.display=tr.textContent.toLowerCase().includes(q)?'':'none')}));
  const uq=$('#uq');if(uq)uq.addEventListener('input',()=>{S.uq=uq.value;const pos=uq.selectionStart;rerenderKeepFocus('uq',pos)});
  const us=$('#usort');if(us)us.addEventListener('change',()=>{S.sort=us.value;render()});
  const ol=$('#onlyLeft');if(ol)ol.addEventListener('change',()=>{S.onlyLeft=ol.checked;render()});
  document.querySelectorAll('[data-pick]').forEach(s=>s.addEventListener('change',()=>{if(!s.value)return;const[u,i]=s.value.split('|');addSusi(u,+i)}));
  document.querySelectorAll('[data-pickj]').forEach(s=>s.addEventListener('change',()=>{if(!s.value)return;const[u,i]=s.value.split('|');plan.jungsi[s.dataset.pickj]={u,i:+i};save();render()}));
}
function rerenderKeepFocus(id,pos){const y=scrollY;render();const el=$('#'+id);if(el){el.focus();try{el.setSelectionRange(pos,pos)}catch(e){}}scrollTo(0,y)}
function go(tab,keep){S.tab=tab;$('#menu').classList.remove('open');render();if(!keep)scrollTo(0,0);try{history.replaceState(null,'','#'+tab+(tab==='guide'?'/'+S.gid:''))}catch(e){}}
function addSusi(u,i){if(plan.susi.some(p=>p.u===u&&p.i===i)){plan.susi=plan.susi.filter(p=>!(p.u===u&&p.i===i))}else{if(plan.susi.length>=6){alertBox('수시는 최대 6장까지만 지원할 수 있어요.');return}plan.susi.push({u,i});fav.add(u)}save();if($('#mbg').classList.contains('open'))openUniv(u);render()}
function alertBox(msg){const d=document.createElement('div');d.className='bad';d.style.cssText='position:fixed;left:50%;top:20px;transform:translateX(-50%);z-index:99;box-shadow:0 10px 30px rgba(0,0,0,.2)';d.textContent=msg;document.body.appendChild(d);setTimeout(()=>d.remove(),2600)}

document.addEventListener('click',e=>{const el=e.target.closest('[data-go],[data-guide],[data-open],[data-fav],[data-ck],[data-grade],[data-goal],[data-stage],[data-cgs],[data-reset],[data-reg],[data-kind],[data-type],[data-sort],[data-close],[data-jump],[data-print],[data-ft],[data-addsusi],[data-addj],[data-rmsusi],[data-rmj],[data-clearplan],[data-ov]');
  if(!el){if(!e.target.closest('#langBtn'));return}const d=el.dataset;
  if(d.fav){e.stopPropagation();fav.has(d.fav)?fav.delete(d.fav):fav.add(d.fav);save();if($('#mbg').classList.contains('open'))openUniv(d.fav);const y=scrollY;render();scrollTo(0,y);return}
  if(d.addsusi){const[u,i]=d.addsusi.split('|');addSusi(u,+i);return}
  if(d.addj){const[u,i]=d.addj.split('|');const uu=UV.find(x=>x.id===u),j=uu.jungsi[+i];const gs=['가','나','다'].filter(g=>!j.groups||j.groups.includes(g+'군'));const g=gs.find(g=>!plan.jungsi[g])||gs[0]||'가';plan.jungsi[g]={u,i:+i};fav.add(u);save();alertBox(`정시 ${g}군에 ${uu.name}을(를) 넣었어요.`);return}
  if(d.close!==undefined&&!d.go){if(e.target===el||el.classList.contains('close'))closeM();return}
  if(d.go){if(d.close)closeM();go(d.go);return}
  if(d.guide){S.gid=d.guide;go('guide');return}
  if(d.open){openUniv(d.open);return}
  if(d.ck){const k=d.ck;done.has(k)?done.delete(k):done.add(k);save();const y=scrollY;render();scrollTo(0,y);return}
  if(d.grade){prof.grade=d.grade;save();render();return}
  if(d.goal){const g=d.goal;prof.goals=prof.goals.includes(g)?prof.goals.filter(x=>x!==g):[...prof.goals,g];save();const y=scrollY;render();scrollTo(0,y);return}
  if(d.stage){S.stage=d.stage;const y=scrollY;render();scrollTo(0,y);return}
  if(d.cgs!==undefined){S.cgs=d.cgs||null;S.stage='all';render();return}
  if(d.reset){if(d.reset==='univ'){S.reg.clear();S.kind.clear();S.types.clear();S.uq='';S.sort='name'}else{S.cgs=null;S.stage='all';S.onlyLeft=false}render();return}
  const tg=(set,v)=>{set.has(v)?set.delete(v):set.add(v);const y=scrollY;render();scrollTo(0,y)};
  if(d.reg)return tg(S.reg,d.reg);if(d.kind)return tg(S.kind,d.kind);if(d.type)return tg(S.types,d.type);
  if(d.sort){S.sort=S.sort==='fav'?'name':'fav';render();return}
  if(d.jump){const t=document.getElementById(d.jump);if(t)t.scrollIntoView({behavior:'smooth'});return}
  if(d.print){window.print();return}
  if(d.ft){const f=$('#filters');if(f)f.classList.toggle('show');return}
  if(d.rmsusi){plan.susi.splice(+d.rmsusi,1);save();render();return}
  if(d.rmj){delete plan.jungsi[d.rmj];save();render();return}
  if(d.clearplan){if(confirm('지원 플랜을 모두 비울까요?')){plan={susi:[],jungsi:{}};save();render()}return}
  if(d.ov){S.ovSort=d.ov;const y=scrollY;render();scrollTo(0,y);return}
});
$('#mbg').addEventListener('click',e=>{if(e.target.id==='mbg')closeM()});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeM();if((e.key===' '||e.key==='Enter')&&e.target.matches&&e.target.matches('.chk li'))e.target.click()});
$('#mtoggle').addEventListener('click',()=>$('#menu').classList.toggle('open'));
$('#hsearch').addEventListener('submit',e=>{e.preventDefault();S.uq=$('#hq').value.trim();go('univ')});
document.querySelector('.logo').addEventListener('click',()=>go('home'));
const tt=$('#totop');addEventListener('scroll',()=>{tt.style.display=scrollY>500?'block':'none'});tt.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));
function fromHash(){const h=decodeURIComponent(location.hash.slice(1)).split('/');if(TABS.some(t=>t[0]===h[0]))S.tab=h[0];if(h[1]&&gById(h[1]))S.gid=h[1]}
addEventListener('hashchange',()=>{const t=S.tab,g=S.gid;fromHash();if(t!==S.tab||g!==S.gid){closeM();render();scrollTo(0,0)}});
(function init(){fromHash();render()})();
