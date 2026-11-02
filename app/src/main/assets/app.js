(()=>{'use strict';
const KEY='hanju-meal-v1',MEALS=['아침','점심','저녁'],DAYS=['월요일','화요일','수요일','목요일','금요일','토요일','일요일'];
const $=id=>document.getElementById(id);const pad=n=>String(n).padStart(2,'0');
function isoLocal(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
function fromISO(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)}
function monday(d){const x=new Date(d.getFullYear(),d.getMonth(),d.getDate(),12);x.setDate(x.getDate()-(x.getDay()+6)%7);return x}
function move(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x}
function validData(v){return v&&typeof v==='object'&&!Array.isArray(v)&&v.weeks&&typeof v.weeks==='object'&&!Array.isArray(v.weeks)}
let data={version:1,weeks:{}},week=isoLocal(monday(new Date())),editing=null,toastTimer,calendarMonth=new Date().getMonth(),calendarYear=new Date().getFullYear();
try{const parsed=JSON.parse(localStorage.getItem(KEY));if(validData(parsed))data=parsed}catch(e){console.warn('저장 기록을 읽지 못했습니다.',e)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(data));return true}catch(e){toast('저장 실패: 브라우저 저장 공간을 확인하세요.');return false}}
function entry(date,meal){return data.weeks[week]?.[date]?.[meal]||null}
function dayRecord(date){return data.weeks[week]?.[date]||{}}
function setDayFlag(date,flag,value){
 if(!data.weeks[week])data.weeks[week]={};
 if(!data.weeks[week][date])data.weeks[week][date]={};
 data.weeks[week][date][flag]=Boolean(value);
 save();render();
}
function toggleSkip(date,value){
 if(!data.weeks[week])data.weeks[week]={};
 if(!data.weeks[week][date])data.weeks[week][date]={};
 const day=data.weeks[week][date];day.breakfastSkipped=Boolean(value);
 if(value && day['아침'])day['아침'].done=false;
 save();render();
}

