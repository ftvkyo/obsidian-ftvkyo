import Markdown, { Options } from "react-markdown";

// Disable "p"

const MarkdownWrapper = (opts: Options) => <Markdown
    {...opts}
    disallowedElements={['p']}
    unwrapDisallowed
/>;

export default MarkdownWrapper;
