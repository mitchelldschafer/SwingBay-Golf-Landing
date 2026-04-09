import React from 'react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-[var(--background)] py-24 px-6 font-sans">
      <div className="max-w-[1000px] mx-auto text-center mb-16">
        <h1 className="text-[42px] md:text-[56px] font-bold text-[var(--text-heading)] mb-6 tracking-tight">Membership & Pricing</h1>
        <p className="text-[16px] md:text-[18px] text-[var(--text-body)] max-w-[700px] mx-auto leading-relaxed mb-8">
          Join our indoor golf community, improve your game, and have a blast with friends. Spots are limited, so sign up today and earn discounts on drinks and merchandise!
        </p>
        <Link to="/book" className="btn-primary uppercase tracking-wide text-[14px] px-8 py-3.5 inline-block">
          <span className="bg-slide"></span>
          <span className="text text-[var(--text-heading)]">Book Now</span>
        </Link>
      </div>

      <div className="max-w-[1000px] mx-auto space-y-12">
        
        {/* MEMBERSHIP BOX */}
        <div className="border-2 border-yellow-400/80 rounded-[24px] p-8 md:p-12 shadow-[0_0_25px_rgba(250,204,21,0.15)] bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-yellow-300 to-yellow-600"></div>
          <h2 className="text-[32px] md:text-[40px] font-black text-white uppercase tracking-wider mb-2">Monthly Membership</h2>
          <div className="text-[20px] font-bold text-yellow-400 mb-8 flex items-center gap-4">
             $259 / MONTH
             <span className="h-px bg-yellow-400/30 flex-grow"></span>
          </div>
          <ul className="text-white/90 text-[16px] md:text-[18px] space-y-4 list-none pl-0">
            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> 8 hours of simulator time per month</li>
            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> 15% discount on merchandise</li>
            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> 15% discount on alcoholic beverages</li>
            <li className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> $10 for rental clubs</li>
          </ul>
        </div>

        {/* OPEN PLAY BOX */}
        <div className="border-2 border-blue-400/80 rounded-[24px] p-8 md:p-12 shadow-[0_0_25px_rgba(96,165,250,0.15)] bg-[#0a0a0a] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-300 to-blue-600"></div>
          <h2 className="text-[32px] md:text-[40px] font-black text-white uppercase tracking-wider mb-8 text-center pt-2">Open Play Pricing</h2>
          <div className="border-t border-white/10 pt-10 text-center">
             <div className="text-[14px] font-bold text-blue-400 uppercase tracking-widest mb-3">Monday – Sunday</div>
             <div className="text-white text-[24px] md:text-[32px] mb-8 font-bold">$50 per hour</div>
             
             <div className="inline-block bg-white/5 border border-white/10 rounded-full px-6 py-4">
                <span className="text-[17px] font-bold text-white mr-2">Leagues:</span>
                <span className="text-white/80 text-[16px]">Monday & Wednesday Night 7pm – 10pm</span>
             </div>
          </div>
        </div>

        {/* WEEKLY LEAGUES SECTION */}
        <div className="pt-16 pb-8 text-center">
            <h2 className="text-[32px] md:text-[40px] font-black text-[var(--text-heading)] uppercase tracking-wider mb-2">Weekly Leagues</h2>
            <div className="w-16 h-1 bg-[var(--accent)] mx-auto rounded-full"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-cyan-400/50 hover:border-cyan-400 transition-colors rounded-[24px] p-8 text-center shadow-[0_0_15px_rgba(34,211,238,0.1)] hover:shadow-[0_0_25px_rgba(34,211,238,0.2)] bg-[#0a0a0a] flex flex-col items-center justify-center min-h-[220px]">
             <h3 className="text-[22px] font-black text-cyan-400 uppercase tracking-wider mb-4">Schedule</h3>
             <p className="text-white text-[16px] mb-1 font-medium">Wednesdays</p>
             <p className="text-white text-[18px] mb-3 font-bold">7PM – 10PM</p>
             <p className="text-cyan-100/70 text-[14px]">7PM – 7:30PM Warm Ups</p>
          </div>

          <div className="border border-yellow-400/50 hover:border-yellow-400 transition-colors rounded-[24px] p-8 text-center shadow-[0_0_15px_rgba(250,204,21,0.1)] hover:shadow-[0_0_25px_rgba(250,204,21,0.2)] bg-[#0a0a0a] flex flex-col items-center justify-center min-h-[220px]">
             <h3 className="text-[22px] font-black text-yellow-400 uppercase tracking-wider mb-4">Pricing</h3>
             <p className="text-white text-[18px] mb-4 font-bold">$259 per month per person</p>
             <p className="text-yellow-100/70 text-[14px]">(2 month commitment)</p>
          </div>

          <div className="border border-red-500/50 hover:border-red-500 transition-colors rounded-[24px] p-8 text-center shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.2)] bg-[#0a0a0a] flex flex-col items-center justify-center min-h-[220px]">
             <h3 className="text-[22px] font-black text-red-500 uppercase tracking-wider mb-4">Scoring</h3>
             <p className="text-white text-[18px] font-medium leading-relaxed">Leagues based on GHIN index</p>
          </div>

          <div className="border border-green-500/50 hover:border-green-500 transition-colors rounded-[24px] p-8 text-center shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:shadow-[0_0_25px_rgba(34,197,94,0.2)] bg-[#0a0a0a] flex flex-col items-center justify-center min-h-[220px]">
             <h3 className="text-[22px] font-black text-green-500 uppercase tracking-wider mb-4">Teams</h3>
             <p className="text-white text-[20px] mb-2 font-bold">4v4</p>
             <p className="text-green-100/90 text-[16px]">18 holes played each evening!</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Pricing;
