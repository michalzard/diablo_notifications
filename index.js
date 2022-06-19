import puppeteer from "puppeteer";
import Audic from "audic";

const notificationSound = new Audic("cain.wav");
const targetURL="https://www.diablotimer.com/";


async function checkForUpdates() {
  
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  console.log(`Wait until bot reaches ${targetURL}`);
  await page.goto(`${targetURL}`, {
    waitUntil: "networkidle0",
  })
  .catch(err=>console.log(err));
  

  const timerEl = await page.$$(
    `#comp-l4dw9tmu4__b5a0bb60-3996-4bff-adba-2645b2f4d7a3 > p`
  );
  const txtEl = await page.$$(
    `#comp-l45t0tzu1__b5a0bb60-3996-4bff-adba-2645b2f4d7a3 > div:nth-child(2)>div>div:nth-child(8)>h1>span>span>span`
  );

  const text = await (await txtEl[0].getProperty("textContent")).jsonValue();
  const timer = await (await timerEl[0].getProperty("textContent")).jsonValue();

  //cooldown
  let minutes = parseInt(
    timer.trim().length > 3
      ? timer.trim().split(" ")[1].split("m")[0]
      : timer.trim().split("m")[0]
  ); //Minutes
  let hours = parseInt(
    timer.trim().length > 3 ? timer.trim().split("h")[0] : "0"
  ); //Hour

  const m = 1000 * 60; // 1 minute in milliseconds
  const h = 1000 * 60 * 60; // 1 hour in milliseconds

  console.log(`[Debug]: ${hours}h ${minutes}m remaining`);
  let handleNotifications = setTimeout(async () => {
    console.log(`[Timeout] ${hours}h,${minutes} remaining`);
    await notificationSound.play(); // plays sound when new bg starts

    clearTimeout(handleNotifications); //removes old timeout
    //sets new timeout with
    if (handleNotifications) {
      handleNotifications = setTimeout(async () => {
        await page.goto("https://www.diablotimer.com/", {
          waitUntil: "networkidle0",
        });

        const timerEl = await page.$$(
          `#comp-l4dw9tmu4__b5a0bb60-3996-4bff-adba-2645b2f4d7a3 > p`
        );
        const timer = await (
          await timerEl[0].getProperty("textContent")
        ).jsonValue();
        //UPDATE CURRENT MINUTES AND HOURS FOR TIMEOUT
        minutes = parseInt(
          timer.trim().length > 3
            ? timer.trim().split(" ")[1].split("m")[0]
            : timer.trim().split("m")[0]
        ); //Minutes
        hours = parseInt(
          timer.trim().length > 3 ? timer.trim().split("h")[0] : "0"
        ); //Hour

        console.log(`[Timeout] ${hours}h,${minutes} remaining`);
        await notificationSound.play(); // plays sound when new bg starts
        clearTimeout(handleNotifications);
      }, h * hours + m * minutes);
    }
  }, h * hours + m * minutes);
}

checkForUpdates();
