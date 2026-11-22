/* ============================================================
   app.js  —  المنطق العام للموقع
   ============================================================ */

/* ============ إعدادات البوت ============ */
const TELEGRAM_BOT_TOKEN = "";   // ← ضع توكن البوت هنا
const TELEGRAM_CHAT_ID   = "";   // ← ضع ID المحادثة هنا

/* ============ القائمة المنسدلة ============ */
function toggleMenu(){
  const dd = document.getElementById('dropdown');
  const tg = document.getElementById('menuToggle');
  dd.classList.toggle('open');
  tg.classList.toggle('open');
}
document.addEventListener('click', (e)=>{
  const dd = document.getElementById('dropdown');
  const tg = document.getElementById('menuToggle');
  if(dd.classList.contains('open') && !dd.contains(e.target) && !tg.contains(e.target)){
    dd.classList.remove('open');
    tg.classList.remove('open');
  }
});

/* ============================================================
   بوابة الاشتراك
   - زر "رجعت" مخفي افتراضياً
   - يظهر فقط بعد الضغط على زر "اشترك في يوتيوب"
   ============================================================ */
function onSubscribeClick(){
  // إظهار زر الرجوع بعد ضغط زر الاشتراك
  const enterBtn = document.getElementById('enterBtn');
  if(enterBtn) enterBtn.style.display = 'flex';
}

function enterSite(){
  document.getElementById('gate').classList.add('hidden');
  try{ localStorage.setItem('badboy_entered','1'); }catch(e){}
}

// إذا دخل سابقاً، افتح الموقع مباشرة
try{
  if(localStorage.getItem('badboy_entered') === '1'){
    document.getElementById('gate').classList.add('hidden');
  }
}catch(e){}

/* ============ التنقل بين الأقسام ============ */
function showSection(name){
  document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
  document.getElementById('sec-'+name).classList.add('active');
  document.querySelectorAll('.tab-btn').forEach(b=>{
    b.classList.toggle('active', b.dataset.sec === name);
  });
  document.querySelectorAll('.dropdown a[data-sec]').forEach(a=>{
    a.classList.toggle('active', a.dataset.sec === name);
  });
  document.getElementById('dropdown').classList.remove('open');
  document.getElementById('menuToggle').classList.remove('open');
  window.scrollTo({top:0,behavior:'smooth'});
  return false;
}

/* ============ إرسال التعليق إلى تلجرام ============ */
const commentForm = document.getElementById('commentForm');
commentForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const btn = document.getElementById('cBtn');
  const status = document.getElementById('cMsgStatus');
  const name = document.getElementById('cName').value.trim();
  const msg  = document.getElementById('cMsg').value.trim();

  status.className = 'form-msg';
  status.textContent = '';

  if(!name || !msg){
    status.className = 'form-msg err';
    status.textContent = '⚠️ اكتب اسمك وتعليقك';
    return;
  }
  if(!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID){
    status.className = 'form-msg err';
    status.textContent = '⚠️ إعدادات البوت غير مكتملة';
    return;
  }

  btn.disabled = true;
  const originalHTML = btn.innerHTML;
  btn.textContent = 'جارٍ الإرسال...';

  const text = `💬 تعليق جديد على Badboy\n\n👤 الاسم: ${name}\n📝 التعليق: ${msg}\n🕒 ${new Date().toLocaleString('ar-EG')}`;

  try{
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({chat_id:TELEGRAM_CHAT_ID, text})
    });
    const data = await res.json();
    if(data.ok){
      status.className = 'form-msg ok';
      status.textContent = '✅ تم إرسال تعليقك بنجاح!';
      commentForm.reset();
    }else{
      throw new Error(data.description || 'فشل الإرسال');
    }
  }catch(err){
    status.className = 'form-msg err';
    status.textContent = '❌ حدث خطأ: ' + err.message;
  }finally{
    btn.disabled = false;
    btn.innerHTML = originalHTML;
  }
});

/* ============ عرض البطاقات ============ */
function renderItems(list, gridId, emptyId, iconId){
  const grid = document.getElementById(gridId);
  const empty = document.getElementById(emptyId);
  grid.innerHTML = '';
  if(!list.length){
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.forEach(item=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-img">
        ${item.image
          ? `<img src="${item.image}" alt="${item.title}" onerror="this.parentElement.innerHTML='<svg><use href=&quot;#ic-image&quot;/></svg>'">`
          : `<svg><use href="#${iconId}"/></svg>`}
      </div>
      <div class="card-body">
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.desc}</div>
        <a class="card-btn" href="${item.link}" target="_blank">
          <svg><use href="#ic-external"/></svg>
          فتح
        </a>
      </div>`;
    grid.appendChild(card);
  });
}

/* ============ تهيئة الصفحة ============ */
window.addEventListener('DOMContentLoaded', ()=>{
  // عرض الألعاب
  renderItems(games, 'gamesGrid', 'gamesEmpty', 'ic-gamepad');
  // عرض البرامج
  renderItems(programs, 'programsGrid', 'programsEmpty', 'ic-monitor');
});