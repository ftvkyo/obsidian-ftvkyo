import { syntaxTree } from "@codemirror/language";
import { Extension, RangeSetBuilder, StateField, Transaction } from "@codemirror/state";
import { Decoration, DecorationSet, EditorView, WidgetType } from "@codemirror/view";
import { SyntaxNodeRef } from "@lezer/common";

import { formatTimeAsMoment, Time } from "@/util/plan";


/*
 * Check if the line is a valid start for a plan list.
 *
 * Valid matches:
 *
 * "- `@`" -- unknown start time
 * "- `@ 10:30`" -- known start time
 *
 * Can be followed by arbitrary characters.
 * Space between "@" and the time is required.
 */

const RE_START = /^[-]\s`@(?:\s(\d\d):(\d\d))?`/;


export class PlanWidget extends WidgetType {
    toDOM(view: EditorView): HTMLElement {
        const div = document.createElement("span");

        div.innerText = "👉";

        return div;
    }
}


function nodeIs(node: SyntaxNodeRef, what: string): boolean {
    return node.name.split("_").contains(what);
}


export const planListField = StateField.define<DecorationSet>({
    create(state): DecorationSet {
        return Decoration.none;
    },

    update(oldState: DecorationSet, transaction: Transaction): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();

        syntaxTree(transaction.state).iterate({
            enter(node) {
                if (nodeIs(node, "HyperMD-list-line-1")) {
                    const text = transaction.state.sliceDoc(node.from, node.to);
                    const match = text.match(RE_START);

                    if (match) {
                        // Got the match, now check if there is a start time.
                        const start = match[1] && match[2] && { d: 0, h: Number(match[1]), m: Number(match[2]) } || null;
                    }

                    // TODO: figure out how to get the estimation from sublists

                    // TODO: look into SyntaxNode.resolveInner and into SyntaxNode.enter
                }
            }
        });

        return builder.finish();
    },

    provide(field: StateField<DecorationSet>): Extension {
        return EditorView.decorations.from(field);
    },
});
