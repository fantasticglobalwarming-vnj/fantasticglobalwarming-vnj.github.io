class QPairs {
    question : string;
    answers : string[];
    correctAnswers : string[];

    answerMap : Record<string, boolean>;

    constructor({question = "", answers = [""], correctAnswers = [""], answerMap = {}} : QPairs) {
        this.question = question;
        this.answers = answers;
        this.correctAnswers = correctAnswers;
        this.answerMap = answerMap;
    }
};

class Messages {
    title : string;
    message : string;

    constructor({title = "", message = ""} : Messages) {
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

    #modtitle : String | null;
    #moddesc : String | null;

    constructor() {
        this.#parser = new DOMParser();
        this.#configDOM = undefined;
        this.#questionaires = [];

        this.#modtitle = null;
        this.#moddesc = null;
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

        let AnswerMap : Record<string, boolean> = {};
        { // Construct a mapping
            for(const answer of Answers) {
                AnswerMap[answer] = cAnswers.includes(answer);
            }
        }

        let qpair : QPairs = new QPairs({
            question: qprompt,
            answers: Answers,
            correctAnswers: cAnswers,
            answerMap: AnswerMap

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
        let rootNode : ParentNode = root?.[0] || document.createElement("div");
        let components : HTMLCollectionOf<Element> | undefined = rootNode.children;

        this.#modtitle = (rootNode as Element).getAttribute("title")

        for(const comp of (components || [])) {
            if(comp.tagName == "question") {
                this.#parseQuestions(comp);
            }
            else if(comp.tagName == "prompt") {
                this.#parseMessages(comp);
            }
            else if(comp.tagName == "description") {
                if(this.#moddesc) throw new MQEngineError("Duplicate Descriptions!");

                this.#moddesc = comp.textContent;
            }
            else {
                throw new MQEngineError(`Unknown quiz slide: ${comp.tagName}`);
            }
        }
    }


    getInfo() : [String | null, String | null] {
        return [this.#modtitle, this.#moddesc];
    }

    [Symbol.iterator]() : Iterable<[number, Prompts]> | null {
        // TODO: Implmenet the iterable protocol
        return this.#questionaires.entries();
    }
};

export {
    QPairs,
    Messages,
    type Prompts,
    MQEngineError,
    MQEngine
}