function setEntry(date,meal,plan,done){if(!data.weeks[week])data.weeks[week]={};if(!data.weeks[week][date])data.weeks[week][date]={};if(plan.trim())data.weeks[week][date][meal]={plan:plan.trim().slice(0,180),done:Boolean(done)};else delete data.weeks[week][date][meal];if(!Object.keys(data.weeks[week][date]).length)delete data.weeks[week][date];if(!Object.keys(data.weeks[week]).length)delete data.weeks[week];save();render()}
function renderCalendar(){
 const first=new Date(calendarYear,calendarMonth,1,12),firstOffset=(first.getDay()+6)%7,last=new Date(calendarYear,calendarMonth+1,0,12).getDate();
 $('monthLabel').textContent=`${calendarYear}년 ${calendarMonth+1}월`;
 const grid=$('calendarGrid');grid.replaceChildren();
 for(let blank=0;blank<firstOffset;blank++){const cell=document.createElement('span');cell.className='calendar-empty';grid.append(cell)}
 for(let number=1;number<=last;number++){
  const d=new Date(calendarYear,calendarMonth,number,12),date=isoLocal(d),weekKey=isoLocal(monday(d)),mealEntries=data.weeks[weekKey]?.[date]||{},items=MEALS.map(name=>({name,item:mealEntries[name]})).filter(x=>!(x.name==='아침'&&mealEntries.breakfastSkipped)&&typeof x.item?.plan==='string'&&x.item.plan.trim()),button=document.createElement('button');
  button.type='button';button.className='calendar-date'+(date===isoLocal(new Date())?' is-today':'')+(weekKey===week?' is-selected':'')+(mealEntries.cheat?' is-cheat':'');
  button.setAttribute('aria-label',`${calendarMonth+1}월 ${number}일, ${items.length}끼 계획, 클릭하여 해당 주 이동`);
  const num=document.createElement('span');num.className='calendar-number';num.textContent=number;button.append(num);
  const list=document.createElement('div');list.className='calendar-meals';
  items.forEach(({name,item})=>{const line=document.createElement('span');line.className='calendar-meal'+(item.done?' checked':'');line.textContent=`${name[0]} ${item.plan.replace(/\s+/g,' ').trim()}`;line.title=`${name}: ${item.plan}${item.done?' (완료)':''}`;list.append(line)});
  button.append(list);
  const flags=document.createElement('div');flags.className='calendar-flags';
  if(mealEntries.cheat){const flag=document.createElement('span');flag.textContent='치팅';flag.className='cheat-marker';flags.append(flag)}
  if(mealEntries.cardio){const flag=document.createElement('span');flag.textContent='🏃';flag.title='유산소';flags.append(flag)}
  if(mealEntries.weights){const flag=document.createElement('span');flag.textContent='🏋';flag.title='웨이트';flags.append(flag)}
  if(mealEntries.breakfastSkipped){const flag=document.createElement('span');flag.textContent='아침×';flag.title='아침 스킵';flags.append(flag)}
  button.append(flags);button.addEventListener('click',()=>{week=weekKey;render();$('weekRange').scrollIntoView({behavior:'smooth',block:'start'});});grid.append(button)
 }
}
function toast(s){const t=$('toast');t.textContent=s;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
function render(){renderCalendar();const start=fromISO(week),end=move(start,6),today=isoLocal(new Date());$('weekRange').textContent=`${start.getFullYear()}.${pad(start.getMonth()+1)}.${pad(start.getDate())} – ${pad(end.getMonth()+1)}.${pad(end.getDate())}`;$('weekStatus').textContent=week===isoLocal(monday(new Date()))?'이번 주 · 날짜를 누르면 이번 주로 이동':'날짜를 누르면 이번 주로 이동';const root=$('days');root.replaceChildren();let total=0,done=0;
DAYS.forEach((day,i)=>{const d=move(start,i),date=isoLocal(d),el=document.createElement('section');el.className='day'+(date===today?' today':'');const head=document.createElement('div');head.className='day-head';const title=document.createElement('div');title.innerHTML=`<span class="day-title">${day}</span><span class="day-date">${pad(d.getMonth()+1)}.${pad(d.getDate())}</span>${date===today?'<span class="today-tag">오늘</span>':''}`;head.append(title);const score=document.createElement('span');score.className='day-progress';head.append(score);el.append(head);let dayTotal=0,dayDone=0;
const flags=document.createElement('div');flags.className='day-flags';
[['cheat','🍰 치팅'],['cardio','🏃 유산소'],['weights','🏋 웨이트']].forEach(([key,label])=>{
 const wrap=document.createElement('label');wrap.className='flag-option'+(dayRecord(date)[key]?' selected':'')+(key==='cheat'?' cheat':'');
 const input=document.createElement('input');input.type='checkbox';input.checked=Boolean(dayRecord(date)[key]);input.addEventListener('change',()=>setDayFlag(date,key,input.checked));
 const name=document.createElement('span');name.textContent=label;wrap.append(input,name);flags.append(wrap);
});el.append(flags);
MEALS.forEach(meal=>{const item=entry(date,meal),skipped=meal==='아침'&&Boolean(dayRecord(date).breakfastSkipped),row=document.createElement('div');row.className='meal-row'+(skipped?' is-skipped':'');const label=document.createElement('span');label.className='meal-label';label.textContent=meal;const plan=document.createElement('button');plan.type='button';plan.className='meal-plan'+(!item?' empty':'')+(item?.done?' complete':'');plan.textContent=skipped?'아침 스킵':(item?.plan||'+ 식단 입력');plan.setAttribute('aria-label',`${day} ${meal} 식단 ${item?'수정':'입력'}`);plan.addEventListener('click',()=>openMeal(date,meal));const check=document.createElement('input');check.type='checkbox';check.className='check';check.checked=Boolean(item?.done);check.disabled=!item||skipped;check.setAttribute('aria-label',`${day} ${meal} 실천 완료`);check.addEventListener('change',()=>setEntry(date,meal,item.plan,check.checked));row.append(label,plan,check);
 if(meal==='아침'){
   const skip=document.createElement('label');skip.className='inline-skip';
   const cb=document.createElement('input');cb.type='checkbox';cb.checked=Boolean(dayRecord(date).breakfastSkipped);
   cb.addEventListener('change',()=>toggleSkip(date,cb.checked));
   const txt=document.createElement('span');txt.textContent='스킵';skip.append(cb,txt);row.append(skip);
 }
 el.append(row);if(item&&!skipped){total++;dayTotal++;if(item.done){done++;dayDone++}}});score.textContent=dayTotal?`${dayDone}/${dayTotal} 완료`:'미작성';root.append(el)});
$('completedCount').innerHTML=`${done}<small> / ${total}</small>`;$('percent').textContent=(total?Math.round(done/total*100):0)+'%';const p=total?Math.round(done/total*100):0;$('progressFill').style.width=p+'%';document.querySelector('.progress').setAttribute('aria-valuenow',String(p));$('summaryHint').textContent=total?`계획한 ${total}끼 중 ${done}끼를 실천했어요.`:'먼저 이번 주 식단을 적어보세요.'}
function openMeal(date,meal){editing={date,meal};const e=entry(date,meal);$('editTitle').textContent=`${DAYS[(fromISO(date).getDay()+6)%7]} · ${meal}`;$('mealText').value=e?.plan||'';$('skipBreakfastLabel').hidden=meal!=='아침';$('skipBreakfast').checked=Boolean(dayRecord(date).breakfastSkipped);$('deleteMeal').style.visibility=e?'visible':'hidden';$('mealDialog').showModal();$('mealText').focus()}
$('mealForm').addEventListener('submit',e=>{e.preventDefault();if(!editing)return;const prev=entry(editing.date,editing.meal);if(editing.meal==='아침'&&$('skipBreakfast').checked){toggleSkip(editing.date,true)}else{if(editing.meal==='아침')toggleSkip(editing.date,false);setEntry(editing.date,editing.meal,$('mealText').value,prev?.done)}$('mealDialog').close();toast('식단을 저장했어요.')});$('closeMeal').onclick=()=>$('mealDialog').close();$('deleteMeal').onclick=()=>{if(!editing)return;setEntry(editing.date,editing.meal,'',false);$('mealDialog').close();toast('계획을 삭제했어요.')};document.querySelectorAll('[data-preset]').forEach(b=>b.addEventListener('click',()=>{$('mealText').value=b.dataset.preset;$('mealText').focus()}));
$('prevMonth').onclick=()=>{const d=new Date(calendarYear,calendarMonth-1,1,12);calendarMonth=d.getMonth();calendarYear=d.getFullYear();renderCalendar()};$('nextMonth').onclick=()=>{const d=new Date(calendarYear,calendarMonth+1,1,12);calendarMonth=d.getMonth();calendarYear=d.getFullYear();renderCalendar()};
$('prevWeek').onclick=()=>{week=isoLocal(move(fromISO(week),-7));render()};$('nextWeek').onclick=()=>{week=isoLocal(move(fromISO(week),7));render()};$('weekLabel').onclick=$('goToday').onclick=()=>{week=isoLocal(monday(new Date()));calendarYear=new Date().getFullYear();calendarMonth=new Date().getMonth();render()};
$('copyPrev').onclick=()=>{const prevKey=isoLocal(move(fromISO(week),-7)),src=data.weeks[prevKey];if(!src||!Object.keys(src).length){toast('지난주에 작성된 식단이 없어요.');return}const dest=data.weeks[week]||{};if(Object.keys(dest).length&&!confirm('이번 주에 작성한 식단이 있어요. 지난주 계획으로 덮어쓸까요?'))return;const copy={};for(let i=0;i<7;i++){const old=src[isoLocal(move(fromISO(prevKey),i))];if(!old)continue;const fresh={};for(const meal of MEALS)if(typeof old[meal]?.plan==='string'&&old[meal].plan.trim())fresh[meal]={plan:old[meal].plan,done:false};if(Object.keys(fresh).length)copy[isoLocal(move(fromISO(week),i))]=fresh}data.weeks[week]=copy;save();render();toast('지난주 계획을 복사했어요. 체크는 초기화됐어요.')};
$('clearChecks').onclick=()=>{const w=data.weeks[week];if(!w||!Object.keys(w).length){toast('초기화할 체크가 없어요.');return}if(!confirm('이번 주 체크만 전부 초기화할까요? 식단 계획은 유지됩니다.'))return;for(const day of Object.values(w))for(const meal of MEALS)if(day[meal])day[meal].done=false;save();render();toast('이번 주 체크를 초기화했어요.')};
$('settingsBtn').onclick=()=>$('settingsDialog').showModal();$('closeSettings').onclick=()=>$('settingsDialog').close();$('exportData').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`한주식단_백업_${isoLocal(new Date())}.json`;document.body.append(a);if(window.AndroidBackup){window.AndroidBackup.save(JSON.stringify(data,null,2),a.download);a.remove();URL.revokeObjectURL(url);toast('백업 파일 저장 위치를 선택하세요.')}else{a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);toast('백업 파일을 만들었어요.')}};
$('importData').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{if(f.size>5_000_000)throw Error('파일 크기가 너무 큽니다.');const p=JSON.parse(await f.text());if(!validData(p)||p.version!==1)throw Error('한주 식단 백업 파일이 아닙니다.');if(!confirm('현재 모든 기록을 백업 파일의 기록으로 바꿀까요?'))return;data=p;save();render();$('settingsDialog').close();toast('기록을 불러왔어요.')}catch(err){alert('불러오기 실패: '+err.message)}finally{e.target.value=''}});
$('wipeData').onclick=()=>{if(!confirm('모든 주의 식단과 체크 기록을 삭제할까요? 복구할 수 없습니다.'))return;data={version:1,weeks:{}};save();render();$('settingsDialog').close();toast('모든 기록을 삭제했어요.')};
render();if('serviceWorker'in navigator && (location.protocol==='https:'||location.hostname==='localhost'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(e=>console.warn('오프라인 설치 실패',e)));
})();
