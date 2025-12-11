/**
 * Type declarations for Cloudflare HTMLRewriter API
 * Available in Cloudflare Workers runtime (used by Webflow Cloud)
 * 
 * @see https://developers.cloudflare.com/workers/runtime-apis/html-rewriter/
 */

declare class HTMLRewriter {
    constructor();
    on(selector: string, handlers: ElementHandler): HTMLRewriter;
    onDocument(handlers: DocumentHandler): HTMLRewriter;
    transform(response: Response): Response;
}

interface ElementHandler {
    element?(element: Element): void | Promise<void>;
    comments?(comment: Comment): void | Promise<void>;
    text?(text: Text): void | Promise<void>;
}

interface DocumentHandler {
    doctype?(doctype: Doctype): void | Promise<void>;
    comments?(comment: Comment): void | Promise<void>;
    text?(text: Text): void | Promise<void>;
    end?(end: DocumentEnd): void | Promise<void>;
}

interface Element {
    tagName: string;
    readonly attributes: IterableIterator<[string, string]>;
    readonly removed: boolean;
    readonly namespaceURI: string;

    getAttribute(name: string): string | null;
    hasAttribute(name: string): boolean;
    setAttribute(name: string, value: string): Element;
    removeAttribute(name: string): Element;

    before(content: string, options?: ContentOptions): Element;
    after(content: string, options?: ContentOptions): Element;
    prepend(content: string, options?: ContentOptions): Element;
    append(content: string, options?: ContentOptions): Element;
    replace(content: string, options?: ContentOptions): Element;
    setInnerContent(content: string, options?: ContentOptions): Element;
    remove(): Element;
    removeAndKeepContent(): Element;

    onEndTag(handler: (tag: EndTag) => void | Promise<void>): void;
}

interface EndTag {
    name: string;
    before(content: string, options?: ContentOptions): EndTag;
    after(content: string, options?: ContentOptions): EndTag;
    remove(): EndTag;
}

interface Comment {
    text: string;
    readonly removed: boolean;

    before(content: string, options?: ContentOptions): Comment;
    after(content: string, options?: ContentOptions): Comment;
    replace(content: string, options?: ContentOptions): Comment;
    remove(): Comment;
}

interface Text {
    readonly text: string;
    readonly lastInTextNode: boolean;
    readonly removed: boolean;

    before(content: string, options?: ContentOptions): Text;
    after(content: string, options?: ContentOptions): Text;
    replace(content: string, options?: ContentOptions): Text;
    remove(): Text;
}

interface Doctype {
    readonly name: string | null;
    readonly publicId: string | null;
    readonly systemId: string | null;
}

interface DocumentEnd {
    append(content: string, options?: ContentOptions): DocumentEnd;
}

interface ContentOptions {
    html?: boolean;
}
