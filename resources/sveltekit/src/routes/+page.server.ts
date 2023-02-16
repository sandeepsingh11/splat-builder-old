import type { PageServerLoad } from "./$types";
import { LeannyService } from "../lib/LeannyService";

export const load = (async (request) => {
    const ls = new LeannyService();
    const result = ls.calcSsu();

    const res = await request.fetch(`http://127.0.0.1:8000/api/test`);
    // const res = await fetch(`http://127.0.0.1:8000/api/test`);
    
    const data = await res.json();

    return {result};
}) satisfies PageServerLoad;