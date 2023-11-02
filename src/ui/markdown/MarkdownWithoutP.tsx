import Markdown, { Options } from "react-markdown";

const MarkdownWithoutP = (opts: Options) => <Markdown
    {...opts}
    disallowedElements={['p']}
    unwrapDisallowed
/>;

export default MarkdownWithoutP;
