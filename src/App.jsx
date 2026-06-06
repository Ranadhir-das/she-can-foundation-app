import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Heart, ArrowRight, Menu, X, Award, Users, Globe, LogOut, CheckCircle, Trash2, MessageSquare, Shield } from 'lucide-react';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState('landing');
  const [authMode, setAuthMode] = useState('user'); 

  // Form States
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Authentication States
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');

  // Admin Dashboard States
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminTab, setAdminTab] = useState('messages'); 

  // Theme Toggle Effect
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  // Admin Data Fetching Effect
  useEffect(() => {
    if (currentView === 'admin' && authToken && userRole === 'admin') {
      if (adminTab === 'messages') fetchAdminMessages();
      if (adminTab === 'users') fetchAdminUsers();
    }
  }, [currentView, authToken, userRole, adminTab]);

  const fetchAdminMessages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/messages', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        setAdminMessages(await response.json());
      } else handleLogout();
    } catch (err) { console.error("Error fetching messages", err); }
  };

  const fetchAdminUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        setAdminUsers(await response.json());
      }
    } catch (err) { console.error("Error fetching users", err); }
  };

  // ---- DELETE HANDLERS ----
  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this message?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        setAdminMessages(adminMessages.filter(msg => msg._id !== id));
      }
    } catch (err) { console.error("Delete failed", err); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this account? This action cannot be undone.")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (response.ok) {
        setAdminUsers(adminUsers.filter(user => user._id !== id));
      } else {
        const data = await response.json();
        alert(data.error); 
      }
    } catch (err) { console.error("Delete failed", err); }
  };

  // ---- FORM HANDLERS ----
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    let localErrors = {};
    if (!formData.name.trim()) localErrors.name = "Name is required";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) localErrors.email = "Valid email is required";
    if (!formData.message.trim()) localErrors.message = "Message cannot be empty";

    setFormErrors(localErrors);
    if (Object.keys(localErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          setIsSubmitted(true);
          setFormData({ name: '', email: '', message: '' });
        }
      } catch (error) { setIsSubmitted(true); }
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...authForm, role: authMode }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(`${authMode.toUpperCase()} Registration Successful! Please login.`);
        setCurrentView('login');
      } else {
        setAuthError(data.error || 'Signup failed');
      }
    } catch (err) { setAuthError('Connection server error'); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      
      if (response.ok) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        setAuthToken(data.token);
        setUserRole(data.role);
        setAuthForm({ email: '', password: '' });
        
        if (data.role === 'admin') setCurrentView('admin');
        else if (data.role === 'user') setCurrentView('userDashboard');
        else setCurrentView('landing');
      } else {
        setAuthError(data.error || 'Login failed');
      }
    } catch (err) { setAuthError('Connection server error'); }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthToken('');
    setUserRole('');
    setCurrentView('landing');
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 font-bold text-xl text-pink-600 dark:text-pink-400 cursor-pointer" onClick={() => setCurrentView('landing')}>
              <Heart className="fill-current" size={24} />
              <span>She Can Foundation</span>
            </div>

            <div className="hidden md:flex items-center space-x-6 font-medium">
              {currentView === 'landing' && (
                <>
                  <a href="#about" className="text-slate-700 dark:text-slate-200 hover:text-pink-600 transition-colors">About</a>
                  <a href="#contact" className="text-slate-700 dark:text-slate-200 hover:text-pink-600 transition-colors">Contact</a>
                </>
              )}
              {currentView !== 'landing' && <button onClick={() => setCurrentView('landing')} className="text-slate-700 dark:text-slate-200 hover:text-pink-600">Home</button>}
              
              {authToken ? (
                <button onClick={() => setCurrentView(userRole === 'admin' ? 'admin' : 'userDashboard')} className="text-purple-600 dark:text-purple-400 font-semibold hover:underline">Dashboard</button>
              ) : (
                <button onClick={() => { setAuthMode('user'); setCurrentView('login'); }} className="text-slate-700 dark:text-slate-200 hover:text-pink-600 font-medium">Sign In</button>
              )}

              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>

            {/* MOBILE ACTION BUTTONS */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{darkMode ? <Sun size={18} /> : <Moon size={18} />}</button>
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">{isMenuOpen ? <X size={20} /> : <Menu size={20} />}</button>
            </div>
          </div>
        </div>

        {/* MOBILE DROPDOWN */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
              <div className="px-4 pt-2 pb-4 space-y-2 font-medium">
                <a href="#about" onClick={() => setIsMenuOpen(false)} className="block py-2 px-3 text-slate-700 dark:text-slate-200">About</a>
                <a href="#contact" onClick={() => setIsMenuOpen(false)} className="block py-2 px-3 text-slate-700 dark:text-slate-200">Contact</a>
                {authToken ? (
                  <button onClick={() => { setCurrentView(userRole === 'admin' ? 'admin' : 'userDashboard'); setIsMenuOpen(false); }} className="w-full text-left py-2 px-3 text-purple-600">Dashboard</button>
                ) : (
                  <button onClick={() => { setAuthMode('user'); setCurrentView('login'); setIsMenuOpen(false); }} className="w-full text-left py-2 px-3 text-slate-700 dark:text-slate-200">Sign In</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* CONDITIONAL RENDERING */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: LANDING */}
        {currentView === 'landing' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <header className="max-w-7xl mx-auto px-4 py-20 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <span className="inline-block px-3 py-1 text-xs font-semibold uppercase bg-pink-100 dark:bg-pink-950 text-pink-700 dark:text-pink-300 rounded-full">Empowering Women Worldwide</span>
                <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Because When She Can, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">She Changes the World.</span></h1>
                <p className="text-lg text-slate-600 dark:text-slate-300">We supply mentorship infrastructures and professional upskilling resources to transform leadership capacities globally.</p>
                <div className="flex flex-wrap gap-4">
                  <a href="#contact" className="bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold px-8 py-4 rounded-xl shadow-md">Get in Touch</a>
                  {!authToken && <button onClick={() => { setAuthMode('user'); setCurrentView('signup'); }} className="border border-pink-600 text-pink-600 dark:text-pink-400 font-semibold px-6 py-4 rounded-xl">Create Member Account</button>}
                </div>
              </div>
              <div className="aspect-square max-w-md mx-auto w-full"><img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Leader" className="w-full h-full object-cover rounded-3xl shadow-xl" /></div>
            </header>

            {/* ABOUT */}
            <section id="about" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900">
              <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold mb-8">About Our Programs</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><Award className="text-pink-600 mb-4" size={32} /><h3 className="text-xl font-bold mb-2">Skills Bootcamps</h3><p className="text-slate-600 dark:text-slate-400">Technical training built specifically to close workspace equity gaps.</p></div>
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><Users className="text-purple-600 mb-4" size={32} /><h3 className="text-xl font-bold mb-2">Mentorship Hub</h3><p className="text-slate-600 dark:text-slate-400">Pairing upcoming candidates with experienced executives worldwide.</p></div>
                  <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><Globe className="text-blue-600 mb-4" size={32} /><h3 className="text-xl font-bold mb-2">Global Network</h3><p className="text-slate-600 dark:text-slate-400">Opening borders for career advancements across 14+ resource nodes.</p></div>
                </div>
              </div>
            </section>

            {/* CONTACT */}
            <section id="contact" className="py-16 bg-slate-50 dark:bg-slate-900">
              <div className="max-w-lg mx-auto px-4">
                <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                  <h2 className="text-2xl font-bold mb-6 text-center">Get in Touch</h2>
                  {isSubmitted ? (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl text-center font-medium">🎉 Form Submitted Successfully!</div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />{formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}</div>
                      <div><label className="block text-sm font-medium mb-1">Email Address</label><input type="email" className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />{formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}</div>
                      <div><label className="block text-sm font-medium mb-1">Message</label><textarea rows="4" className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})}></textarea>{formErrors.message && <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>}</div>
                      <button type="submit" className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white font-semibold py-3 rounded-xl">Submit Message</button>
                    </form>
                  )}
                </div>
              </div>
            </section>
          </motion.div>
        )}

        {/* VIEW 2: LOGIN */}
        {currentView === 'login' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-md mx-auto py-24 px-4">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold mb-2 text-center">Welcome Back</h2>
              <p className="text-sm text-slate-500 text-center mb-6">Sign in to your She Can account portal</p>
              {authError && <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-xl text-sm mb-4">{authError}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Email Address</label><input type="email" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} /></div>
                <button type="submit" className="w-full bg-pink-600 text-white font-semibold py-3 rounded-xl hover:bg-pink-700">Sign In</button>
              </form>
              <div className="text-sm text-center text-slate-600 dark:text-slate-400 mt-6 space-y-2">
                <div>Don't have an account? <button onClick={() => { setAuthMode('user'); setCurrentView('signup'); }} className="text-pink-600 font-medium underline">Create Profile</button></div>
                <div className="text-xs pt-2 border-t border-slate-100 dark:border-slate-900">Are you an administrator? <button onClick={() => { setAuthMode('admin'); setCurrentView('signup'); }} className="text-purple-600 font-medium underline">Register Admin</button></div>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 3: SIGNUP */}
        {currentView === 'signup' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-md mx-auto py-24 px-4">
            <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-bold mb-2 text-center">Create {authMode === 'admin' ? 'Admin' : 'Member'} Account</h2>
              <p className="text-sm text-slate-500 text-center mb-6">Join our verified platform ecosystem</p>
              {authError && <div className="p-3 bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 rounded-xl text-sm mb-4">{authError}</div>}
              <form onSubmit={handleSignup} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} /></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" required className="w-full p-3 rounded-xl border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} /></div>
                <button type="submit" className={`w-full text-white font-semibold py-3 rounded-xl shadow-md ${authMode === 'admin' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-pink-600 hover:bg-pink-700'}`}>Register Account</button>
              </form>
              <p className="text-sm text-center text-slate-600 mt-4">Have an account? <button onClick={() => setCurrentView('login')} className="text-pink-600 underline font-medium">Login instead</button></p>
            </div>
          </motion.div>
        )}

        {/* VIEW 4: USER DASHBOARD */}
        {currentView === 'userDashboard' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto px-4 py-12">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
              <div>
                <h1 className="text-3xl font-bold">Member Dashboard</h1>
                <p className="text-sm text-slate-500">Welcome to the She Can Foundation Community Ecosystem</p>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-red-100 hover:text-red-700 p-3 rounded-xl font-medium transition-all"><LogOut size={18} /> Logout</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold"><CheckCircle size={20} />Account Status: Verified Member</div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">You have successfully logged into your platform profile. Your verified membership allows you access to exclusive corporate resources.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 5: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-4 py-12">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3"><Shield className="text-purple-600" /> Admin Command Center</h1>
                <p className="text-sm text-slate-500 mt-1">Manage platform messages and user accounts</p>
              </div>
              <button onClick={handleLogout} className="flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-800 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-950 dark:hover:text-red-400 p-3 rounded-xl font-medium transition-all"><LogOut size={18} /> Logout</button>
            </div>

            {/* Admin Navigation Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-800">
              <button 
                onClick={() => setAdminTab('messages')} 
                className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors ${adminTab === 'messages' ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                <MessageSquare size={18} /> Inbox Messages
              </button>
              <button 
                onClick={() => setAdminTab('users')} 
                className={`pb-3 px-2 font-medium flex items-center gap-2 transition-colors ${adminTab === 'users' ? 'border-b-2 border-pink-600 text-pink-600 dark:text-pink-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
              >
                <Users size={18} /> Registered Accounts
              </button>
            </div>

            {/* TAB CONTENT: MESSAGES */}
            {adminTab === 'messages' && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Sender Details</th>
                        <th className="px-6 py-4 w-full">Message</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {adminMessages.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-medium">No incoming messages found.</td></tr>
                      ) : (
                        adminMessages.map((msg) => (
                          <tr key={msg._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                            <td className="px-6 py-4">
                              <div className="font-semibold text-slate-900 dark:text-white">{msg.name}</div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">{msg.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-normal max-w-sm">{msg.message}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{new Date(msg.createdAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => handleDeleteMessage(msg._id)} className="p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 rounded-lg transition-colors" title="Delete Message">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENT: USERS */}
            {adminTab === 'users' && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      <tr>
                        <th className="px-6 py-4">Account Email</th>
                        <th className="px-6 py-4">Role Designation</th>
                        <th className="px-6 py-4">Join Date</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                      {adminUsers.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-12 text-slate-400 font-medium">No users found.</td></tr>
                      ) : (
                        adminUsers.map((user) => (
                          <tr key={user._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                            <td className="px-6 py-4 font-mono font-medium">{user.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                                {user.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Legacy Account'}</td>
                            <td className="px-6 py-4 text-center">
                              <button onClick={() => handleDeleteUser(user._id)} className="p-2 text-slate-400 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400 rounded-lg transition-colors" title="Delete User">
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </motion.div>
        )}
      </AnimatePresence>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-center py-8 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-300">
        © {new Date().getFullYear()} She Can Foundation. Secure Dashboard System.
      </footer>
    </div>
  );
}