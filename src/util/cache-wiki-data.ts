import puppeteer from "puppeteer";

const allItems = await getItemNames();

async function getItemNames(): Promise<string[]> {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://deadlocked.wiki/Template:Item_Navbox");

    function parseItemName(itemPath) {
        return itemPath
            .replace('/', '')
            .replace("%27", "'")
            .replace('_', ' ');
    }


    const links: string[] = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a[title]'))
            .filter(link =>
                link.getAttribute('title') === link.innerText &&
                !link.getAttribute('class') &&
                link.closest('table')
            )
            .filter((link, index, self) =>
                    index === self.findIndex((t) => (
                        t.getAttribute('href') === link.getAttribute('href')
                    ))
            ).map(link => link.getAttribute('href'))
    );

    await browser.close();
    return links.map((link) => parseItemName(link));
}

export function levenshtein(a: string, b: string): number {
    const an = a ? a.length : 0;
    const bn = b ? b.length : 0;
    if (an === 0) {
        return bn;
    }
    if (bn === 0) {
        return an;
    }
    const matrix = new Array<number[]>(bn + 1);
    for (let i = 0; i <= bn; ++i) {
        let row = matrix[i] = new Array<number>(an + 1);
        row[0] = i;
    }
    const firstRow = matrix[0];
    for (let j = 1; j <= an; ++j) {
        firstRow[j] = j;
    }
    for (let i = 1; i <= bn; ++i) {
        for (let j = 1; j <= an; ++j) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1], // substitution
                    matrix[i][j - 1], // insertion
                    matrix[i - 1][j] // deletion
                ) + 1;
            }
        }
    }
    return matrix[bn][an];
}

function stringSimilarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) {
        return 1.0;
    }
    return (longerLength - levenshtein(longer, shorter)) / parseFloat(longerLength.toString());
}

export function mostSimilarItem(itemName: string): [string, number] {
    let mostSimilar = "";
    let similarity = 0;
    for (const item of allItems) {
        const currentSimilarity = stringSimilarity(itemName.toLowerCase(), item.toLowerCase());
        if (currentSimilarity > similarity) {
            mostSimilar = item;
            similarity = currentSimilarity;
        }
    }
    return [mostSimilar, similarity];
}
