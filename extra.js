const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Օգտագործել CORS, եթե դուք օգտագործում եք տարբեր ինստանցիաներ

const app = express();
const PORT = 5000;

const MONGO_URI = "mongodb+srv://narek-013:narek13@cluster0.eawd5.mongodb.net/words?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const DataSchema = new mongoose.Schema({}, { strict: false });
const DataModel = mongoose.model("Data", DataSchema);

app.use(cors());
app.use(express.json());

app.get("/api/data", async (req, res) => {
  try {
    const data = await DataModel.find();
    res.json(data); 
  } catch (err) {
    res.status(500).json({ message: "Error fetching data", error: err });
  }
});


app.get("/api/data/:id", async (req, res) => {
  const { id } = req.params; 

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



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
