import {Browser, BrowserPlatform, getInstalledBrowsers, install, InstallOptions} from "@puppeteer/browsers";

const installOptions: InstallOptions = {
    cacheDir: "./chrome-cache",
    browser: Browser.CHROME,
    buildId: "132.0.6834.110",
    platform: BrowserPlatform.WIN32
};
const installedBrowsers = await getInstalledBrowsers(installOptions);
if (installedBrowsers.length === 0) {
    console.log("No browsers found, installing...");
    installedBrowsers.push(await install(installOptions));
}
export const browserExecutable = installedBrowsers[0].executablePath;
 
