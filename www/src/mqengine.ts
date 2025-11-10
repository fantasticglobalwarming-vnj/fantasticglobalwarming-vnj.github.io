export interface QPairs {
    question : string;
    answers : string[];
    correctAnswers : string[];
};

export interface Messages {
    title : string;
    message : string;
}

export type Prompts = QPairs | Messages;



export class MQEngineError extends TypeError {};


export class MQEngine {
    #parser : DOMParser;
    
    #configDOM : Document | undefined;
    #questionaires : Prompts[];

    constructor() {
        this.#parser = new DOMParser();
        this.#configDOM = undefined;
        this.#questionaires = [];
    }

    load(source : string) {
        let dom = this.#parser.parseFromString(source, "application/xml");
        if(dom.querySelector("parsererror")) throw new MQEngineError("Not a valid MQEngine configuration!");

        this.#configDOM = dom;
    }



    #parseQuestions(question : Element) {
        let qprompt = question.getAttribute("question") ?? "";

        let Answers : string[] = [];
        { // Fetch all answers
            let eAnswers = question.getElementsByTagName("answer");

            if(eAnswers.length < 1) throw new MQEngineError("No answers were provided!!!");

            for(const answer of eAnswers) {
                Answers.push(answer.textContent);
            }
        }

        let cAnswers : string[] = [];
        { // Fetch correct answers
            let eAnswers = question.getElementsByTagName("correct-answer");
            
            if(eAnswers.length < 1) throw new MQEngineError("No correct answers were provided!!!");

            for(const answer of eAnswers) {
                cAnswers.push(answer.textContent);
            }
        }

        // Check for correct answers that aren't an option
        {
            
        }

        let qpair : QPairs = {
            question: qprompt,
            answers: Answers,
            correctAnswers: cAnswers
        };
        this.#questionaires.push(qpair);
    }

    #parseMessages(msg : Element) {
        let Title = msg.getAttribute("title") ?? "";

        let message = msg.textContent;

        let dmesg : Messages = {
            title: Title,
            message: message
        };

        this.#questionaires.push(dmesg);
    }

    parse() {
        let root : HTMLCollectionOf<Element> | undefined = this.#configDOM?.children;
        let components : HTMLCollectionOf<Element> | undefined = root?.[0].children || document.createElement('div').children;

        for(const comp of (components || [])) {
            if(comp.tagName == "question") {
                this.#parseQuestions(comp);
            }
            else if(comp.tagName == "prompt") {
                this.#parseMessages(comp);
            }
            else {
                throw new MQEngineError(`Unknown quiz slide: ${comp.tagName}`);
            }
        }
    }

    [Symbol.iterator]() : Iterable<Prompts> | null {
        // TODO: Implmenet the iterable protocol
        return this.#questionaires[Symbol.iterator]();
    }
};
