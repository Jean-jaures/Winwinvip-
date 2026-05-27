// Configuration Supabase
const SUPABASE_URL = 'https://cnrxagnzlqytepgucten.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XsBk2IPOP8vQVR39omeFkQ_-JW6bVov';

// Initialisation Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Vérifier si l'utilisateur est connecté
async function checkAuth() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (!session && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
        window.location.href = 'login.html';
    }
    return session;
}

// Déconnexion
async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}

// Charger les tickets
async function loadTickets() {
    const { data: tickets, error } = await supabase
        .from('tickets')
        .select('*')
        .order('id', { ascending: false });
    
    if (error) {
        console.error('Erreur chargement tickets:', error);
        return;
    }
    
    const container = document.getElementById('tickets-container');
    if (container && tickets) {
        container.innerHTML = tickets.map(ticket => `
            <div class="ticket-card">
                <h3>${ticket.match_name}</h3>
                <p>Pronostic: ${ticket.prediction}</p>
                <div class="ticket-odds">Cote: ${ticket.odds}</div>
                <p>Confiance: ${'★'.repeat(ticket.confidence)}${'☆'.repeat(5-ticket.confidence)}</p>
                <p>${ticket.analysis || ''}</p>
                <button class="buy-btn" onclick="buyTicket(${ticket.id})">Obtenir ce ticket - 1500 FCFA</button>
            </div>
        `).join('');
    }
}

// Acheter un ticket
async function buyTicket(ticketId) {
    const session = await checkAuth();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }
    
    const transactionRef = prompt("Envoie le paiement à +225 XX XX XX XXX (Orange/MTN/Wave) puis entre ton numéro de transaction:");
    if (transactionRef) {
        const { error } = await supabase
            .from('payments')
            .insert({
                user_id: session.user.id,
                amount: 1500,
                subscription_type: 'ticket',
                transaction_ref: transactionRef,
                status: 'pending'
            });
        
        if (error) {
            alert('Erreur: ' + error.message);
        } else {
            alert('Paiement enregistré ! Un admin validera sous 24h.');
        }
    }
}
