// --- State Management ---
const State = {
    view: 'home', // home, likes, login, admin, agent, details, signup
    user: null,
    selectedPropertyId: null,
    likes: [],
    properties: [
        {
            id: 1,
            title: "Modern 3BHK Apartment",
            city: "Noida",
            category: "Residential",
            price: "85 Lakh",
            priceSqft: "5000",
            area: "1500 sq. ft.",
            status: "approved",
            agent: "John Agent",
            description: "Luxury living in Noida Sector 62. Near metro. High appreciation value.",
            image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            video: "",
            map: "https://maps.google.com/?q=Noida",
            views: 156,
            leads: 12,
            featured: true,
            createdAt: "01/01/2026, 10:00 AM"
        },
        {
            id: 2,
            title: "Residential Plot",
            city: "Sonipat",
            category: "Commercial",
            price: "60 Lakh",
            priceSqft: "1200",
            area: "5000 sq. ft.",
            status: "approved",
            agent: "Jane Agent",
            description: "Commercial plot near highway. Perfect for investment.",
            image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80",
            video: "",
            map: "https://maps.google.com/?q=Sonipat",
            views: 89,
            leads: 4,
            featured: false,
            createdAt: "01/01/2026, 11:30 AM"
        },
        {
            id: 3,
            title: "खेती योग्य जमीन",
            city: "Padrauna",
            category: "Plot",
            price: "12 Lakh",
            priceSqft: "1500",
            area: "2 Bigha",
            status: "approved",
            agent: "Mike Dev",
            description: "यह जमीन शहर से 5 किलोमीटर दूर स्थित है। इसके आसपास स्कूल और अस्पताल उपलब्ध हैं।",
            image: "https://images.unsplash.com/photo-1542601906990-b4d3fb773b09?auto=format&fit=crop&w=800&q=80",
            video: "",
            map: "https://maps.google.com/?q=Padrauna",
            views: 450,
            leads: 15,
            featured: false,
            createdAt: "02/01/2026, 09:15 AM"
        }
    ],
    withdrawalRequests: [],
    agents: [
        { id: 101, name: "John Agent", email: "john.agent@bhumidekho.com", password: "admin123", phone: "9876543210", status: "approved", wallet: 5000 }
    ],
    adminTab: 'dashboard',
    adminSearch: '',
    agentTab: 'dashboard',
    agentSearch: '',
    settings: { showDate: true },
    walletTransactions: [],
    adminWallet: 100000 // Initial admin balance
};

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    loadGlobalData();
    render();
    window.addEventListener('popstate', (e) => {
        if (e.state) { State.view = e.state.view; render(); }
    });
    attachNavListeners();
});

function loadGlobalData() {
    const savedState = localStorage.getItem('bhumi_v2_state');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        State.user = parsed.user;
        State.likes = parsed.likes || [];
        State.agents = parsed.agents || [];
        State.settings = parsed.settings || { showDate: true };
        State.withdrawalRequests = parsed.withdrawalRequests || [];
        State.walletTransactions = parsed.walletTransactions || [];
        State.adminWallet = parsed.adminWallet !== undefined ? parsed.adminWallet : 100000;
    }
    const savedProps = localStorage.getItem('bhumi_v2_props');
    if (savedProps) {
        let props = JSON.parse(savedProps);
        props.forEach(p => {
            if (!p.status) p.status = 'approved';
            if (p.featured === undefined) p.featured = false;
        });
        State.properties = props;
    }
}

function saveGlobalData() {
    localStorage.setItem('bhumi_v2_state', JSON.stringify({
        user: State.user,
        likes: State.likes,
        agents: State.agents,
        settings: State.settings,
        withdrawalRequests: State.withdrawalRequests || [],
        walletTransactions: State.walletTransactions || [],
        adminWallet: State.adminWallet
    }));
    localStorage.setItem('bhumi_v2_props', JSON.stringify(State.properties));
}

// --- Navigation & Router ---
function navigate(view, params = null) {
    State.view = view;
    if (params) State.selectedPropertyId = params;
    window.scrollTo(0, 0);

    const header = document.getElementById('main-header');
    header.style.display = (view === 'login' || view === 'admin' || view === 'agent') ? 'none' : 'block';

    const profileAction = document.getElementById('profile-action');
    const nameSpan = document.getElementById('user-name-h');
    const profileIconBox = profileAction.querySelector('.profile-circle');

    if (State.user) {
        nameSpan.innerText = State.user.name ? State.user.name.split(' ')[0] : 'User';
        nameSpan.style.display = 'block';
        if (State.user.photo) {
            profileIconBox.innerHTML = `<img src="${State.user.photo}" style="width:100%; height:100%; object-fit:cover;">`;
        } else {
            profileIconBox.innerHTML = `<i class="fas fa-user-circle"></i>`;
        }
        profileAction.onclick = () => navigate(State.user.role);
    } else {
        nameSpan.style.display = 'none';
        profileIconBox.innerHTML = `<i class="fas fa-user"></i>`;
        profileAction.onclick = () => navigate('login');
    }

    const loginText = document.getElementById('login-text');
    loginText.innerText = State.user ? State.user.role.toUpperCase() : 'LOGIN';

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === view);
    });

    render();
}

function attachNavListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-page');
            if (view === 'search') openSearchModal();
            else if (view === 'login' && State.user) navigate(State.user.role);
            else navigate(view);
        };
    });
}

// --- Main Render Function ---
function render() {
    const app = document.getElementById('app');
    app.innerHTML = '';

    switch (State.view) {
        case 'home': renderHome(app); break;
        case 'likes': renderLikes(app); break;
        case 'login': renderLogin(app); break;
        case 'admin': renderAdmin(app); break;
        case 'agent': renderAgent(app); break;
        case 'details': renderDetails(app); break;
        case 'signup': renderSignup(app); break;
    }
}

// --- Shared Components ---
function renderPropertyCard(p) {
    const isLiked = State.likes.includes(p.id);
    return `
        <div class="prop-card" onclick="navigate('details', ${p.id})">
            <div class="prop-img-box">
                <img src="${p.image}" alt="">
                <div class="prop-like-btn" onclick="toggleLike(event, ${p.id})">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart" style="color:${isLiked ? '#D32F2F' : 'white'}"></i>
                </div>
            </div>
            <div class="prop-body">
                <div style="font-size: 1.1rem; color: #48BB78; font-weight: 800; margin-bottom: 2px;">
                    ₹ ${p.priceSqft} / sq. ft.
                </div>
                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7); font-weight: 600; margin-bottom: 8px;">
                    Price: ₹ ${p.price} | Area: ${p.area}
                </div>
                <h4 style="margin: 5px 0 2px 0; font-size: 1rem; color: #FFFFFF; font-weight: 700;">${p.title}</h4>
                <div style="font-size: 0.85rem; color: #FF9933; font-weight: 700; margin-bottom: 10px;">
                    <i class="fas fa-map-marker-alt" style="font-size: 0.75rem;"></i> ${p.city.toUpperCase()}
                </div>
                ${State.settings.showDate ? `
                    <div style="font-size: 0.7rem; color: #999; margin-bottom: 10px;">
                        <i class="fas fa-clock"></i> ${p.createdAt || 'N/A'}
                    </div>
                ` : ''}
                <button class="prop-btn">विवरण देखें</button>
            </div>
        </div>
    `;
}

// --- Views Implementation ---

