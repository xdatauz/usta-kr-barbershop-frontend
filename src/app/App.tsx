import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProviders } from "./providers";
import AppRouter from "./router";

const queryClient = new QueryClient();

const App = () => {
	return (
		<AppProviders>
			<QueryClientProvider client={queryClient}>
				<AppRouter />
			</QueryClientProvider>
		</AppProviders>
	);
};

export default App;
