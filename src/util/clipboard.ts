export async function toClipboard(text: string) {
    await navigator.clipboard.writeText(text);
}
