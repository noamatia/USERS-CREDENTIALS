import express from "express";
import bodyParser from "body-parser";
import credentialManagerRoutes from "./routes/credentialManagerRoutes";

const app = express();
app.use(bodyParser.json());

// Use the credential namager routes
app.use("/api", credentialManagerRoutes);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
