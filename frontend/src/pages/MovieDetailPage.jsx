import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovie } from '../api/services/movies';
import { getMovieReviews, createReview } from '../api/services/reviews';
import { useAuth } from '../context/AuthContext';

const MovieDetailPage = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [similarMovies, setSimilarMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const [newReview, setNewReview] = useState({ rating: 10, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!user) return;
        setSubmitting(true);
        try {
            await createReview(id, newReview);
            const reviewsData = await getMovieReviews(id);
            setReviews(reviewsData);
            setNewReview({ rating: 10, comment: '' });
        } catch (error) {
            console.error("Failed to post review", error);
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setSimilarMovies([]);
            try {
                const [movieData, reviewsData] = await Promise.all([
                    getMovie(id),
                    getMovieReviews(id)
                ]);
                setMovie(movieData);
                setReviews(reviewsData);

                if (movieData.similar_movies && movieData.similar_movies.length > 0) {
                    const limitSim = movieData.similar_movies.slice(0, 5);
                    const promises = limitSim.map(simId => getMovie(simId).catch(err => null));
                    const results = await Promise.all(promises);
                    setSimilarMovies(results.filter(m => m !== null));
                }

            } catch (error) {
                console.error("Failed to fetch movie details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // Check if user has already reviewed
    const existingReview = user ? reviews.find(r => r.user_id === user._id || r.user_id === user.id) : null;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 animate-pulse">
                <div className="h-[50vh] bg-surface rounded-3xl mb-8"></div>
                <div className="h-8 w-1/3 bg-surface rounded mb-4"></div>
                <div className="h-4 w-2/3 bg-surface rounded mb-2"></div>
            </div>
        );
    }

    if (!movie) {
        return <div className="text-center py-20">Movie not found</div>;
    }

    return (
        <div>
            {/* Backdrop / Hero */}
            <div className="relative h-[60vh] w-full">
                <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-transparent z-10"></div>
                <img
                    src={movie.poster_url}
                    alt={movie.title}
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 z-20 container mx-auto px-4 pb-12 flex items-end gap-8">
                    <img
                        src={movie.poster_url}
                        alt={movie.title}
                        className="hidden md:block w-48 rounded-lg shadow-2xl border-4 border-white/10"
                    />
                    <div className="mb-4">
                        <h1 className="text-4xl md:text-6xl font-bold mb-2">{movie.title}</h1>
                        <div className="flex items-center gap-4 text-gray-300 text-sm md:text-base">
                            <span>{movie.year}</span>
                            <span>•</span>
                            <span className="text-yellow-500 font-bold">★ {movie.average_rating || movie.rating}</span>
                            <span>•</span>
                            <span>{movie.director}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-4">
                            {movie.genre && movie.genre.map(g => (
                                <span key={g} className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-xs">{g}</span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Plot</h2>
                        <p className="text-gray-300 leading-relaxed text-lg">
                            {movie.description || "No description available."}
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Cast</h2>
                        <div className="flex flex-wrap gap-4">
                            {movie.cast && movie.cast.map(actor => (
                                <div key={actor} className="flex items-center gap-3 bg-surface px-4 py-2 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs">
                                        {actor.charAt(0)}
                                    </div>
                                    <span>{actor}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-6">Reviews</h2>

                        {user ? (
                            existingReview ? (
                                <div className="mb-8 p-6 bg-primary/10 rounded-xl border border-primary/20 text-center">
                                    <div className="flex items-center justify-center gap-2 text-primary font-bold mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                            <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                                        </svg>
                                        You've already reviewed this movie
                                    </div>
                                    <p className="text-gray-400">Thank you for successful contribution!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleReviewSubmit} className="mb-8 bg-surface p-8 rounded-2xl border border-white/5 shadow-xl">
                                    <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
                                        <span className="bg-primary w-1 h-6 rounded-full"></span>
                                        Leave a Review
                                    </h3>

                                    <div className="mb-6">
                                        <label className="block text-sm text-gray-400 mb-3 font-medium uppercase tracking-wide">Your Rating</label>
                                        <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        className="relative w-8 h-8 transition-transform hover:scale-110 focus:outline-none"
                                                        onMouseEnter={() => setHoverRating(star)}
                                                        onClick={() => setNewReview({ ...newReview, rating: star })}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            viewBox="0 0 24 24"
                                                            fill={(hoverRating || newReview.rating) >= star ? "#eab308" : "#323232"} // Yellow-500 or Dark Gray
                                                            className="w-full h-full drop-shadow-md transition-colors duration-200"
                                                        >
                                                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                            <span className="ml-4 text-2xl font-bold text-yellow-500">
                                                {hoverRating || newReview.rating}<span className="text-gray-600 text-lg">/10</span>
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <label className="block text-sm text-gray-400 mb-2 font-medium uppercase tracking-wide">Your Review</label>
                                        <textarea
                                            value={newReview.comment}
                                            onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl p-4 text-white hover:border-white/20 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all min-h-[140px] resize-y placeholder:text-gray-600 leading-relaxed"
                                            placeholder="What did you think about the story, acting, and direction?"
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="bg-primary text-white px-8 py-3 rounded-full font-bold hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                                                    Posting...
                                                </>
                                            ) : (
                                                'Post Review'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )
                        ) : (
                            <div className="mb-8 p-10 bg-surface/30 backdrop-blur-sm rounded-2xl border border-dashed border-white/10 text-center group hover:bg-surface/40 transition-colors">
                                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🍿</div>
                                <h3 className="text-xl font-bold text-white mb-2">Have you watched this movie?</h3>
                                <p className="mb-6 text-gray-400">Join the discussion and share your thoughts with the community.</p>
                                <Link to="/login" className="inline-block px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 hover:scale-105 transition-all shadow-lg shadow-white/10">
                                    Log in to Review
                                </Link>
                            </div>
                        )}

                        {reviews.length > 0 ? (
                            <div className="grid gap-4">
                                {reviews.map(review => (
                                    <div key={review._id} className="bg-surface p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold">
                                                    U
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-200">User Check</div>
                                                    <div className="text-xs text-gray-500">Verified Reviewer</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                                                <span className="text-yellow-500">★</span>
                                                <span className="text-yellow-500 font-bold">{review.rating}</span>
                                                <span className="text-yellow-500/50 text-xs">/10</span>
                                            </div>
                                        </div>
                                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-500 italic py-12 text-center bg-surface/30 rounded-2xl border border-white/5">
                                No reviews yet. Be the first to share your opinion!
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-xl">
                        <h3 className="font-bold mb-6 text-lg border-b border-white/10 pb-4">Details</h3>
                        <dl className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Director</dt>
                                <dd className="text-right font-medium">{movie.director}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-gray-500">Release Date</dt>
                                <dd className="text-right font-medium">{movie.year}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Similar Movies Section */}
                    {similarMovies.length > 0 && (
                        <div className="bg-surface p-6 rounded-2xl border border-white/5 shadow-xl">
                            <h3 className="font-bold mb-6 text-lg border-b border-white/10 pb-4">You Might Also Like</h3>
                            <div className="space-y-4">
                                {similarMovies.map(simMovie => (
                                    <Link key={simMovie._id} to={`/movies/${simMovie._id}`} className="flex gap-4 group hover:bg-white/5 p-2 rounded-xl transition-colors -mx-2">
                                        <img
                                            src={simMovie.poster_url}
                                            alt={simMovie.title}
                                            className="w-16 h-24 object-cover rounded-lg bg-gray-800 shadow-md group-hover:scale-105 transition-transform"
                                        />
                                        <div className="flex flex-col justify-center">
                                            <h4 className="font-medium group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">{simMovie.title}</h4>
                                            <span className="text-xs text-gray-500 mb-2">{simMovie.year}</span>
                                            <div className="flex items-center gap-1 text-xs text-yellow-500 bg-yellow-500/10 w-fit px-2 py-0.5 rounded-full">
                                                <span>★</span>
                                                <span>{simMovie.average_rating || 0}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetailPage;
