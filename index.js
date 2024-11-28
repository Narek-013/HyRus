const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

const MONGO_URI = "mongodb+srv://narek-013:narek13@cluster0.eawd5.mongodb.net/words?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const DataSchema = new mongoose.Schema({}, { strict: false });
const DataModelRu = mongoose.model("ru", DataSchema);
const DataModelEn = mongoose.model("en", DataSchema);

app.use(cors());
app.use(express.json());

app.get("/api/:lang", async (req, res) => {
  const { lang } = req.params;

  const DataModel = lang === "ru" ? DataModelRu : DataModelEn;

  try {
    const data = await DataModel.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err });
  }
});

app.get("/api/:lang/:id", async (req, res) => {
  const { lang, id } = req.params; 

  const DataModel = lang === "ru" ? DataModelRu : DataModelEn;

  try {
    const data = await DataModel.findOne({ [`${id}`]: { $exists: true } }); 

    if (data) {
      const result = data[id];
      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ message: `Data for id ${id} not found` });
      }
    } else {
      res.status(404).json({ message: "Data not found" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err });
  }
});

app.post("/api/:lang/update-word", async (req, res) => {
  const { lang } = req.params;
  const { wordKey, targetKey, newValue } = req.body;

  
  const DataModel = lang === "ru" ? DataModelRu : DataModelEn;

  try {
    const updatedData = await DataModel.findOneAndUpdate(
      { [wordKey]: { $exists: true } },
      { $set: { [`${wordKey}.${targetKey}`]: newValue } },
      { new: true }
    );

    if (updatedData) {
      res.json({ message: "Word updated successfully", data: updatedData });
    } else {
      res.status(404).json({ message: "Object not found" });
    }
  } catch (err) {
    console.error("Error updating word:", err);
    res.status(500).json({ message: "Error updating word", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
