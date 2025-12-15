import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMovies } from '../api/services/movies';
import MovieCard from '../components/MovieCard';
import ScrollReveal from '../components/ScrollReveal';

const MoviesPage = () => {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const [page, setPage] = useState(1);
    const limit = 12;

    const titleQuery = searchParams.get('title');

    useEffect(() => {
        const fetchMovies = async () => {
            setLoading(true);
            try {
                const skip = (page - 1) * limit;
                // Pass titleQuery if it exists
                const params = { limit, skip };
                if (titleQuery) {
                    params.title = titleQuery;
                }

                const data = await getMovies(params);
                setMovies(data);
            } catch (error) {
                console.error("Failed to fetch movies", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, [page, titleQuery]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 border-l-4 border-primary pl-4">All Movies</h1>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                    {[...Array(limit)].map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-surface animate-pulse rounded-xl"></div>
                    ))}
                </div>
            ) : (
                <>
                    {movies.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                            {movies.map((movie, index) => (
                                <ScrollReveal key={movie._id || movie.title} delay={(index % 6) * 100}>
                                    <MovieCard movie={movie} />
                                </ScrollReveal>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            No movies found.
                        </div>
                    )}

                    {/* Simple Pagination */}
                    <div className="flex justify-center mt-12 gap-4">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-6 py-2 bg-surface hover:bg-white/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Previous
                        </button>
                        <span className="flex items-center text-gray-400">Page {page}</span>
                        <button
                            // Disable next not implemented strictly without total count, but generally if < limit returned
                            disabled={movies.length < limit}
                            onClick={() => setPage(p => p + 1)}
                            className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default MoviesPage;
