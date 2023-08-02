import { getColor } from "@/util/colors";


export default class Logger {
    // How many loggers have been created and used
    private static loggerCounter = 0;

    // Color of the current logger
    private color: number;

    constructor(
        readonly name: string,
        color?: number,
    ) {
        this.color = color ?? Logger.loggerCounter++;
    }

    // Get the style of the current logger
    private style() {
        return `font-weight: bold; color: black; background-color: ${getColor(this.color)};`
    }

    // Log a message, optionally using custom style for the message
    private log(
        message: string,
        messageStyle: string = ";",
    ) {
        const text = `%c ${this.name} %c ${message}`;
        console.log(text, this.style(), messageStyle);
        return this;
    }

    clear() {
        console.clear();
        return this;
    }

    info(
        text: string,
    ) {
        return this.log(text);
    }

    muted(
        text: string,
    ) {
        return this.log(text, "color: #888888;");
    }

    big(
        text: string,
    ) {
        return this.log(text, "font-size: 1.5em;");
    }

    // Create a sub-logger
    sub(
        name: string,
    ) {
        return new Logger(`${this.name} > ${name}`);
    }

    // Create a sub-logger of the same color
    subSame(
        name: string,
    ) {
        return new Logger(`${this.name} > ${name}`, this.color);
    }
}
