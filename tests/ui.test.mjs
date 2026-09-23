import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
const markup=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const script=await readFile(new URL('../public/app.js',import.meta.url),'utf8');
const tick=()=>new Promise(resolve=>setTimeout(resolve,15));
async function fixture({signedIn=false,assets=[],assetError=false,apiError=false,expired=false}={}){
  const dom=new JSDOM(markup.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g,''),{url:'https://idle.test',runScripts:'outside-only'});
  const w=dom.window;w.scrollTo=()=>{};w.Headers=Headers;w.FormData=FormData;w.IDLE_CONFIG={supabaseUrl:'https://test.invalid',supabaseKey:'test'};
  let calls=0,authHandler;
  const userSession={access_token:'test-refreshed-token',user:{id:'owner',email:'tester@example.test'}};
  w.supabase={createClient:()=>({
    auth:{
      onAuthStateChange:handler=>{authHandler=handler},
      getSession:async()=>({data:{session:signedIn&&(!expired||calls++===0)?userSession:null}}),
      signOut:async()=>{authHandler('SIGNED_OUT',null);return {error:null}}
    },
    from:()=>({select:()=>({order:async()=>({data:assets,error:assetError?{message:'offline'}:null})})})
  })};
  const requests=[];
  w.fetch=async(url,opt)=>{requests.push({url,opt});if(url==='/api/bootstrap')return {ok:true,json:async()=>({feeRate:.12,plusPrice:9.99})};return {ok:!apiError,status:apiError?502:200,json:async()=>apiError?{error:'Marketplace unavailable'}:[]}};
  w.eval(script);await tick();return {dom,w,requests,close:()=>w.close()};
}
test('signed-out overview is informative and all five navigation destinations are present',async()=>{const f=await fixture();try{assert.match(f.w.document.querySelector('h1').textContent,/less idle/);assert.equal(f.w.document.querySelectorAll('[data-nav]').length,5);assert.equal(f.w.document.querySelectorAll('form[data-form="auth"]').length,1);f.w.document.querySelector('[data-nav="scan"]').click();await tick();assert.equal(f.w.document.getElementById('page-name').textContent,'My account')}finally{f.close()}});
test('saved item content is escaped rather than executed or rendered as HTML',async()=>{const f=await fixture({signedIn:true,assets:[{id:'safe',title:'<img src=x onerror="alert(1)">',category:'<script>attack</script>',value_estimate:100,rental_rate:10,idle_score:60,status:'owned'}]});try{assert.equal(f.w.document.querySelectorAll('.asset-card img,.asset-card script').length,0);assert.match(f.w.document.querySelector('.asset-card h3').textContent,/<img src=x/);f.w.document.querySelector('[data-action="putToWork"]').click();await tick();assert.match(f.w.document.querySelector('h1').textContent,/<img src=x/);assert.equal(f.w.document.querySelectorAll('#view img,#view script').length,0)}finally{f.close()}});
test('failed portfolio load is not misrepresented as an empty portfolio',async()=>{const f=await fixture({signedIn:true,assetError:true});try{assert.match(f.w.document.getElementById('view').textContent,/saved items have not been cleared/);assert.doesNotMatch(f.w.document.getElementById('view').textContent,/collection starts with one thing/)}finally{f.close()}});
test('marketplace API errors produce a retry screen instead of a map crash',async()=>{const f=await fixture({signedIn:true,apiError:true});try{f.w.document.querySelector('[data-nav="market"]').click();await tick();assert.match(f.w.document.getElementById('view').textContent,/Marketplace unavailable/);assert.ok(f.w.document.querySelector('#view [data-action="market"]'))}finally{f.close()}});
test('API requests use the current auth session',async()=>{const f=await fixture({signedIn:true});try{f.w.document.querySelector('[data-nav="market"]').click();await tick();const r=f.requests.find(x=>x.url==='/api/listings');assert.equal(r.opt.headers.get('Authorization'),'Bearer test-refreshed-token')}finally{f.close()}});
test('expired session leads to sign-in instead of a broken marketplace',async()=>{const f=await fixture({signedIn:true,expired:true});try{f.w.document.querySelector('[data-nav="market"]').click();await tick();assert.equal(f.w.document.getElementById('page-name').textContent,'My account');assert.equal(f.requests.filter(x=>x.url==='/api/listings').length,0)}finally{f.close()}});
test('vehicle portfolio items show future-category notice instead of publishing controls',async()=>{const f=await fixture({signedIn:true,assets:[{id:'boat',title:'Boat',category:'Boat',asset_class:'vehicle',monetization_status:'waitlist',status:'owned'}]});try{f.w.document.querySelector('[data-action="putToWork"]').click();await tick();assert.match(f.w.document.getElementById('view').textContent,/not enabled in the private beta/);assert.equal(f.w.document.querySelector('[data-action="rentAsset"]'),null)}finally{f.close()}});
