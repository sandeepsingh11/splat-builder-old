import type { PageServerLoad } from "./$types";

export const load = (async (request) => {
    const res = await request.fetch(`http://127.0.0.1:8001/api/test`);
    // const res = await fetch(`http://127.0.0.1:8000/api/test`);
    
    const data = await res.json();
    console.log(data);
  

    // let test = {
    //     name: 'Bob',
    //     username: 'bobby'
    // }

    return data;
}) satisfies PageServerLoad;