function renderHome(container) {
    let props = State.properties.filter(p => p.status === 'approved');
    props.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    const banners = [
        { img: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200", title: "Dream Home Awaits" },
        { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200", title: "Luxury Villas" },
        { img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200", title: "Prime Plots" }
    ];

    container.innerHTML = `
        <div class="hero-slider" id="hero-slider">
            <div class="slider-track" id="slider-track">
                ${banners.map(b => `
                    <div class="slide">
                        <img src="${b.img}" alt="">
                        <div class="slide-content">
                            <h2 style="font-size:1.5rem; color:white;">${b.title}</h2>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="slider-dots" id="slider-dots">
                ${banners.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`).join('')}
            </div>
        </div>

        <div style="padding: 0 15px; margin-top: -30px; position: relative; z-index: 10;">
            <div class="search-bar-wrap" onclick="openSearchModal()" style="background: #ffffff; border: 2.5px solid #FF9933; border-radius: 50px; padding: 12px 20px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); display: flex; align-items: center; cursor: pointer;">
                <div class="search-simple" style="display: flex; align-items: center; gap: 12px; width: 100%;">
                    <div style="width: 40px; height: 40px; background: #FF9933; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-search" style="color: white; font-size: 1.1rem;"></i>
                    </div>
                    <span style="color: #666; font-weight: 600; font-size: 1.05rem;">Search City, Property...</span>
                </div>
                <div style="background: #f1f3f4; padding: 5px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; color: #FF9933; border: 1px solid #FF9933;">BROWSE</div>
            </div>
        </div>

        <div class="property-grid">
            ${props.map(p => renderPropertyCard(p)).join('')}
        </div>
    `;
    startSlider();
}

let sliderInterval;
let currentSlide = 0;
function startSlider() {
    if (sliderInterval) clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % 3;
        updateSlider();
    }, 4000);
}
function updateSlider() {
    const track = document.getElementById('slider-track');
    const dots = document.querySelectorAll('.dot');
    if (!track) return;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}
window.goToSlide = (idx) => { currentSlide = idx; updateSlider(); startSlider(); };

function renderLikes(container) {
    const likedProps = State.properties.filter(p => State.likes.includes(p.id) && p.status === 'approved');
    container.innerHTML = `
        <div class="likes-page">
            <div style="background: linear-gradient(to right, #FF9933, #FFFFFF, #138808); padding: 15px; border-radius: 15px; margin-bottom: 25px; text-align: center; border: 2px solid rgba(0,0,0,0.05);">
                <h2 style="margin:0; color:#1a2a3a; font-size:1.4rem; font-weight:900;"><i class="fas fa-heart" style="color:#D32F2F;"></i> मेरी पसंदीदा</h2>
            </div>
            ${likedProps.length === 0 ? `<div style="text-align:center; padding:50px; color:#999;">कुछ पसंद नहीं किया।</div>` : `<div class="property-grid">${likedProps.map(p => renderPropertyCard(p)).join('')}</div>`}
        </div>
    `;
}

function renderLogin(container) {
    let activeRole = 'agent';
    const renderContent = () => {
        container.innerHTML = `
            <div class="login-wrap">
                <div class="login-box">
                    <div class="role-tab-switcher">
                        <button class="role-tab ${activeRole === 'agent' ? 'active' : ''}" onclick="setRole('agent')">Agent</button>
                        <button class="role-tab ${activeRole === 'customer' ? 'active' : ''}" onclick="setRole('customer')">Customer</button>
                        <button class="role-tab ${activeRole === 'admin' ? 'active' : ''}" onclick="setRole('admin')">Admin</button>
                    </div>
                    <h2 style="color:#1a2a3a; margin-bottom:20px;">Welcome Back!</h2>
                    <input type="text" id="login-id" placeholder="Email or Phone Number" class="form-group" style="margin-bottom:15px; width:100%; padding:15px; border-radius:12px; border:1px solid #ddd;">
                    <input type="password" id="pass" placeholder="Password" class="form-group" style="margin-bottom:15px; width:100%; padding:15px; border-radius:12px; border:1px solid #ddd;">
                    <button class="login-btn" onclick="handleLogin('${activeRole}')">Login</button>
                    ${activeRole !== 'admin' ? `<p style="margin-top:20px;">Don't have an account? <a href="#" onclick="navigate('signup')" style="color:#138808; font-weight:700;">Sign Up</a></p>` : ''}
                </div>
            </div>
        `;
    };
    window.setRole = (r) => { activeRole = r; renderContent(); };
    renderContent();
}

function handleLogin(role) {
    const loginId = document.getElementById('login-id').value;
    const pass = document.getElementById('pass').value;
    if (role === 'admin') {
        if (loginId === 'admin@bhumidekho.com' && pass === 'admin123') { State.user = { role: 'admin', name: 'Super Admin' }; navigate('admin'); }
        else alert("Wrong Credentials");
    } else if (role === 'agent') {
        const agent = State.agents.find(a => (a.email === loginId || a.phone === loginId) && a.password === pass);
        if (agent) {
            if (agent.status === 'blocked') { alert("आपका अकाउंट ब्लॉक किया गया है।"); return; }
            if (agent.status === 'approved') { State.user = { role: 'agent', name: agent.name, id: agent.id, photo: agent.photo }; navigate('agent'); }
            else alert("Approval pending.");
        } else alert("Wrong Credentials");
    } else {
        State.user = { role: 'customer', name: 'Guest User' }; navigate('home');
    }
    saveGlobalData();
}

function renderSignup(container) {
    container.innerHTML = `
        <div class="login-wrap">
            <div class="login-box" style="max-width:400px;">
                <h2 style="color:#1a2a3a; margin-bottom:20px;">Agent Registration</h2>
                <div class="form-group"><label>Full Name</label><input type="text" id="s-name" placeholder="Enter name" class="login-input"></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Phone</label><input type="text" id="s-phone" placeholder="987xxxx" class="login-input"></div>
                    <div class="form-group"><label>City</label><input type="text" id="s-city" placeholder="Padrauna" class="login-input"></div>
                </div>
                <div class="form-group"><label>Email Address</label><input type="email" id="s-email" placeholder="email@example.com" class="login-input"></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Password</label><input type="password" id="s-pass" placeholder="Create password" class="login-input"></div>
                    <div class="form-group"><label>Confirm</label><input type="password" id="s-cpass" placeholder="Repeat password" class="login-input"></div>
                </div>
                <div class="form-group"><label>Profile Photo</label><input type="file" id="s-photo" accept="image/*" class="login-input"></div>
                <button class="login-btn" onclick="handleSignup()">Register Now</button>
                <p style="margin-top:15px; font-size:0.85rem;">Already have an account? <a href="#" onclick="navigate('login')" style="color:#138808; font-weight:700;">Login</a></p>
            </div>
        </div>`;
}

async function handleSignup() {
    const name = document.getElementById('s-name').value;
    const phone = document.getElementById('s-phone').value;
    const city = document.getElementById('s-city').value;
    const email = document.getElementById('s-email').value;
    const pass = document.getElementById('s-pass').value;
    const cpass = document.getElementById('s-cpass').value;
    const photoFile = document.getElementById('s-photo').files[0];

    if (!name || !phone || !email || !pass || !cpass || !city || !photoFile) return alert("Please fill all fields and upload a photo");

    // Check for unique phone number
    if (State.agents.find(a => a.phone === phone)) return alert("This mobile number is already registered!");

    // Check for unique email
    if (State.agents.find(a => a.email === email)) return alert("This email address is already registered!");

    // Check for password match
    if (pass !== cpass) return alert("Passwords do not match!");

    const photoData = await toBase64(photoFile);

    State.agents.push({
        id: Date.now(),
        name,
        phone,
        city,
        email,
        password: pass,
        photo: photoData,
        status: 'pending',
        wallet: 0
    });

    saveGlobalData();
    navigate('login');
    alert("Registered successfully! Your account is pending admin approval.");
}

function renderAdmin(container) {
    const tab = State.adminTab || 'dashboard';
    const stats = [
        { label: 'Properties', val: State.properties.length },
        { label: 'Agents', val: State.agents.length },
        { label: 'Wallet Balance', val: '₹ ' + State.adminWallet.toLocaleString() }
    ];
    container.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar">
                <div class="logo" style="color:white; margin-bottom:40px;"><i class="fas fa-home-alt"></i> BhumiDekho</div>
                <nav class="side-nav">
                    <a href="#" class="side-link ${tab === 'dashboard' ? 'active' : ''}" onclick="setAdminTab('dashboard')"><i class="fas fa-th-large"></i> Dashboard</a>
                    <a href="#" class="side-link ${tab === 'properties' ? 'active' : ''}" onclick="setAdminTab('properties')"><i class="fas fa-building"></i> Properties</a>
                    <a href="#" class="side-link ${tab === 'agents' ? 'active' : ''}" onclick="setAdminTab('agents')"><i class="fas fa-users"></i> Agents</a>
                    <a href="#" class="side-link ${tab === 'withdrawals' ? 'active' : ''}" onclick="setAdminTab('withdrawals')"><i class="fas fa-money-bill-wave"></i> Withdrawals</a>
                    <a href="#" class="side-link ${tab === 'adminWallet' ? 'active' : ''}" onclick="setAdminTab('adminWallet')"><i class="fas fa-wallet"></i> My Wallet</a>
                    <a href="#" class="side-link" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </nav>
            </aside>
            <main class="dash-main">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <div>
                        <h1 style="font-size:1.5rem;">Admin Dashboard</h1>
                        <div style="margin-top:8px; padding:8px 15px; background:linear-gradient(135deg, #138808, #28a745); color:white; border-radius:30px; display:inline-flex; align-items:center; gap:8px; font-weight:700;">
                            <i class="fas fa-wallet"></i> Wallet Balance: ₹ ${State.adminWallet.toLocaleString()}
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="prop-btn" style="width:auto; padding:10px 20px; background:${State.settings.showDate ? '#138808' : '#D32F2F'};" onclick="toggleDateSetting()">
                            <i class="fas fa-eye${State.settings.showDate ? '' : '-slash'}"></i> ${State.settings.showDate ? 'Hide Date' : 'Show Date'} on Site
                        </button>
                        <button class="prop-btn" style="width:auto; padding:10px 20px;" onclick="showPropertyModal()">+ Add Property</button>
                    </div>
                </div>
                ${tab === 'dashboard' ? `<div class="stats-row">${stats.map(s => `<div class="stat-box"><div class="stat-num">${s.val}</div><div class="stat-tag">${s.label}</div></div>`).join('')}</div>` : ''}
                ${tab === 'properties' ? `
                    <div class="stat-box" style="margin-bottom:20px;"><input type="text" placeholder="Search properties..." oninput="updateAdminSearch(this.value)" value="${State.adminSearch}" style="width:100%; border:none; outline:none;"></div>
                    <div class="stat-box" style="padding:0; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead style="background:#f8f9fa;"><tr><th style="padding:15px; text-align:left;">S.No</th><th style="padding:15px; text-align:left;">Property</th><th style="padding:15px; text-align:left;">Agent Info</th><th style="padding:15px; text-align:left;">Price</th><th style="padding:15px; text-align:left;">Status</th><th style="padding:15px; text-align:left;">Featured</th><th style="padding:15px; text-align:right;">Action</th></tr></thead>
                            <tbody>
                                ${[...State.properties].sort((a, b) => b.id - a.id).filter(p => p.title.toLowerCase().includes(State.adminSearch.toLowerCase())).map((p, index) => {
        const agent = State.agents.find(a => a.name === p.agent);
        const agentPhone = agent ? agent.phone : (p.agent.includes('John') ? '9876543210' : 'N/A');
        return `
                                        <tr style="border-top:1px solid #eee;">
                                            <td style="padding:15px; font-weight:700; color:#138808;">#${index + 1}</td>
                                            <td style="padding:15px;">
                                                <div><strong>${p.title}</strong></div>
                                                <div style="font-size:0.75rem; color:#999;">${p.city}</div>
                                                <div style="font-size:0.7rem; color:#666; margin-top:4px;"><i class="fas fa-calendar-alt"></i> ${p.createdAt || 'N/A'}</div>
                                            </td>
                                            <td style="padding:15px;"><div><strong>${p.agent}</strong></div><div style="font-size:0.75rem; color:#138808; font-weight:700;"><i class="fas fa-phone-alt"></i> ${agentPhone}</div></td>
                                            <td style="padding:15px;">₹ ${p.price}</td>
                                            <td style="padding:15px;">
                                                <span style="padding:4px 10px; border-radius:50px; font-size:0.7rem; font-weight:700; background:${p.status === 'approved' ? '#e8f5e9' : (p.status === 'disabled' ? '#ffebee' : (p.status === 'sold' ? '#e0f2f1' : '#fff3e0'))}; color:${p.status === 'approved' ? '#2e7d32' : (p.status === 'disabled' ? '#D32F2F' : (p.status === 'sold' ? '#00796b' : '#e65100'))};">${p.status.toUpperCase()}</span>
                                                ${p.status === 'disabled' && p.disableReason ? `<div style="font-size:0.7rem; color:#D32F2F; margin-top:5px; font-weight:600; max-width:150px; line-height:1.2;">Reason: ${p.disableReason}</div>` : ''}
                                            </td>
                                            <td style="padding:15px;"><button onclick="toggleFeature(${p.id})" style="border:none; padding:5px 10px; border-radius:4px; font-weight:700; background:${p.featured ? '#FF9933' : '#eee'}; color:${p.featured ? 'white' : '#999'};">${p.featured ? 'FEATURED' : 'MARK FEATURED'}</button></td>
                                            <td style="padding:15px; text-align:right;">
                                                <div style="display:flex; flex-direction:column; gap:5px; align-items:end;">
                                                    <div style="display:flex; gap:5px;">
                                                        <button style="background:none; border:1px solid #ddd; padding:5px 10px; border-radius:5px;" onclick="editProperty(${p.id})">Edit</button>
                                                        ${p.status === 'approved' ? `<button style="background:#D32F2F; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="disableProperty(${p.id})">Disable</button>` :
                (p.status === 'disabled' || p.status === 'sold' ? `<button style="background:#138808; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="approveProperty(${p.id})">Enable</button>` : '')}
                                                    </div>
                                                    <div style="display:flex; gap:5px;">
                                                        ${p.status !== 'sold' ? `<button style="background:#00796b; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="markAsSold(${p.id})">Mark Sold</button>` :
                `<button style="background:#FF9933; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="markAsUnsold(${p.id})">Unsold</button>`}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
    }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                ${tab === 'agents' ? `
                    <div class="stat-box" style="padding:0; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead style="background:#f8f9fa;">
                                <tr>
                                    <th style="padding:15px; text-align:left;">S.No</th>
                                    <th style="padding:15px; text-align:left;">Agent</th>
                                    <th style="padding:15px; text-align:left;">Contact Info</th>
                                    <th style="padding:15px; text-align:left;">Status</th>
                                    <th style="padding:15px; text-align:right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${State.agents.map((a, index) => {
        const statusColor = a.status === 'approved' ? '#2e7d32' : (a.status === 'blocked' ? '#D32F2F' : '#e65100');
        const statusBg = a.status === 'approved' ? '#e8f5e9' : (a.status === 'blocked' ? '#ffebee' : '#fff3e0');
        return `
                                        <tr style="border-top:1px solid #eee;">
                                            <td style="padding:15px; font-weight:700; color:#138808;">#${index + 1}</td>
                                            <td style="padding:15px;">
                                                <div style="display:flex; align-items:center; gap:10px;">
                                                    <div style="width:35px; height:35px; background:#f0f2f5; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#1a2a3a; font-weight:800; overflow:hidden;">
                                                        ${a.photo ? `<img src="${a.photo}" style="width:100%; height:100%; object-fit:cover;">` : a.name.charAt(0)}
                                                    </div>
                                                    <strong>${a.name}</strong>
                                                </div>
                                            </td>
                                            <td style="padding:15px;">
                                                <div><i class="fas fa-envelope" style="font-size:0.75rem; color:#999;"></i> ${a.email}</div>
                                                <div style="font-size:0.85rem; color:#138808; font-weight:700;"><i class="fas fa-phone-alt" style="font-size:0.75rem;"></i> ${a.phone || 'N/A'}</div>
                                            </td>
                                            <td style="padding:15px;">
                                                <span style="padding:5px 12px; border-radius:50px; font-size:0.75rem; font-weight:800; background:${statusBg}; color:${statusColor}; text-transform:uppercase;">
                                                    ${a.status}
                                                </span>
                                            </td>
                                            <td style="padding:15px; text-align:right;">
                                                ${a.status === 'pending' ? `<button style="background:#138808; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="approveAgent(${a.id})">Approve</button>` : ''}
                                                ${a.status === 'approved' ? `<button style="background:#1a2a3a; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="blockAgent(${a.id})">Block</button>` : ''}
                                                 ${a.status === 'blocked' ? `<button style="background:#FF9933; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="approveAgent(${a.id})">Unblock</button>` : ''}
                                                 <button style="background:#138808; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-left:5px;" onclick="manageWallet(${a.id})"><i class="fas fa-wallet"></i> Wallet</button>
                                                 <button style="background:#eee; color:#1a2a3a; border:1px solid #ddd; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-left:5px;" onclick="editAgent(${a.id})">Edit</button>
                                                 <button style="background:none; border:1px solid #D32F2F; color:#D32F2F; padding:5px 10px; border-radius:6px; margin-left:5px; font-weight:600; cursor:pointer;" onclick="rejectAgent(${a.id})">Remove</button>
                                            </td>
                                        </tr>
                                    `;
    }).join('')}
                                ${State.agents.length === 0 ? `<tr><td colspan="4" style="padding:40px; text-align:center; color:#999;">No agents found.</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                ${tab === 'withdrawals' ? `
                    <div class="stat-box" style="padding:0; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead style="background:#f8f9fa;">
                                <tr>
                                    <th style="padding:15px; text-align:left;">Agent</th>
                                    <th style="padding:15px; text-align:left;">Amount</th>
                                    <th style="padding:15px; text-align:left;">Date</th>
                                    <th style="padding:15px; text-align:left;">Status</th>
                                    <th style="padding:15px; text-align:right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(State.withdrawalRequests || []).sort((a, b) => b.id - a.id).map(r => `
                                    <tr style="border-top:1px solid #eee;">
                                        <td style="padding:15px;"><strong>${r.agentName}</strong></td>
                                        <td style="padding:15px;"><strong style="color:#138808;">₹ ${r.amount}</strong></td>
                                        <td style="padding:15px; font-size:0.85rem; color:#666;">${r.date}</td>
                                        <td style="padding:15px;">
                                            <span style="padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:800; background:${r.status === 'approved' ? '#e8f5e9' : (r.status === 'rejected' ? '#ffebee' : '#fff3e0')}; color:${r.status === 'approved' ? '#2e7d32' : (r.status === 'rejected' ? '#D32F2F' : '#e65100')}; text-transform:uppercase;">
                                                ${r.status}
                                            </span>
                                            ${r.remark ? `<div style="font-size:0.7rem; color:#666; font-style:italic; margin-top:4px;">"${r.remark}"</div>` : ''}
                                        </td>
                                        <td style="padding:15px; text-align:right;">
                                            ${r.status === 'pending' ? `
                                                <button style="background:#138808; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="processWithdrawal(${r.id}, 'approved')">Approve</button>
                                                <button style="background:#D32F2F; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-left:5px;" onclick="processWithdrawal(${r.id}, 'rejected')">Reject</button>
                                            ` : '<span style="color:#999; font-size:0.8rem; font-weight:600;">PROCESSED</span>'}
                                        </td>
                                    </tr>
                                `).join('')}
                                ${(State.withdrawalRequests || []).length === 0 ? `<tr><td colspan="5" style="padding:40px; text-align:center; color:#999;">No withdrawal requests found.</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                ${tab === 'adminWallet' ? `
                    <div style="max-width:800px;">
                        <div class="stat-box" style="background:linear-gradient(135deg, #FF9933, #138808); color:white; padding:40px; border-radius:20px; text-align:center; margin-bottom:30px;">
                            <i class="fas fa-wallet" style="font-size:3rem; margin-bottom:15px; opacity:0.9;"></i>
                            <div style="font-size:0.9rem; opacity:0.9; text-transform:uppercase; letter-spacing:1px;">Admin Wallet Balance</div>
                            <div style="font-size:3rem; font-weight:900; margin:15px 0;">₹ ${State.adminWallet.toLocaleString()}</div>
                            <button class="prop-btn" style="background:white; color:#138808; width:auto; padding:12px 30px; margin-top:10px; border-radius:50px; font-weight:800;" 
                                onclick="addAdminBalance()"><i class="fas fa-plus-circle"></i> Add Balance</button>
                        </div>
                        
                        <div style="background:white; border-radius:15px; padding:25px; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                            <h3 style="margin-bottom:20px; color:#1a2a3a; display:flex; align-items:center; gap:10px;">
                                <i class="fas fa-history"></i> Transaction History
                            </h3>
                            ${(State.walletTransactions || [])
                .filter(t => t.type === 'admin_credit' || t.type === 'admin_debit')
                .sort((a, b) => b.id - a.id)
                .map(t => `
                                    <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #f0f0f0;">
                                        <div>
                                            <div style="font-weight:700; color:#1a2a3a; margin-bottom:4px;">
                                                ${t.type === 'admin_credit' ? '<span style="color:#138808;">+ ₹ ' + t.amount.toLocaleString() + '</span>' : '<span style="color:#D32F2F;">- ₹ ' + t.amount.toLocaleString() + '</span>'}
                                            </div>
                                            <div style="font-size:0.75rem; color:#999;">${t.date}</div>
                                            ${t.remark ? `<div style="font-size:0.75rem; color:#666; font-style:italic; margin-top:4px;">"${t.remark}"</div>` : ''}
                                        </div>
                                        <span style="font-size:0.75rem; font-weight:800; color:${t.type === 'admin_credit' ? '#138808' : '#D32F2F'}; text-transform:uppercase;">
                                            ${t.type === 'admin_credit' ? 'CREDIT' : 'DEBIT'}
                                        </span>
                                    </div>
                                `).join('')}
                            ${(State.walletTransactions || []).filter(t => t.type === 'admin_credit' || t.type === 'admin_debit').length === 0 ?
                `<div style="text-align:center; padding:40px; color:#999;">
                                    <i class="fas fa-inbox" style="font-size:3rem; margin-bottom:10px; opacity:0.3;"></i><br>
                                    No transactions yet
                                </div>` : ''}
                        </div>
                    </div>
                ` : ''}
            </main>
        </div>
    `;
}

window.setAdminTab = (t) => { State.adminTab = t; render(); };
window.updateAdminSearch = (v) => { State.adminSearch = v; render(); };
window.toggleFeature = (id) => { const p = State.properties.find(x => x.id === id); if (p) { p.featured = !p.featured; saveGlobalData(); render(); } };

function renderAgent(container) {
    const tab = State.agentTab || 'dashboard';
    const agent = State.agents.find(a => a.id === State.user.id) || State.agents[0] || { name: State.user.name, wallet: 0 };
    const agentProps = State.properties.filter(p =>
        (p.agent === agent.name || p.agent.includes(agent.name.split(' ')[0])) &&
        p.title.toLowerCase().includes((State.agentSearch || '').toLowerCase())
    ).sort((a, b) => b.id - a.id);

    // Calculate Stats
    const totalViews = agentProps.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLeads = agentProps.reduce((acc, p) => acc + (p.leads || 0), 0);

    const stats = [
        { label: 'My Properties', val: agentProps.length, icon: 'fa-building', color: '#138808' },
        { label: 'Total Views', val: totalViews, icon: 'fa-eye', color: '#FF9933' },
        { label: 'Total Leads', val: totalLeads, icon: 'fa-user-tie', color: '#1a2a3a' },
        { label: 'Wallet Balance', val: `₹ ${agent.wallet || 0}`, icon: 'fa-wallet', color: '#138808' }
    ];

    container.innerHTML = `
        <div class="dashboard-layout">
            <aside class="sidebar agent">
                <div class="logo" style="margin-bottom:30px; color:white; font-size:1.5rem;">
                    <i class="fas fa-user-circle"></i> Agent Panel
                </div>
                <nav class="side-nav">
                    <a href="#" class="side-link ${tab === 'dashboard' ? 'active' : ''}" onclick="setAgentTab('dashboard')">
                        <i class="fas fa-th-large"></i> Dashboard
                    </a>
                    <a href="#" class="side-link ${tab === 'properties' ? 'active' : ''}" onclick="setAgentTab('properties')">
                        <i class="fas fa-building"></i> My Properties
                    </a>
                    <a href="#" class="side-link ${tab === 'wallet' ? 'active' : ''}" onclick="setAgentTab('wallet')">
                        <i class="fas fa-wallet"></i> Wallet
                    </a>
                    <a href="#" class="side-link" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </nav>
            </aside>
            <main class="dash-main">
                <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <div>
                        <h1 style="font-size:1.6rem; color:#1a2a3a;">Welcome, ${State.user.name}</h1>
                        <p style="font-size:0.85rem; color:#666;">Manage your listings and track performance.</p>
                    </div>
                    ${tab === 'properties' ? `<button class="prop-btn" style="width:auto; padding:12px 25px;" onclick="showPropertyModal()">+ Add New Property</button>` : ''}
                </header>

                ${tab === 'dashboard' ? `
                    <div class="stats-row">
                        ${stats.map(s => `
                            <div class="stat-box" style="border-left:5px solid ${s.color};">
                                <i class="fas ${s.icon}" style="float:right; color:#eee; font-size:2rem;"></i>
                                <div class="stat-num" style="color:${s.color}">${s.val}</div>
                                <div class="stat-tag">${s.label}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top:30px;">
                        <h3 style="margin-bottom:15px; color:#1a2a3a;">Performance Chart</h3>
                        <div style="background:white; border-radius:15px; padding:40px; text-align:center; color:#999; border:1.5px dashed #ddd;">
                            <i class="fas fa-chart-line" style="font-size:3rem; margin-bottom:10px;"></i><br>
                            Insights and performance charts will appear here.
                        </div>
                    </div>
                ` : ''}

                ${tab === 'properties' ? `
                    <div class="property-grid">
                        ${agentProps.length === 0 ? `
                            <div style="grid-column:1/-1; text-align:center; padding:50px; background:white; border-radius:15px;">
                                <i class="fas fa-building" style="font-size:3rem; color:#ddd; margin-bottom:15px;"></i><br>
                                No properties found. Add your first listing!
                            </div>
                        ` : agentProps.map(p => `
                            <div class="prop-card">
                                <div class="prop-img-box">
                                    <img src="${p.image}" alt="">
                                    <div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; align-items:end; gap:5px;">
                                        <div style="background:rgba(0,0,0,0.6); color:white; padding:4px 10px; border-radius:30px; font-size:0.7rem;">
                                            ${p.status.toUpperCase()}
                                        </div>
                                        ${p.status === 'disabled' && p.disableReason ? `<div style="background:#D32F2F; color:white; padding:4px 8px; border-radius:5px; font-size:0.6rem; font-weight:600; max-width:120px; text-align:right;">Reason: ${p.disableReason}</div>` : ''}
                                    </div>
                                </div>
                                <div class="prop-body">
                                    <div style="display:flex; justify-content:space-between; align-items:start;">
                                        <div style="color:#138808; font-weight:800; font-size:1.1rem; margin-bottom:5px;">₹ ${p.price}</div>
                                        <div style="font-size:0.65rem; color:#999; text-align:right;">${p.createdAt || ''}</div>
                                    </div>
                                    <h4 style="color:white; font-size:1rem; margin-bottom:10px;">${p.title}</h4>
                                    <div style="display:flex; gap:8px;">
                                        <button class="prop-btn" style="background:#1a2a3a; font-size:0.75rem; flex:1;" onclick="editProperty(${p.id})">Edit Details</button>
                                        ${p.status !== 'sold' ? `<button class="prop-btn" style="background:#00796b; font-size:0.75rem; flex:1;" onclick="markAsSold(${p.id})">Mark Sold</button>` : ''}
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${tab === 'wallet' ? `
                    <div style="max-width:600px;">
                        <div class="stat-box" style="background:linear-gradient(135deg, #138808, #28a745); color:white; padding:30px; border-radius:20px; text-align:center;">
                            <i class="fas fa-wallet" style="font-size:2.5rem; margin-bottom:15px; opacity:0.8;"></i>
                            <div style="font-size:0.9rem; opacity:0.9; text-transform:uppercase; letter-spacing:1px;">Available Balance</div>
                            <div style="font-size:2.5rem; font-weight:900; margin:10px 0;">₹ ${agent.wallet || 0}</div>
                            <button class="prop-btn" style="background:white; color:#138808; width:auto; padding:12px 30px; margin-top:10px; border-radius:50px;" 
                                onclick="requestWithdrawal(${agent.id})">Request Withdrawal</button>
                        </div>
                        
                        <div style="margin-top:30px; background:white; border-radius:15px; padding:20px; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                            <h3 style="margin-bottom:15px; color:#1a2a3a;">Transaction History</h3>
                            ${[...(State.walletTransactions || []).filter(t => t.agentId === agent.id),
            ...(State.withdrawalRequests || []).filter(r => r.agentId === agent.id).map(r => ({
                id: r.id, agentId: r.agentId, amount: r.amount, type: 'withdrawal',
                status: r.status, date: r.date, remark: r.remark
            }))]
                .sort((a, b) => b.id - a.id)
                .map(t => `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f0f0f0;">
                                    <div>
                                        <div style="font-weight:700; color:#1a2a3a;">
                                            ${t.type === 'credit' ? '<span style="color:#138808;">+ ₹ ' + t.amount + '</span>' : '<span style="color:#D32F2F;">- ₹ ' + t.amount + '</span>'}
                                        </div>
                                        <div style="font-size:0.75rem; color:#999;">${t.date} • ${t.type.toUpperCase()}</div>
                                        ${t.remark ? `<div style="font-size:0.7rem; color:#666; font-style:italic;">"${t.remark}"</div>` : ''}
                                    </div>
                                    <span style="font-size:0.75rem; font-weight:800; color:${t.status === 'approved' ? '#138808' : (t.status === 'rejected' ? '#D32F2F' : (t.type === 'credit' ? '#138808' : '#FF9933'))}">
                                        ${t.status ? t.status.toUpperCase() : 'SUCCESS'}
                                    </span>
                                </div>
                            `).join('')}
                            ${((State.walletTransactions || []).filter(t => t.agentId === agent.id).length === 0 && (State.withdrawalRequests || []).filter(r => r.agentId === agent.id).length === 0) ? `<div style="text-align:center; padding:30px; color:#999;">No transaction history found.</div>` : ''}
                        </div>
                    </div>
                ` : ''}
            </main>
        </div>
    `;
}

window.setAgentTab = (tab) => { State.agentTab = tab; render(); };

function renderDetails(container) {
    const p = State.properties.find(x => x.id === State.selectedPropertyId) || State.properties[0];
    let activeTab = 'Details';

    const renderContent = () => {
        let contentHtml = '';
        if (activeTab === 'Details') {
            contentHtml = `
                <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800; font-size:1.3rem;">भूमि का विवरण</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:0.75rem; text-transform:uppercase; font-weight:700;">Area</span><br>
                        <strong style="color:#138808; font-size:1.2rem;">${p.area}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:0.75rem; text-transform:uppercase; font-weight:700;">Price/sq.ft</span><br>
                        <strong style="color:#138808; font-size:1.2rem;">₹ ${p.priceSqft}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:0.75rem; text-transform:uppercase; font-weight:700;">City</span><br>
                        <strong style="color:#1a2a3a;">${p.city}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:0.75rem; text-transform:uppercase; font-weight:700;">Type</span><br>
                        <strong style="color:#1a2a3a;">${p.category}</strong>
                    </div>
                </div>
                <div style="margin-top:25px; background:#ffffff; padding:20px; border-radius:18px; border:1.5px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                    <h4 style="margin-bottom:12px; color:#138808; font-weight:800;"><i class="fas fa-file-alt"></i> विवरण (Description)</h4>
                    <p style="font-size:1rem; color:#444; line-height:1.8;">${p.description}</p>
                </div>
            `;
        } else if (activeTab === 'Photos') {
            contentHtml = `
                <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800;">Gallery</h3>
                <div style="background:white; padding:10px; border-radius:15px; border:1px solid #eee;">
                    <img src="${p.image}" style="width:100%; border-radius:10px; display:block;">
                </div>
            `;
        } else if (activeTab === 'Video') {
            const vidId = getYouTubeID(p.video);
            contentHtml = `
                <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800;">Video Tour</h3>
                ${vidId ? `
                    <div style="position:relative; padding-bottom:56.25%; height:0; border-radius:15px; overflow:hidden; border:1px solid #eee;">
                        <iframe style="position:absolute; top:0; left:0; width:100%; height:100%;" 
                            src="https://www.youtube.com/embed/${vidId}" frameborder="0" allowfullscreen></iframe>
                    </div>
                ` : `
                    <div style="text-align:center; padding:50px; background:white; border-radius:15px; border:1px solid #eee; color:#999;">
                        <i class="fab fa-youtube" style="font-size:3rem; margin-bottom:10px;"></i><br>वीडियो उपलब्ध नहीं है।
                    </div>
                `}
            `;
        } else if (activeTab === 'Map') {
            contentHtml = `
                <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800;">Location Map</h3>
                <div style="text-align:center; padding:40px; background:white; border-radius:15px; border:1px solid #eee;">
                    <i class="fas fa-map-marked-alt" style="font-size:3rem; color:#138808; margin-bottom:15px;"></i><br>
                    <a href="${p.map || '#'}" target="_blank" class="btn-green-fill" style="padding:12px 25px; border-radius:30px; display:inline-flex; width:auto;">View on Google Maps</a>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="details-view">
                <div class="details-hero">
                    <img src="${p.image}" alt="">
                    <div style="position:absolute; top:20px; left:20px; background:rgba(255,255,255,0.9); color:#1a2a3a; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.2);" onclick="navigate('home')">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                </div>
                <div class="details-tabs" style="display:flex; gap:8px; padding:12px; background:white; position:sticky; top:0; z-index:100; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                    ${['Details', 'Photos', 'Video', 'Map'].map(t => `
                        <button class="detail-tab ${activeTab === t ? 'active' : ''}" onclick="setDetailTab('${t}')">${t}</button>
                    `).join('')}
                </div>
                <div style="padding:20px; padding-bottom:120px;">${contentHtml}</div>
                <div class="contact-footer" style="padding:15px 20px 25px;">
                    <a href="tel:${p.mobile || '0000000000'}" class="btn-green-fill">
                        <i class="fas fa-phone-alt"></i> कॉल करें
                    </a>
                    <a href="https://wa.me/91${p.whatsapp || '0000000000'}" target="_blank" class="btn-green-outline">
                        <i class="fab fa-whatsapp"></i> व्हाट्सएप
                    </a>
                </div>
            </div>`;
    };
    window.setDetailTab = (t) => { activeTab = t; renderContent(); };
    renderContent();
}

function showPropertyModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Add New Property</h3>
            <form id="add-prop-form">
                <div class="form-group"><label>Property Title</label><input id="p-title" required placeholder="e.g. Modern Villa"></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>City</label><input id="p-city" required placeholder="Padrauna"></div>
                    <div class="form-group"><label>Category</label><select id="p-cat"><option>Residential</option><option>Plot</option><option>Commercial</option></select></div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Total Price</label><input id="p-price" required placeholder="85 Lakh"></div>
                    <div class="form-group"><label>Area (Sq.ft/Bigha)</label><input id="p-area" required placeholder="1500 sq.ft"></div>
                </div>
                <div class="form-group"><label>Price per Sq.ft</label><input id="p-sqft" required placeholder="5000"></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Mobile Number</label><input id="p-mobile" type="tel" required placeholder="9876543210"></div>
                    <div class="form-group"><label>WhatsApp Number</label><input id="p-whatsapp" type="tel" required placeholder="9876543210"></div>
                </div>
                <div class="form-group"><label>Description</label><textarea id="p-desc" rows="3" placeholder="Explain details..."></textarea></div>
                <div class="form-group"><label>Property Image</label><input type="file" id="p-img" accept="image/*" required></div>
                <div class="form-group"><label>YouTube Link (Optional)</label><input id="p-video" placeholder="Paste link..."></div>
                <div class="form-group"><label>Map Link (Optional)</label><input id="p-map" placeholder="Paste link..."></div>
                <button type="submit" class="login-btn">Submit Property</button>
                <button type="button" class="prop-btn" style="background:none; color:#D32F2F;" onclick="closeModal()">Cancel</button>
            </form>
        </div>`;

    document.getElementById('add-prop-form').onsubmit = async (e) => {
        e.preventDefault();
        const imgFile = document.getElementById('p-img').files[0];
        const imgData = await toBase64(imgFile);

        State.properties.push({
            id: Date.now(),
            title: document.getElementById('p-title').value,
            city: document.getElementById('p-city').value,
            category: document.getElementById('p-cat').value,
            price: document.getElementById('p-price').value,
            area: document.getElementById('p-area').value,
            priceSqft: document.getElementById('p-sqft').value,
            mobile: document.getElementById('p-mobile').value,
            whatsapp: document.getElementById('p-whatsapp').value,
            description: document.getElementById('p-desc').value,
            image: imgData,
            video: document.getElementById('p-video').value,
            map: document.getElementById('p-map').value,
            status: State.user.role === 'admin' ? 'approved' : 'pending',
            agent: State.user.name,
            featured: false,
            views: 0,
            leads: 0,
            showAgentContact: false, // Admin will decide this during approval
            createdAt: new Date().toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
        });
        saveGlobalData(); closeModal(); render();
        alert("Property Added!");
    };
}

function editProperty(id) {
    const p = State.properties.find(x => x.id === id);
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="margin-bottom:20px;">Edit Property</h3>
            <form id="edit-prop-form">
                <div class="form-group"><label>Title</label><input id="pe-title" value="${p.title}" required></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>City</label><input id="pe-city" value="${p.city}" required></div>
                    <div class="form-group"><label>Category</label><select id="pe-cat">
                        <option ${p.category === 'Residential' ? 'selected' : ''}>Residential</option>
                        <option ${p.category === 'Plot' ? 'selected' : ''}>Plot</option>
                        <option ${p.category === 'Commercial' ? 'selected' : ''}>Commercial</option>
                    </select></div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Total Price</label><input id="pe-price" value="${p.price}" required></div>
                    <div class="form-group"><label>Area (Sq.ft/Bigha)</label><input id="pe-area" value="${p.area}" required></div>
                </div>
                <div class="form-group"><label>Price per Sq.ft</label><input id="pe-sqft" value="${p.priceSqft}" required></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Mobile Number</label><input id="pe-mobile" type="tel" value="${p.mobile || ''}" required></div>
                    <div class="form-group"><label>WhatsApp Number</label><input id="pe-whatsapp" type="tel" value="${p.whatsapp || ''}" required></div>
                </div>
                <div class="form-group"><label>Description</label><textarea id="pe-desc" rows="3">${p.description}</textarea></div>
                <div class="form-group"><label>YouTube Link</label><input id="pe-video" value="${p.video || ''}"></div>
                <div class="form-group"><label>Map Link</label><input id="pe-map" value="${p.map || ''}"></div>
                <button type="submit" class="login-btn">Update Details</button>
                <button type="button" class="prop-btn" style="background:none; color:#999;" onclick="closeModal()">Cancel</button>
            </form>
        </div>`;
    document.getElementById('edit-prop-form').onsubmit = (e) => {
        e.preventDefault();
        p.title = document.getElementById('pe-title').value;
        p.city = document.getElementById('pe-city').value;
        p.category = document.getElementById('pe-cat').value;
        p.price = document.getElementById('pe-price').value;
        p.area = document.getElementById('pe-area').value;
        p.priceSqft = document.getElementById('pe-sqft').value;
        p.mobile = document.getElementById('pe-mobile').value;
        p.whatsapp = document.getElementById('pe-whatsapp').value;
        p.description = document.getElementById('pe-desc').value;
        p.video = document.getElementById('pe-video').value;
        p.map = document.getElementById('pe-map').value;
        saveGlobalData(); closeModal(); render();
    };
}

function openSearchModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width: 350px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0;">Advanced Search</h3>
                <i class="fas fa-times" onclick="closeModal()" style="cursor:pointer; color:#999;"></i>
            </div>
            <div class="form-group">
                <label>Select City</label>
                <select id="s-city" class="login-input">
                    <option>All Cities</option>
                    <option>Noida</option>
                    <option>Padrauna</option>
                    <option>Sonipat</option>
                </select>
            </div>
            <div class="form-group">
                <label>Property Type</label>
                <select id="s-type" class="login-input">
                    <option>All Types</option>
                    <option>Residential</option>
                    <option>Plot</option>
                    <option>Commercial</option>
                </select>
            </div>
            <button class="login-btn" onclick="closeModal()" style="background:#138808; margin-top:20px;">Apply Search</button>
            <button class="prop-btn" style="background:none; color:#D32F2F;" onclick="closeModal()">Close</button>
        </div>`;
}

function closeModal() { document.getElementById('modal-container').style.display = 'none'; }

// Helpers
const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

function getYouTubeID(input) {
    if (!input) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input;
}

function logout() { State.user = null; saveGlobalData(); navigate('home'); }
function approveProperty(id) {
    const p = State.properties.find(x => x.id === id);
    if (!p) return;

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px;">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Approve Property</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">
                Property: <strong>${p.title}</strong><br>
                Agent: <strong>${p.agent}</strong><br>
                Mobile: <strong>${p.mobile || 'N/A'}</strong><br>
                WhatsApp: <strong>${p.whatsapp || 'N/A'}</strong>
            </p>
            <div style="background:#f8f9fa; padding:15px; border-radius:10px; margin-bottom:20px;">
                <label style="font-weight:700; color:#1a2a3a; margin-bottom:10px; display:block;">
                    Contact Display Option:
                </label>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px; background:white; border-radius:8px; border:2px solid #ddd;">
                        <input type="radio" name="contact-option" value="agent" checked style="width:18px; height:18px;">
                        <span style="font-size:0.9rem;">Show Agent's Contact Numbers</span>
                    </label>
                    <label style="display:flex; align-items:center; gap:10px; cursor:pointer; padding:10px; background:white; border-radius:8px; border:2px solid #ddd;">
                        <input type="radio" name="contact-option" value="admin" style="width:18px; height:18px;">
                        <span style="font-size:0.9rem;">Show Admin's Contact Numbers</span>
                    </label>
                </div>
            </div>
            <button class="login-btn" onclick="confirmApproveProperty(${p.id})" style="background:#138808;">Approve Property</button>
            <button class="prop-btn" style="background:none; color:#999; margin-top:10px;" onclick="closeModal()">Cancel</button>
        </div>`;
}

function confirmApproveProperty(id) {
    const selectedOption = document.querySelector('input[name="contact-option"]:checked').value;
    const p = State.properties.find(x => x.id === id);
    if (p) {
        p.status = 'approved';
        p.showAgentContact = (selectedOption === 'agent');
        delete p.disableReason;
        saveGlobalData();
        closeModal();
        render();
        alert(`Property approved! ${selectedOption === 'agent' ? 'Agent' : 'Admin'} contact will be shown.`);
    }
}
function markAsSold(id) {
    const p = State.properties.find(x => x.id === id);
    if (p) {
        p.status = 'sold';
        saveGlobalData();
        render();
        alert("Property marked as SOLD and hidden from app.");
    }
}
function markAsUnsold(id) {
    if (State.user.role !== 'admin') return alert("Only Admin can mark a property as Unsold.");
    const p = State.properties.find(x => x.id === id);
    if (p) {
        p.status = 'approved';
        saveGlobalData();
        render();
        alert("Property marked as UNSOLD and re-enabled.");
    }
}
function disableProperty(id) {
    const p = State.properties.find(x => x.id === id);
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:350px;">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Disable Property</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">Please provide a reason for disabling <strong>${p.title}</strong></p>
            <div class="form-group">
                <label>Reason / Remark</label>
                <textarea id="disable-remark" class="login-input" style="height:100px; padding:10px;" placeholder="Enter reason here..."></textarea>
            </div>
            <button class="login-btn" onclick="confirmDisable(${p.id})" style="background:#D32F2F;">Disable Now</button>
            <button class="prop-btn" style="background:none; color:#999; margin-top:10px;" onclick="closeModal()">Cancel</button>
        </div>`;
}
function confirmDisable(id) {
    const remark = document.getElementById('disable-remark').value;
    if (!remark) return alert("Please enter a reason");
    const p = State.properties.find(x => x.id === id);
    if (p) {
        p.status = 'disabled';
        p.disableReason = remark;
        saveGlobalData();
        closeModal();
        render();
    }
}
function approveAgent(id) { const a = State.agents.find(x => x.id === id); if (a) a.status = 'approved'; saveGlobalData(); render(); }

async function editAgent(id) {
    const a = State.agents.find(x => x.id === id);
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Edit Agent Details</h3>
            <form id="edit-agent-form">
                <div class="form-group"><label>Agent Name</label><input id="ae-name" value="${a.name}" required></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Phone</label><input id="ae-phone" value="${a.phone || ''}" required></div>
                    <div class="form-group"><label>City</label><input id="ae-city" value="${a.city || ''}" required></div>
                </div>
                <div class="form-group"><label>Email Address</label><input id="ae-email" value="${a.email}" required></div>
                <div class="form-group"><label>Password</label><input id="ae-pass" type="text" value="${a.password}" required></div>
                <div class="form-group"><label>Update Photo (Optional)</label><input type="file" id="ae-photo" accept="image/*"></div>
                <button type="submit" class="login-btn">Update Agent</button>
                <button type="button" class="prop-btn" style="background:none; color:#D32F2F;" onclick="closeModal()">Cancel</button>
            </form>
        </div>`;

    document.getElementById('edit-agent-form').onsubmit = async (e) => {
        e.preventDefault();
        a.name = document.getElementById('ae-name').value;
        a.phone = document.getElementById('ae-phone').value;
        a.city = document.getElementById('ae-city').value;
        a.email = document.getElementById('ae-email').value;
        a.password = document.getElementById('ae-pass').value;

        const photoFile = document.getElementById('ae-photo').files[0];
        if (photoFile) {
            a.photo = await toBase64(photoFile);
        }

        saveGlobalData(); closeModal(); render();
        alert("Agent Details Updated!");
    };
}

function blockAgent(id) { const a = State.agents.find(x => x.id === id); if (a) a.status = 'blocked'; saveGlobalData(); render(); }
function rejectAgent(id) { State.agents = State.agents.filter(x => x.id !== id); saveGlobalData(); render(); }

function toggleLike(e, id) {
    e.stopPropagation();
    if (State.likes.includes(id)) State.likes = State.likes.filter(x => x !== id);
    else State.likes.push(id);
    saveGlobalData(); render();
}

window.navigate = navigate;
window.toggleLike = toggleLike;
window.approveProperty = approveProperty;
window.confirmApproveProperty = confirmApproveProperty;
window.markAsSold = markAsSold;
window.markAsUnsold = markAsUnsold;
window.disableProperty = disableProperty;
window.confirmDisable = confirmDisable;
window.showPropertyModal = showPropertyModal;
window.approveAgent = approveAgent;
window.editAgent = editAgent;
window.blockAgent = blockAgent;
window.rejectAgent = rejectAgent;
window.openSearchModal = openSearchModal;
window.closeModal = closeModal;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.logout = logout;
window.editProperty = editProperty;
window.deleteProperty = (id) => { State.properties = State.properties.filter(x => x.id !== id); saveGlobalData(); render(); };
function manageWallet(agentId) {
    const a = State.agents.find(x => x.id === agentId);
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:350px;">
            <h3 style="margin-bottom:20px;">Manage Wallet: ${a.name}</h3>
            <p>Current Balance: <strong>₹ ${a.wallet}</strong></p>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="w-amount" class="login-input" placeholder="Enter amount">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button class="login-btn" onclick="adjustWallet(${a.id}, 'add')" style="background:#138808;">Add Money</button>
                <button class="login-btn" onclick="adjustWallet(${a.id}, 'reduce')" style="background:#D32F2F;">Reduce Money</button>
            </div>
            <button class="prop-btn" style="background:none; color:#999; margin-top:10px;" onclick="closeModal()">Cancel</button>
        </div>`;
}

function adjustWallet(id, type) {
    const a = State.agents.find(x => x.id === id);
    const amountVal = document.getElementById('w-amount').value;
    if (!amountVal || isNaN(amountVal) || parseInt(amountVal) <= 0) {
        return alert("कृपया एक सही राशि (Amount) दर्ज करें!");
    }
    const amount = parseInt(amountVal);
    if (type === 'add') {
        // Check if admin has sufficient balance
        if (State.adminWallet < amount) {
            return alert("Admin wallet में पर्याप्त बैलेंस नहीं है!");
        }

        // Deduct from admin wallet
        State.adminWallet -= amount;

        // Add to agent wallet
        a.wallet += amount;

        // Record agent credit transaction
        State.walletTransactions.push({
            id: Date.now(),
            agentId: a.id,
            amount: amount,
            type: 'credit',
            date: new Date().toLocaleString(),
            remark: 'Added by Admin'
        });

        // Record admin debit transaction
        State.walletTransactions.push({
            id: Date.now() + 1,
            amount: amount,
            type: 'admin_debit',
            date: new Date().toLocaleString(),
            remark: `Transferred to ${a.name}`
        });
    } else {
        if (a.wallet < amount) return alert("Insufficient balance");
        a.wallet -= amount;
        State.walletTransactions.push({
            id: Date.now(),
            agentId: a.id,
            amount: amount,
            type: 'debit',
            date: new Date().toLocaleString(),
            remark: 'Reduced by Admin'
        });
    }
    saveGlobalData(); closeModal(); render();
    alert(`Wallet updated! New Balance: ₹ ${a.wallet}`);
}

function requestWithdrawal(id) {
    const a = State.agents.find(x => x.id === id);
    let amountStr = prompt("Enter amount to withdraw (₹):", a.wallet);
    if (amountStr === null) return; // User cancelled prompt

    if (!amountStr.trim() || isNaN(amountStr) || parseInt(amountStr) <= 0) {
        return alert("कृपया एक सही राशि (Amount) दर्ज करें!");
    }

    const amount = parseInt(amountStr);
    if (amount > a.wallet) return alert("Insufficient balance");

    // Deduct immediately
    a.wallet -= amount;

    if (!State.withdrawalRequests) State.withdrawalRequests = [];
    const reqId = Date.now();
    State.withdrawalRequests.push({
        id: reqId,
        agentId: a.id,
        agentName: a.name,
        amount: amount,
        date: new Date().toLocaleDateString(),
        status: 'pending',
        remark: ''
    });

    if (!State.walletTransactions) State.walletTransactions = [];
    State.walletTransactions.push({
        id: reqId,
        agentId: a.id,
        amount: amount,
        type: 'withdrawal',
        status: 'pending',
        date: new Date().toLocaleString(),
        remark: 'Withdrawal Request Initiated'
    });

    saveGlobalData(); render();
    alert("Withdrawal request sent! Amount deducted from wallet and held for approval.");
}

function processWithdrawal(reqId, status) {
    const r = State.withdrawalRequests.find(x => x.id === reqId);
    if (!r) return;
    const remark = prompt(`Enter remark for ${status === 'approved' ? 'Approval' : 'Rejection'}:`);
    if (remark === null) return;

    const a = State.agents.find(x => x.id === r.agentId);
    const transaction = State.walletTransactions.find(t => t.id === r.id);

    if (status === 'approved') {
        if (transaction) {
            transaction.status = 'approved';
            transaction.remark = 'Withdrawal Approved: ' + remark;
        }
    } else if (status === 'rejected') {
        // Refund back to wallet
        a.wallet += r.amount;
        if (transaction) {
            transaction.status = 'rejected';
            transaction.remark = 'Withdrawal Rejected (Refunded): ' + remark;
        }
    }

    r.status = status;
    r.remark = remark;
    saveGlobalData(); render();
    alert(`Withdrawal request ${status}!`);
}

function addAdminBalance() {
    const password = prompt("Enter Admin Password to add balance:");
    if (password === null) return; // User cancelled

    if (password !== "Ajay@6341#") {
        return alert("गलत पासवर्ड! Access Denied.");
    }

    const amountStr = prompt("Enter amount to add to Admin Wallet (₹):");
    if (amountStr === null) return;

    if (!amountStr.trim() || isNaN(amountStr) || parseInt(amountStr) <= 0) {
        return alert("कृपया एक सही राशि (Amount) दर्ज करें!");
    }

    const amount = parseInt(amountStr);
    State.adminWallet += amount;

    // Record admin credit transaction
    if (!State.walletTransactions) State.walletTransactions = [];
    State.walletTransactions.push({
        id: Date.now(),
        amount: amount,
        type: 'admin_credit',
        date: new Date().toLocaleString(),
        remark: 'Balance Added by Admin'
    });

    saveGlobalData();
    render();
    alert(`₹ ${amount.toLocaleString()} successfully added to Admin Wallet!`);
}

function toggleDateSetting() {
    State.settings.showDate = !State.settings.showDate;
    saveGlobalData();
    render();
}

window.toggleDateSetting = toggleDateSetting;
window.addAdminBalance = addAdminBalance;
window.manageWallet = manageWallet;
window.adjustWallet = adjustWallet;
window.requestWithdrawal = requestWithdrawal;
window.processWithdrawal = processWithdrawal;
window.setAdminTab = setAdminTab;
window.setAgentTab = setAgentTab;
window.updateAdminSearch = updateAdminSearch;
window.toggleFeature = toggleFeature;
