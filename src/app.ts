import express from "express";
import bodyParser from "body-parser";
import ethersRoutes from "./routes/ethersRoutes";
import { errorHandler } from "./middlewares/errorHandlerMiddleware";
import credentialManagerRoutes from "./routes/credentialManagerRoutes";

const app = express();
app.use(bodyParser.json());

// Use the credential namager and ethers routes
app.use("/api", credentialManagerRoutes);
app.use("/api", ethersRoutes);

// Centralized error handler
app.use(errorHandler);

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
