export const u = undefined;


//const notesSource = `"notes"`;
//const seriesPrefix = "#s/";
//const specialTags = {
//    "#draft": "Drafts",
//    "#public": "Publications",
//    "#fixme": "Fix these",
//    "#le": "Loose ends (TODO collect explanation)",
//};


/*

    // My functions

    async updateAndRender(container: Element) {
        const allNotes = this.dv.api.pages(notesSource);
        const allTags = allNotes.file.tags;

        const series: Record<string, number> = {};
        for (const tag of allTags) {
            if (tag.startsWith(seriesPrefix)) {
                const s = tag.substring(3);
                series[s] = series[s] ? series[s] + 1 : 1;
            }
        }
        const seriesAlphabetical = Object.entries(series).sort((a, b) => a[0].localeCompare(b[0]));

        container.createEl("h2", {text: "By series"});
        for (const [s] of seriesAlphabetical) {
            const links = await this.plist(seriesPrefix + s);
            this.renderDetails(container, s, links);
        }

        container.createEl("h2", {text: "With special tags"});
        for (const [tag, name] of Object.entries(specialTags)) {
            const links = await this.plist(tag);
            this.renderDetails(container, name, links);
        }
    }

    // HELPERS

    // Link that uses the title of the file
    async tlink(page: any) {
        const file = page.file;
        // We want to pick up titles from the first (and hopefully only) h1
        // in the file.

        const title = getTitleByAbsolutePath(this.plugin, file.path) || file.name;

        // Create the link
        return this.dv.api.fileLink(file.path, false, title);
    }

    // List of links to pages matching a query, sorted by filename, descending and
    // using embedded file titles.
    async plist(query: string) {
        const source = `${query} and ${notesSource}`;
        const pagesRaw = this.dv.api.pages(source);
        const pages = pagesRaw.sort((e: any) => e.file.name, "desc");
        const links = await Promise.all(pages.map((p: any) => this.tlink(p)));

        return links;
    }

    // Convert Link into an html <a> element
    htmlLink(link: any) {
        const a = document.createElement("a");
        a.href = link.path;
        a.innerText = link.display;
        a.classList.add("internal-link");
        a.target = "_blank";
        a.rel = "noopener";
        return a;
    }

    // Render a list of links, but hidden in <details>.
    // The summary says the number of links in the list.
    async renderDetails(c: Element, name: string, links: any[]) {
        const d = c.createEl("details");

        const n = document.createElement("strong");
        n.innerText = name;

        const s = d.createEl("summary");
        s.style.userSelect = "none";
        s.appendChild(n);
        s.appendChild(document.createTextNode(`: ${links.length}`));

        const list = d.createEl("ul");
        for (const link of links) {
            const li = list.createEl("li");
            li.appendChild(this.htmlLink(link));
        }
    }
}

*/
