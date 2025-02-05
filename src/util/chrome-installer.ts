import {Browser, BrowserPlatform, getInstalledBrowsers, install, InstallOptions} from "@puppeteer/browsers";


const installOptions: InstallOptions = {
    cacheDir: "./chrome-cache",
    browser: Browser.CHROME,
    buildId: "132.0.6834.110",
    platform: BrowserPlatform.WIN32
};

async function getBrowserExecutablePath(): Promise<string> {

    const foundBrowsers = await getInstalledBrowsers(installOptions);
    if (foundBrowsers.length > 0) {
        return foundBrowsers[0].executablePath;
    }
    console.log("No browsers found, installing...");
    const installedBrowser = await install(installOptions);
    return installedBrowser.executablePath;
}

process.env.PUPPETEER_EXECUTABLE_PATH = await getBrowserExecutablePath();
