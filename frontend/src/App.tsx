import { Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Recap from "./pages/Recap";

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Landing />} />
			<Route path="/:username" element={<Dashboard />} />
			<Route path="/:username/recap/:type" element={<Recap />} />
			<Route path="/:username/recap/:type/:year" element={<Recap />} />
		</Routes>
	)
}
