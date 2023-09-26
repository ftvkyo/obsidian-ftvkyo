import sendNotice from "@/ui/builtin/notice";

export async function toClipboard(text: string) {
    await navigator.clipboard.writeText(text);
    sendNotice(`Copied "${text}" to clipboard.`);
}
