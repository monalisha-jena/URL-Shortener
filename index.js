const express = require('express');
const path = require('path');
const {connectToMongoDB} = require("./connect")
const urlRoute = require("./routes/url")
const staticRoute=require("./routes/staticRouter");
const URL=require("./models/url");
const app = express();

const PORT = 8000;

connectToMongoDB('mongodb://localhost:27017/short-url')
.then(() => console.log('MongoDB connected'))
.catch((err) => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
});

app.set("view engine", "ejs");
app.set('views', path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.get("/test", async(req, res)=>{
    const allUrls = await URL.find({});
    return res.render("home", {
        urls: allUrls,
    });
})
app.use("/url", urlRoute);

app.use("/", staticRoute);

app.get("/:shortId", async (req, res) => {
    const shortId= req.params.shortId;
    const entry = await URL.findOneAndUpdate({
        shortId
    }, {
        $push: {
            visitHistory: {
                timestamp: Date.now()
            }
        }
    });
    if (entry && entry.redirectURL) {
        res.redirect(entry.redirectURL);
    } else {
        res.status(404).send('URL not found');
    }
})

app.listen(PORT, () => {console.log(`Server started on port ${PORT}`)})


