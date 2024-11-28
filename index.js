const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Օգտագործել CORS, եթե դուք օգտագործում եք տարբեր ինստանցիաներ

const app = express();
const PORT = 5000;

const MONGO_URI = "mongodb+srv://narek-013:narek13@cluster0.eawd5.mongodb.net/words?retryWrites=true&w=majority";

// Մոնգո կապը
mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Մոդելի սահմանում
const DataSchema = new mongoose.Schema({}, { strict: false }); // JSON թույլ տալու համար
const DataModel = mongoose.model("Data", DataSchema);

// Կարգավորումներ
app.use(cors()); // Անհրաժեշտ է, եթե API-ն և հաճախորդը տարբեր տեղերում են
app.use(express.json()); // Փոխանցում JSON-ի տվյալները

// API ուղի՝ բոլոր տվյալները ստանալու համար
app.get("/api/data", async (req, res) => {
  try {
    const data = await DataModel.find(); // Ստանում ենք բոլոր տվյալները DB-ից
    res.json(data); // Փոխանցում ենք տվյալները որպես JSON
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err });
  }
});

app.post("/api/data/update-word", async (req, res) => {
  const { wordKey, targetKey, newValue } = req.body; // ստացվում է wordKey, targetKey, newValue

  try {
    // Փնտրում ենք տվյալը `wordKey`-ով և փոխում ենք `targetKey`-ի արժեքը
    const updatedData = await DataModel.findOneAndUpdate(
      { [wordKey]: { $exists: true } }, // Փնտրում ենք տվյալը ըստ wordKey (օրինակ՝ 4)
      { $set: { [`${wordKey}.${targetKey}`]: newValue } }, // Փոխում ենք `targetKey`-ի արժեքը
      { new: true } // Վերադարձնում ենք թարմացված տվյալները
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

app.get("/api/data/:id", async (req, res) => {
  const { id } = req.params; // վերցնում ենք id-ը URL-ից

  try {
    // Փնտրում ենք տվյալը, որը համապատասխանում է id-ին, առանց ObjectId օգտագործելու
    const data = await DataModel.findOne({ [`${id}`]: { $exists: true } });

    if (data) {
      // վերադարձնում ենք այն արժեքը, որը գտնվում է տվյալ id-ի տակ
      const result = data[id];

      if (result) {
        res.json(result); // վերադարձնում ենք գտած տվյալը
      } else {
        res.status(404).json({ message: `Data for id ${id} not found` }); // եթե տվյալը չգտնվի
      }
    } else {
      res.status(404).json({ message: "Data not found" }); // եթե տվյալ չի գտնվել
    }
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err });
  }
});

// API-ի սկիզբ
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
