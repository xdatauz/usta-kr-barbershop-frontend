import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./app/App";
import { AppProviders } from "./app/providers";

import "./index.css";
import "./styles/global.css";
import "react-toastify/dist/ReactToastify.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<BrowserRouter>
			<AppProviders>
				<HelmetProvider>
					<App />
				</HelmetProvider>
			</AppProviders>
		</BrowserRouter>
	</React.StrictMode>,
);
