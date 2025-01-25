import {browserExecutable} from "../chrome-installer.ts";
import {ArgsOf, Client, Discord, Guard, On} from "discordx";
import {NotBot} from "@discordx/utilities";
import puppeteer from "puppeteer";
import type {MessageReplyOptions} from "discord.js";
import {MessageFlagsBitField} from "discord.js";
import {mostSimilarItem} from "../fetch-all-items";


const itemNameDelimRegex = /\[\[(.*?)\]\]/g;
const capitalizeLetterRegex = /(?<!')(?:\b|(?<=_))\w/g;

const browser = await puppeteer.launch({executablePath: browserExecutable});

enum WikiResponse {
    Error = "Error"
}

interface ItemData {
    buffer: Buffer;
    pageURLName: string;
    itemURL: string;
    prettyName: string;
}

function getItemURL(fullItemName: string): string {
    let itemPath = fullItemName
        .replace('\'', '%27')
        .replace(capitalizeLetterRegex, (char) => char.toUpperCase())
        .replace(' ', '_');
    return `https://deadlocked.wiki/${itemPath}`;
}

function getPrettyItemName(fullItemName: string): string {
    return fullItemName.replace(capitalizeLetterRegex, (char) => char.toUpperCase())
}


async function itemBoxScreenshot(fullItemName: string): Promise<ItemData | WikiResponse> {

    const itemURL = getItemURL(fullItemName);
    const prettyName = getPrettyItemName(fullItemName);
    const page = await browser.newPage();
    await page.goto(itemURL);
    const selector = '.infobox_item';
    const infobox = await page.$(selector);
    if (!infobox) {
        return WikiResponse.Error;
    }
    const buffer = Buffer.from(await infobox.screenshot());
    await page.close();
    return {buffer: buffer, pageURLName: fullItemName, itemURL: itemURL, prettyName: prettyName};
}


@Discord()
export class Items {
    @On({event: "messageCreate"})
    @Guard(NotBot)
    async onMessage([message]: ArgsOf<"messageCreate">, client: Client) {


        const matches = message.content.match(itemNameDelimRegex);
        if (!matches) {
            return;
        }


        let itemNames = matches.map((match) => match.slice(2, -2));
        for (let i = 0; i < itemNames.length; i++) {
            itemNames[i] = mostSimilarItem(itemNames[i])[0];
        }

        const initialReply = await message.reply({
            content: `Fetching ${itemNames.join(", ")}...`,
            flags: MessageFlagsBitField.Flags.ephemeral | MessageFlagsBitField.Flags.loading
        });

        const attemptedItems = await Promise.all(itemNames.map(itemBoxScreenshot));
        const successfulItems = attemptedItems.filter((item) => item !== WikiResponse.Error) as ItemData[];


        if (successfulItems.length === 0) {
            await initialReply.edit({
                content: "No items found",
                flags: MessageFlagsBitField.Flags.ephemeral
            });
            return;
        }
        await initialReply.delete();

        for (const item of successfulItems) {
            const file = {
                attachment: item.buffer,
                name: `${item.pageURLName}.png`
            }
            const content = `[**${getPrettyItemName(item.prettyName)}**](<${getItemURL(item.pageURLName)}>)`;
            const messageReplyOptions: MessageReplyOptions = {
                files: [file],
                embeds: [],
                content: content
            }
            await message.reply(messageReplyOptions);
        }
    }
}