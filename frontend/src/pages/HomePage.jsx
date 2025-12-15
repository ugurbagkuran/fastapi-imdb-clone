import { useEffect, useState } from 'react';
import { getMovies } from '../api/services/movies';
import { Link } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import ScrollReveal from '../components/ScrollReveal';

const HomePage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                // Fetch more movies to have enough data for sections
                const data = await getMovies({ limit: 50 });
                setMovies(data);
            } catch (error) {
                console.error("Failed to fetch movies", error);
                setMovies([]);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    // Filter movies for sections
    const newReleases = movies.filter(m => m.year >= 2010).sort((a, b) => b.year - a.year).slice(0, 10);
    const classics = movies.filter(m => m.year < 2010).sort((a, b) => b.year - a.year).slice(0, 10);

    // Fallback for trending if not enough data, just take first 10
    const trending = movies.slice(0, 10);

    const MovieSection = ({ id, title, items, delayOffset = 0 }) => (
        <section id={id} className="container mx-auto px-4 mt-12 scroll-mt-24">
            <ScrollReveal delay={delayOffset}>
                <div className="flex justify-between items-end mb-6 border-b border-gray-800 pb-4">
                    <h2 className="text-2xl font-bold border-l-4 border-primary pl-4">{title}</h2>
                    <Link to="/movies" className="text-primary hover:text-white transition-colors text-sm font-medium">View All &rarr;</Link>
                </div>

                {items.length > 0 ? (
                    <div className="flex overflow-x-auto pb-6 gap-6 scrollbar-hide snap-x">
                        {items.map((movie, index) => (
                            <div key={movie._id || movie.title} className="flex-none w-[200px] md:w-[240px] snap-start">
                                <MovieCard movie={movie} />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 italic">No movies available in this category.</div>
                )}
            </ScrollReveal>
        </section>
    );

    return (
        <div className="pb-20">
            {/* Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/50 to-transparent z-10" />
                    <img
                        src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2525&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover opacity-50"
                    />
                </div>

                <div className="container mx-auto px-4 relative z-20 text-center">
                    <ScrollReveal>
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                            Unlimited Movies, <br /> TV Shows, and More.
                        </h1>
                        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                            Discover the latest blockbusters and hidden gems. Your next favorite story is waiting.
                        </p>
                        <Link to="/movies" className="bg-primary text-white px-8 py-3 rounded-full font-semibold text-lg hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(229,9,20,0.5)] active:shadow-none">
                            Start Watching
                        </Link>
                    </ScrollReveal>
                </div>
            </section>

            {loading ? (
                <div className="container mx-auto px-4 mt-12 grid grid-cols-2 md:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-surface animate-pulse rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <>
                    <MovieSection id="new-releases" title="New Releases" items={newReleases} delayOffset={100} />
                    <MovieSection id="trending" title="Trending Now" items={trending} delayOffset={300} />
                    <MovieSection id="classics" title="Classics" items={classics} delayOffset={500} />
                </>
            )}
        </div>
    );
};

export default HomePage;
