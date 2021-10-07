import { stringify } from "querystring";

export const main = async () => {

    const waitTime = Math.floor(Math.random() * 60);

    return stringify({waitTime: waitTime});
};
