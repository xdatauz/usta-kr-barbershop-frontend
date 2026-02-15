import Services from "../Services";


const HomePage = () => {
	return (
		<main className="w-full text-black bg-gray-100">
			{/* Hero Section */}
			<section className="relative h-screen flex flex-col justify-center items-center bg-black text-white px-6 text-center">
				<h1 className="text-5xl sm:text-6xl font-bold mb-4 tracking-wide">
					Welcome to <span className="text-green-700">USTA Barber</span>
				</h1>
				<p className="text-lg sm:text-xl max-w-2xl mb-6">
					Premium haircuts, beard styling, and professional grooming services.
				</p>
				<a
					href="/contact"
					className="bg-green-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-800 transition"
				>
					Book an Appointment
				</a>
			</section>

			{/* Services Section */}
			<section className="py-20 px-6 max-w-7xl mx-auto">
				<Services/>
			</section>

			{/* CTA Section */}
			<section className="py-20 px-6 bg-black text-white text-center">
				<h2 className="text-3xl font-bold mb-4">Ready for a fresh look?</h2>
				<p className="mb-6">Book your appointment today and experience premium grooming services.</p>
				<a
					href="/contact"
					className="bg-green-700 text-white px-6 py-3 rounded-md font-semibold hover:bg-green-800 transition"
				>
					Book Now
				</a>
			</section>
		</main>
	);
};

export default HomePage;
