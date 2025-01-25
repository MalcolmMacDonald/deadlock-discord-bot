import "./chrome-installer.ts"
import {IntentsBitField, Partials} from "discord.js";
import {Client} from "discordx";
import dotenv from "dotenv";
import {dirname, importx} from "@discordx/importer";
import "./commands/items.ts";
import env from "../.env" with {type: "file"};
import {file} from "bun";


export class Main {
    private static _client: Client;

    static get Client(): Client {
        return this._client;
    }

    static async start(): Promise<void> {


        let envFile = await file(env as string);
        let config = dotenv.parse(await envFile.text());
        for (let key in config) {
            process.env[key] = config[key];
        }

        this._client = new Client({
            // botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],
            intents: [
                IntentsBitField.Flags.Guilds,
                IntentsBitField.Flags.GuildMessages,
                IntentsBitField.Flags.GuildMembers,
                IntentsBitField.Flags.GuildMessageReactions,
                IntentsBitField.Flags.MessageContent
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction],
            silent: false,
        });

        this.Client.on("ready", () => {
            console.log("Bot started...");
        });

        await importx(`${dirname(import.meta.url)}/commands/**/*.{js,ts}`);

        // let's start the bot
        if (!process.env.BOT_TOKEN) {
            throw Error("Could not find BOT_TOKEN in your environment");
        }
        await this._client.login(process.env.BOT_TOKEN);

    }
}

await Main.start();