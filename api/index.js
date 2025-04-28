import express from "express";
import cors from "cors";
import gplay from "google-play-scraper";

const app = express();

const corsOptions = {
  //   origin: "https://syr-edu.com",
  origin: "*",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.get("/api/app-details", async (req, res) => {
  const playStoreUrl = req.query.url;

  if (!playStoreUrl) {
    return res.status(400).json({ error: "Google Play URL is required" });
  }

  let appId;
  try {
    const parsedUrl = new URL(playStoreUrl);
    appId = parsedUrl.searchParams.get("id");
    if (!appId) {
      throw new Error("App ID not found in URL");
    }
  } catch (e) {
    console.error("Error parsing URL:", e);
    return res.status(400).json({ error: "Invalid Google Play URL format" });
  }

  try {
    console.log(`Workspaceing details for appId: ${appId}`);
    const appDetails = await gplay.app({ appId: appId });

    const responseData = {
      title: appDetails.title,
      description: appDetails.description,
      descriptionHTML: appDetails.descriptionHTML,
      screenshots: appDetails.screenshots,
      scoreText: appDetails.scoreText,
      genre: appDetails.genre,
      url: appDetails.url,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.error(`Error fetching app details for ${appId}:`, error);
    // التعامل مع أخطاء شائعة من المكتبة
    if (
      (error.message && error.message.includes("App not found")) ||
      error.message.includes("404")
    ) {
      res.status(404).json({ error: "App not found on Google Play." });
    } else {
      res.status(500).json({ error: "Failed to fetch app details." });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
