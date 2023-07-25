import { usePlugin } from "@/ui/context";

export default function NavView() {
    const { dv, notesSource } = usePlugin();

    const pages = dv.pages(notesSource);

    // TODO: Display a warning if there are notes with the same
    // name in different folders.

    return <div className="view-content">
        <ul>
            {pages.map(page => <li key={page.file.name}>
                <a
                    href={page.file.name}
                    className="internal-link"
                    target="_blank"
                    rel="noopener"
                    aria-label={page.file.name}
                    data-href={page.file.name}
                    data-tooltip-position="top"
                >
                    {page.file.name}
                </a>
            </li>)}
        </ul>
    </div>;
}

NavView.type = "ftvkyo-navigation";
NavView.displayText = "Ftvkyo Navigation";
