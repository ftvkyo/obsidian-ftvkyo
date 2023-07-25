function generateColors() {
    const colors = [];

    for (let hue = 0; hue < 20; hue++) {
        colors.push(`hsl(${hue * 18}deg, 100%, 70%)`);
    }

    return colors;
}


const colors = generateColors();


export class Logger {
    static colorCounter = 0;

    constructor(
        readonly prefix: string,
        readonly style?: string,
    ) {
        if (!this.style) {
            const color = colors[Logger.colorCounter % colors.length];
            Logger.colorCounter += 1;
            this.style = `font-weight: bold; color: black; background-color: ${color};`;
        }
    }

    private log(
        text: string,
        textStyle: string = ";",
    ) {
        const pfx = `%c ${this.prefix} %c ${text}`;
        console.log(pfx, this.style, textStyle);
    }

    muted(
        text: string,
    ) {
        this.log(text, "color: #888888;");
        return this;
    }

    info(
        text: string,
    ) {
        this.log(text);
        return this;
    }

    big(
        text: string,
    ) {
        this.log(text, "font-size: 1.5em;");
        return this;
    }

    // Create a sub-logger
    sub(
        prefix: string = ""
    ) {
        if (prefix) {
            prefix = `${this.prefix} > ${prefix}`;
            return new Logger(prefix);
        } else {
            prefix = `${this.prefix} ->`;
            return new Logger(prefix, this.style);
        }
    }
}

const logger = new Logger("ftvkyo");
export default logger;
