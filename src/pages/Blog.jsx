import React, { useState, useEffect } from 'react';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Google Sheet Data as CSV
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // We use the pub?output=csv version of the URL you provided
        const url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTbeaCFiGLTB-SXkqJ9OoAlpVZ2w4bq--Mmx-LLcuCYeEamGU6kf_3x8UoftZ31fU7cCgR2-sZRuzBJ/pub?output=csv';
        const response = await fetch(url);
        
        if (!response.ok) {
           throw new Error('Google sheet fetch failed');
        }
        
        const csvText = await response.text();
        const rows = csvText.split('\n');
        if (rows.length < 2) throw new Error('No data rows');

        const headers = rows[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        
        const parsedPosts = [];
        for (let i = 1; i < rows.length; i++) {
          if (!rows[i].trim()) continue;
          
          // Simple CSV line parser that respects quoted commas
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
          
          parsedPosts.push({
            id: i,
            title: postObj.title || 'Untitled Post',
            excerpt: postObj.excerpt || postObj.description || 'No summary provided',
            date: postObj.date || new Date().toLocaleDateString(),
            image: postObj.image || '/images/simulator.png',
            category: postObj.category || 'News'
          });
        }

        setPosts(parsedPosts.some(p => p.title !== 'Untitled Post') ? parsedPosts.reverse() : getFallbackData());
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
      date: "Oct 24, 2025",
      image: "/images/simulator.png",
      category: "Technology"
    },
    {
      id: 2,
      title: "New Club Rentals Available",
      excerpt: "We just received a brand new shipment of Titleist and Callaway premium iron sets for rent.",
      date: "Oct 20, 2025",
      image: "/images/clubs.png",
      category: "Updates"
    }
  ];

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
              <div key={post.id} className="bg-white rounded-[24px] overflow-hidden border border-[var(--border)] hover-card flex flex-col">
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
    </div>
  );
};

export default Blog;
