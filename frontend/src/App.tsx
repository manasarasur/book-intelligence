import React, { useState, useEffect } from 'react';

function App() {
  const [books, setBooks] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'qa'>('dashboard');
  const [expandedBooks, setExpandedBooks] = useState<Record<number, boolean>>({});

  const toggleExpand = (id: number) => {
    setExpandedBooks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${API_BASE}/books/`);
      const data = await res.json();
      setBooks(data);
    } catch (e) {
      console.error(e);
    }
  };

  const regenerateInsights = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE}/books/${id}/analyze/`, { method: 'POST' });
      const updatedBook = await res.json();
      setBooks(books.map(b => b.id === id ? updatedBook : b));
    } catch (e) {
      console.error(e);
    }
  };

  const askQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/books/ask/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setAnswer(data);
    } catch (e) {
      console.error(e);
      setAnswer({ answer: "Error connecting to AI service." });
    }
    setLoading(false);
  };

  const getRecommendations = async (bookId: number) => {
    // optional bonus feature implementation placeholder
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      <nav className="bg-slate-800 border-b border-slate-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex font-bold items-center text-xl tracking-tight text-teal-400">
              <svg className="w-8 h-8 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              <span>Document Intelligence</span>
            </div>
            <div className="flex space-x-4 items-center">
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-teal-500/20 text-teal-400 ring-2 ring-teal-500/50' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                Dashboard
              </button>
              <button 
                onClick={() => setActiveTab('qa')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${activeTab === 'qa' ? 'bg-teal-500/20 text-teal-400 ring-2 ring-teal-500/50' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
                Q&A Ask AI
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-sm">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">Library Dashboard</h1>
              <button onClick={fetchBooks} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg transition flex items-center shadow-md">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Refresh
              </button>
            </div>
            
            {books.length === 0 ? (
              <div className="text-center py-20 text-slate-500 border border-slate-800 rounded-3xl bg-slate-800/20 backdrop-blur-sm h-64 flex flex-col justify-center items-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p className="text-xl font-medium">No books found.</p>
                <p className="text-sm mt-2 max-w-md">Run the scraper to generate books and see AI insights populating here.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {books.map((book: any, idx) => (
                  <div key={book.id} 
                    style={{ animationDelay: `${idx * 100}ms` }}
                    className="bg-slate-800/80 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-slate-700 hover:border-teal-500/50 hover:shadow-teal-900/20 hover:-translate-y-1 transition-all duration-300 flex flex-col animate-in fade-in slide-in-from-bottom-8">
                    <div className="p-6 flex-grow">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-bold text-slate-100 line-clamp-2">{book.title}</h2>
                        {book.rating && (
                          <span className="flex items-center text-sm font-semibold bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full shrink-0 border border-amber-500/30">
                            ★ {book.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-teal-400 font-medium mb-3">{book.author}</p>
                      {book.genre && (
                        <span className="inline-block bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs px-3 py-1 rounded-full mb-4 font-medium uppercase tracking-wider">
                          {book.genre}
                        </span>
                      )}
                      <div className="mb-4">
                        <p className={`text-slate-400 text-sm leading-relaxed ${expandedBooks[book.id] ? '' : 'line-clamp-3'} transition-all duration-300`}>
                          {book.description || "No description provided."}
                        </p>
                        {book.description && book.description.length > 150 && (
                          <button 
                            onClick={() => toggleExpand(book.id)}
                            className="text-teal-400 hover:text-teal-300 text-xs font-semibold uppercase tracking-wider mt-2 transition-colors">
                            {expandedBooks[book.id] ? 'Show less' : 'Read more'}
                          </button>
                        )}
                      </div>
                      
                      
                      {book.insights && (
                        <div className="bg-slate-900/60 rounded-xl p-5 mt-5 border border-slate-700/50 text-sm shadow-inner relative">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-slate-300 flex items-center tracking-wide uppercase text-xs">
                              <span className="bg-indigo-500/20 p-1.5 rounded mr-2 text-indigo-400">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                              </span>
                              AI Analysis
                            </h4>
                            <button 
                              onClick={() => regenerateInsights(book.id)}
                              className="text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded transition border border-indigo-500/20 active:scale-95 flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                              Regenerate
                            </button>
                          </div>
                          {book.insights.summary && !book.insights.error && <p className="text-slate-300 mb-3 italic leading-relaxed">"{book.insights.summary}"</p>}
                          {book.insights.error && <p className="text-rose-400 mb-3 text-xs leading-relaxed font-mono bg-rose-500/10 p-2 rounded">Error: {book.insights.summary || book.insights.error}</p>}
                          {book.insights.sentiment && !book.insights.error && <p className="text-xs text-teal-400 font-semibold tracking-wider">TONE: {book.insights.sentiment.toUpperCase()}</p>}
                        </div>
                      )}
                    </div>
                    {book.url && (
                        <a href={book.url} target="_blank" rel="noreferrer" className="block w-full py-4 bg-slate-800 border-t border-slate-700 hover:bg-slate-700 text-center text-sm text-teal-400 font-medium transition duration-200 hover:text-teal-300 tracking-wide uppercase">
                          View Original
                        </a>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'qa' && (
          <div className="max-w-4xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-800/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-slate-700">
              <div className="p-8 border-b border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden relative">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl"></div>

                <div className="relative">
                  <h2 className="text-4xl font-bold text-white mb-3">Ask the Library AI</h2>
                  <p className="text-slate-400 mb-8 text-lg">Ask for recommendations or ask questions about any books in our collection.</p>
                  
                  <div className="bg-slate-900/50 p-2 rounded-2xl flex max-w-2xl border border-slate-600/50 shadow-inner focus-within:border-teal-500/50 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
                    <input
                      type="text"
                      className="flex-grow bg-transparent p-4 text-white focus:outline-none placeholder-slate-500"
                      placeholder="E.g., What are some inspirational books about nature?"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && askQuestion()}
                    />
                    <button 
                      onClick={askQuestion}
                      disabled={loading || !query}
                      className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-8 py-4 rounded-xl disabled:opacity-50 transition-all duration-300 transform active:scale-95 shadow-lg shadow-teal-500/20 disabled:shadow-none flex items-center">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Thinking...
                        </>
                      ) : (
                        <>
                          Submit <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-8 min-h-[400px] bg-slate-900/50 flex flex-col relative">
                {!answer && !loading && (
                   <div className="flex-1 flex items-center justify-center text-slate-500 flex-col">
                     <svg className="w-20 h-20 mb-6 text-slate-700/50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                     <p className="text-xl font-medium">Your answer will appear here</p>
                   </div>
                )}

                {loading && (
                   <div className="flex-1 flex flex-col items-center justify-center space-y-4 text-teal-400/70">
                      <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin"></div>
                      <p className="animate-pulse tracking-widest font-medium">ANALYZING CORPUS...</p>
                   </div>
                )}

                {answer && !loading && (
                  <div className="animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex items-start mb-6">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 mr-4 shrink-0 mt-1">
                        AI
                      </div>
                      <div className="bg-slate-800 p-6 rounded-2xl rounded-tl-none border border-slate-700 shadow-xl max-w-3xl">
                        <h3 className="font-bold text-lg text-white mb-3">Response</h3>
                        <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{answer.answer}</p>
                      </div>
                    </div>
                    
                    {answer.sources && answer.sources.length > 0 && (
                      <div className="mt-8 ml-14">
                        <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          Sources Configured
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {answer.sources.map((s: any, i: number) => (
                             <span key={i} className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium bg-slate-800 text-teal-300 border border-slate-700 hover:border-teal-500/50 hover:bg-slate-700 transition cursor-default shadow-sm group">
                               <svg className="w-4 h-4 mr-2 text-slate-500 group-hover:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                               {s.title}
                             </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
