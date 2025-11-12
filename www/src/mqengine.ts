class QPairs {
    question : string;
    answers : string[];
    correctAnswers : string[];

    constructor({question = "", answers = [""], correctAnswers = [""]}) {
        this.question = question;
        this.answers = answers;
        this.correctAnswers = correctAnswers;
    }
};

class Messages {
    title : string;
    message : string;

    constructor({title = "", message = ""}) {
        this.title = title;
        this.message = message;
    }
}

type Prompts = QPairs | Messages;



class MQEngineError extends TypeError {};


class MQEngine {
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
            const uCAnswers = cAnswers.filter(item => !Answers.includes(item));
            if(uCAnswers.length > 0) throw new MQEngineError(`Found unlisted correct answers: ${uCAnswers}`);
        }

        let qpair : QPairs = new QPairs({
            question: qprompt,
            answers: Answers,
            correctAnswers: cAnswers
        });
        this.#questionaires.push(qpair);
    }

    #parseMessages(msg : Element) {
        let Title = msg.getAttribute("title") ?? "";

        let message = msg.textContent;

        let dmesg : Messages = new Messages({
            title: Title,
            message: message
        });

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

export {
    QPairs,
    Messages,
    type Prompts,
    MQEngineError,
    MQEngine
}
