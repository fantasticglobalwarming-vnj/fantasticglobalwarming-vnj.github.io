interface QPairs {
    question : string;
    answer : string;
};

export class MQEngine {
    #parser : DOMParser;
    
    #configDOM : Document | undefined;

    constructor() {
        this.#parser = new DOMParser();
        this.#configDOM = undefined;
    }

    load(source : string) {
        let dom = this.#parser.parseFromString(source, "application/xml");
        if(dom.querySelector("parsererror")) throw new TypeError("Not a valid MQEngine configuration!");

        this.#configDOM = dom;
    }

    parse() {

    }
}