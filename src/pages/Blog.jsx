import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState(null);

  // Fetch Google Sheet Data as CSV
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbeaCFiGLTB-SXkqJ9OoAlpVZ2w4bq--Mmx-LLcuCYeEamGU6kf_3x8UoftZ31fU7cCgR2-sZRuzBJ/pub?output=csv';
        const response = await fetch(url);
        
         if (!response.ok) {
            throw new Error('Google sheet fetch failed');
         }
         
         const csvText = await response.text();
         
         let inStringQuotes = false;
        let rawRows = [];
        let currentRowStr = '';
        for (let i = 0; i < csvText.length; i++) {
            let char = csvText[i];
            // Handle carriage returns
            if (char === '\r') continue;
            
            if (char === '"') {
                inStringQuotes = !inStringQuotes;
                currentRowStr += char;
            } else if (char === '\n' && !inStringQuotes) {
                rawRows.push(currentRowStr);
                currentRowStr = '';
            } else {
                currentRowStr += char;
            }
        }
        if (currentRowStr) rawRows.push(currentRowStr);

        const rows = rawRows.filter(r => r.trim() !== '');
        if (rows.length < 2) throw new Error('No data rows');

        // Dynamically find the row that actually contains the headers
        let headerIndex = 0;
        for (let i = 0; i < rows.length; i++) {
            if (rows[i].toLowerCase().includes('title')) {
                headerIndex = i;
                break;
            }
        }

        const headers = rows[headerIndex].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        
        const parsedPosts = [];
        for (let i = headerIndex + 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          let values = [];
          let inQuotes = false;
          let currentVal = '';
          for (let char of rows[i]) {
             if (char === '"') inQuotes = !inQuotes;
             else if (char === ',' && !inQuotes) { values.push(currentVal.trim()); currentVal = ''; }
             else currentVal += char;
          }
          values.push(currentVal.trim());
          
          let postObj = {};
          headers.forEach((h, index) => {
             postObj[h] = values[index] ? values[index].replace(/^"|"$/g, '') : '';
          });
          
          // Graceful degradation: if no excerpt exists, slice the content down. If no content, use excerpt.
          let rawContent = postObj.content || '';
          let rawExcerpt = postObj.excerpt || (rawContent.length > 120 ? rawContent.substring(0, 120) + '...' : rawContent) || 'No summary provided';

          parsedPosts.push({
            id: i,
            title: postObj.title || 'Untitled Post',
            excerpt: rawExcerpt,
            content: rawContent,
            date: postObj.date || new Date().toLocaleDateString(),
            image: postObj.image || '/images/simulator.png',
            category: postObj.category || 'News',
            status: (postObj.status || '').toLowerCase().trim()
          });
        }

        let validPosts = parsedPosts.filter(p => p.status.includes('publish'));
        setPosts(validPosts.length > 0 ? validPosts.reverse() : getFallbackData());
      } catch (err) {
        console.error("Failed to load CMS from Google Sheets:", err);
        setPosts(getFallbackData());
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const getFallbackData = () => [
    {
      id: 1,
      title: "The Ultimate Guide to Indoor Golf",
      excerpt: "How trackman technology is revolutionizing the way golfers practice during the off-season. (This is fallback data, Google Sheet didn't load!)",
      content: "This is the full article content. If you are seeing this, the Google Sheet either failed to load or has no published posts yet.\n\nIndoor golf simulators are a fantastic way to keep your swing fresh during the brutal winter months.",
      date: "Oct 24, 2025",
      image: "/images/simulator.png",
      category: "Technology"
    },
    {
      id: 2,
      title: "New Club Rentals Available",
      excerpt: "We just received a brand new shipment of Titleist and Callaway premium iron sets for rent.",
      content: "We are thrilled to announce that our facility has upgraded its entire rental fleet! Stop in on your next booking to try the newest sets.",
      date: "Oct 20, 2025",
      image: "/images/clubs.png",
      category: "Updates"
    }
  ];

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activePost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [activePost]);

  return (
    <div className="min-h-screen bg-[var(--background)] py-20 px-6">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-[48px] md:text-[64px] font-bold text-[var(--text-heading)] mb-4">SwingBay Journal</h1>
          <p className="text-[18px] text-[var(--text-body)] max-w-[600px] mx-auto">
            Updates, golf tips, and news from our Denver tracking facility.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-[300px]">
            <svg className="animate-spin text-[var(--primary)]" xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map(post => (
              <div key={post.id} className="bg-white rounded-[24px] overflow-hidden border border-[var(--border)] hover-card flex flex-col cursor-pointer" onClick={() => setActivePost(post)}>
                <div className="h-[240px] overflow-hidden">
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[12px] font-bold text-[var(--accent-hover)] uppercase tracking-wider">{post.category}</span>
                    <span className="text-[12px] text-[var(--text-muted)]">{post.date}</span>
                  </div>
                  <h3 className="text-[22px] font-bold text-[var(--text-heading)] mb-3 leading-tight">{post.title}</h3>
                  <p className="text-[15px] text-[var(--text-body)] mb-6 flex-grow">{post.excerpt}</p>
                  <button className="text-[var(--primary)] font-bold text-[14px] flex items-center gap-2 group mt-auto w-fit">
                    Read Article 
                    <svg className="group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX MODAL */}
      {activePost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
            onClick={() => setActivePost(null)}
          ></div>
          
          {/* Modal Card */}
          <div className="bg-white w-full max-w-[800px] max-h-[90vh] rounded-[24px] shadow-2xl relative z-10 flex flex-col overflow-hidden animate-slide-up">
            <button 
              onClick={() => setActivePost(null)}
              className="absolute top-4 right-4 z-20 bg-white/50 hover:bg-white text-[var(--dark)] p-2 rounded-full backdrop-blur-md transition-colors shadow-sm"
            >
              <X size={24} />
            </button>
            
            {/* Header Image */}
            <div className="h-[250px] sm:h-[320px] w-full shrink-0 relative">
              <img src={activePost.image} alt={activePost.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="bg-[var(--accent)] text-[var(--primary)] px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider">{activePost.category}</span>
                  <span className="text-white/80 text-[14px]">{activePost.date}</span>
                </div>
                <h2 className="text-[32px] sm:text-[42px] font-bold text-white leading-tight">{activePost.title}</h2>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar">
              <div className="text-[17px] leading-relaxed text-[var(--text-body)]">
                {activePost.content.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                  <p key={idx} className="mb-6 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
