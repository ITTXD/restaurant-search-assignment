import { useState } from 'react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);
    setResults([]);
    setSource(null);

    try {
      // Connect to the backend API running on port 3001
      const res = await fetch(`http://localhost:3001/search?q=${encodeURIComponent(query)}`);

      if (!res.ok) {
        throw new Error(`Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResults(data.data || []);
      setSource(data.source);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const renderPriceLevel = (level) => {
    if (!level) return null;
    return '฿'.repeat(level);
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="title">Hungry? <span>Find Places</span></h1>
        <p className="subtitle">Search for the best restaurants in town.</p>

        <form onSubmit={handleSearch} className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="e.g. Bang Sue, Sukhumvit, Sushi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="search-button" disabled={loading || !query.trim()}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {source && (
          <div className="status-indicator">
            <span className={`badge ${source === 'cache' ? 'cache' : 'api'}`}>
              {source === 'cache' ? '⚡ Loaded from Cache' : '🌐 Fetched from Google API'}
            </span>
          </div>
        )}
      </header>

      <main>
        {loading && (
          <div className="loading">
            <div className="spinner"></div>
            <p>Finding the best spots for you...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="empty-state">
            <p>No restaurants found for "{query}". Try another location or keyword.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="results-grid">
            {results.map((place) => (
              <div key={place.place_id || place.name} className="restaurant-card">
                <div className="card-header">
                  <div className="icon-wrapper" style={{ backgroundColor: place.icon_background_color || '#FF9E67' }}>
                    <img src={place.icon} alt="icon" />
                  </div>
                  <h3 className="restaurant-name">{place.name}</h3>
                </div>

                <div className="rating-container">
                  <span className="star">★</span>
                  <span className="rating-score">{place.rating || 'N/A'}</span>
                  <span className="rating-count">({place.user_ratings_total || 0} reviews)</span>
                </div>

                <p className="address">{place.formatted_address}</p>

                <div className="card-footer">
                  <span className={`status-badge ${place.business_status === 'OPERATIONAL' ? 'operational' : 'closed'}`}>
                    {place.business_status === 'OPERATIONAL' ? 'Open' : 'Closed'}
                  </span>
                  <span className="price-level">
                    {renderPriceLevel(place.price_level)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
