import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProviders } from "./providers";
import { AppRouter } from "./router";

const queryClient = new QueryClient();

export default function App() {
	return (
		<AppProviders>
			<QueryClientProvider client={queryClient}>
				<BrowserRouter>
					<AppRouter />
				</BrowserRouter>
			</QueryClientProvider>
		</AppProviders>
	);
}
