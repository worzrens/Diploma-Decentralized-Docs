import { create } from "ipfs-http-client";
import concat from "uint8arrays/concat";


const DEFAULT_NETWORK_CONFIG = {
    url: "https://ipfs.infura.io:5001/api/v0",
};

class IPFS {
    _networkConfig;
    constructor({url = "https://ipfs.infura.io:5001/api/v0",} = DEFAULT_NETWORK_CONFIG) {
        this._networkConfig = {
            url,
        };
    }

    async set(file) {
        const node = await create(this._networkConfig);
        const results = await node.add(file);
        return results.path;
    }

    async get(id) {
        const node = await create(this._networkConfig);
        const chunks = [];

        for await (const chunk of node.cat(id)) {
            chunks.push(chunk);
        }
        return concat(chunks);
    }
}

export { IPFS };