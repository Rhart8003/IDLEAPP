// Only loaded by the test child process. No real accounts, database, or AI calls.
const realFetch=globalThis.fetch;
globalThis.fetch=async(url,opt={})=>{
  if(String(url).startsWith('https://test-supabase.invalid/')){
    if(String(url).endsWith('/auth/v1/user'))return Response.json({id:'test-owner'});
    if(String(url).includes('/rest/v1/assets?'))return Response.json([{id:'test-asset',monetization_status:'waitlist'}]);
    if(String(url).includes('/rest/v1/listings?'))return Response.json([]);
    throw new Error('Unexpected mocked request: '+url);
  }
  return realFetch(url,opt);
};
