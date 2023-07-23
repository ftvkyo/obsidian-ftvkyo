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
        readonly style: string = "",
    ) {
        if (!style) {
            const color = colors[Logger.colorCounter % colors.length];
            style = `font-weight: bold; color: black; background-color: ${color};`;
            Logger.colorCounter += 1;
        }

        this.muted(`[logger created]`);
    }

    private log(
        text: string,
        textStyle?: string,
    ) {
        const pfx = `%c ${this.prefix} `;
        if (textStyle) {
            console.log(`${pfx}%c ${text}`, this.style, textStyle);
        } else {
            console.log(pfx, this.style, text);
        }
    }

    muted(
        text: string,
    ) {
        this.log(text, "color: #AAA;");
        return this;
    }

    info(
        text: string,
    ) {
        this.log(text);
        return this;
    }

    // Create a sub-logger
    sub(
        prefix: string = ""
    ) {
        if (prefix) {
            prefix = `${this.prefix} > ${prefix}`;
        } else {
            prefix = `${this.prefix} ->`;
        }
        return new Logger(prefix, this.style);
    }
}

const logger = new Logger("obsidian-ftvkyo");
export default logger;
