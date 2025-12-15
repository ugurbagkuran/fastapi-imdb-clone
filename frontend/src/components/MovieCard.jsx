import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    const cardRef = useRef(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

    const handleMouseMove = (e) => {
        if (!cardRef.current) return;

        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation (max 15 degrees)
        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        // Calculate glare position (percentage)
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;

        setRotation({ x: rotateX, y: rotateY });
        setGlare({ x: glareX, y: glareY, opacity: 1 });
    };

    const handleMouseLeave = () => {
        setRotation({ x: 0, y: 0 });
        setGlare((prev) => ({ ...prev, opacity: 0 }));
    };

    return (
        <div
            className="perspective-1000"
            style={{ perspective: '1000px' }}
        >
            <Link
                to={`/movies/${movie._id}`}
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="group relative block bg-surface rounded-xl transition-all duration-200 ease-out preserve-3d"
                style={{
                    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1, 1, 1)`,
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* Glare Effect */}
                <div
                    className="absolute inset-0 z-20 rounded-xl pointer-events-none mix-blend-overlay transition-opacity duration-200"
                    style={{
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, transparent 80%)`,
                        opacity: glare.opacity,
                    }}
                />

                <div className="aspect-[2/3] overflow-hidden rounded-t-xl relative z-10">
                    <img
                        src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'}
                        alt={movie.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    {/* Expanding Details Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent p-4 translate-y-[40%] group-hover:translate-y-0 transition-transform duration-300 flex flex-col justify-end h-full">
                        <div className="space-y-2">
                            <span className="inline-block px-2 py-1 bg-primary text-white text-[10px] font-bold rounded uppercase tracking-wider mb-2">
                                View Details
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                <p className="text-gray-300 text-xs line-clamp-2 mb-1">
                                    <span className="text-gray-500">Director:</span> {movie.director}
                                </p>
                                {movie.genre && (
                                    <div className="flex flex-wrap gap-1">
                                        {movie.genre.slice(0, 2).map((g, i) => (
                                            <span key={i} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                                                {g}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-surface rounded-b-xl border-t border-white/5 relative z-10 group-hover:bg-[#252525] transition-colors">
                    <h3 className="text-lg font-bold text-white mb-1 truncate group-hover:text-primary transition-colors">
                        {movie.title}
                    </h3>
                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>{movie.year}</span>
                        <div className="flex items-center text-yellow-500">
                            <span className="mr-1">★</span>
                            <span>{movie.average_rating !== undefined ? movie.average_rating : (movie.rating !== undefined ? movie.rating : 'N/A')}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default MovieCard;
