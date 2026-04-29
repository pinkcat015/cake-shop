(async () => {
  const base = 'http://localhost:3000/api';
  const nodeFetch = globalThis.fetch || require('node-fetch');

  const registerBody = { username: 'test_user1', password: '123456', email: 'test_user1@example.com', role_name: 'customer' };
  try {
    let r = await fetch(base + '/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(registerBody) });
    console.log('register', r.status);
    const regText = await r.text(); console.log(regText);
  } catch (e) { console.error('register error', e); }

  try {
    let r = await fetch(base + '/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'test_user1', password: '123456' }) });
    const json = await r.json();
    console.log('login', r.status, json);
    const token = json.token;
    if (!token) return console.error('no token');

    // get some product id
    let p = await fetch(base + '/products');
    const list = await p.json();
    console.log('products count', Array.isArray(list) ? list.length : Object.keys(list).length);
    const prod = Array.isArray(list) ? list[0] : (list.products && list.products[0]);
    if (!prod) return console.error('no product');
    const product_id = prod.product_id || prod.id || prod.productId;
    console.log('using product id', product_id);

    // add to cart
    let add = await fetch(base + '/cart/add', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ product_id, quantity: 2 }) });
    console.log('add status', add.status);
    console.log(await add.json());

    // get cart
    let get = await fetch(base + '/cart', { headers: { 'Authorization': 'Bearer ' + token } });
    console.log('get status', get.status);
    console.log(await get.json());
  } catch (e) { console.error('flow error', e); }
})();
