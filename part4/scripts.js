// API Configuration
const API_BASE_URL = 'http://localhost:5500/api/v1';

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing...');
    
    // Add login-page class if we're on the login page
    const loginFormElement = document.getElementById('login-form');
    if (loginFormElement) {
        document.body.classList.add('login-page');
    }

    // Initialize authentication
    checkAuthentication();

    // Setup login form if it exists
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            if (email && password) {
                await loginUser(email, password);
            } else {
                alert('Please fill in all fields.');
            }
        });
    }

    // Setup logout button if it exists
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }

    // Setup price filter if it exists
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (event) => {
            const selectedPrice = event.target.value;
            filterPlacesByPrice(selectedPrice);
        });
    }

    // Fetch and display places
    fetchPlaces();

    // Setup click handlers for view details buttons
    document.addEventListener('click', (event) => {
        if (event.target.classList.contains('view-details')) {
            const placeCard = event.target.closest('.place-card');
            if (placeCard) {
                const placeId = placeCard.dataset.placeId;
                window.location.href = `place.html?id=${placeId}`;
            }
        }
    });
});

async function loginUser(email, password) {
    console.log('Attempting login...');
    const submitButton = document.getElementById('submit-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');

    // Reset UI state
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    submitButton.disabled = true;
    loadingIndicator.style.display = 'flex';

    try {
        console.log('Sending login request to:', `${API_BASE_URL}/auth/login`);
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();
        console.log('Login successful, storing tokens');
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        // Update the connection status before redirecting
        checkAuthentication();

        console.log('Redirecting to index page');
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    } finally {
        submitButton.disabled = false;
        loadingIndicator.style.display = 'none';
    }
}

function checkAuthentication() {
    console.log('Checking authentication status...');
    const token = localStorage.getItem('token');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    if (token) {
        console.log('User is authenticated');
        if (loginButton) loginButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        return true;
    } else {
        console.log('User is not authenticated');
        if (loginButton) loginButton.style.display = 'block';
        if (logoutButton) logoutButton.style.display = 'none';
        return false;
    }
}

function getPlaceIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('place_id');
}

function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (event) => {
            const selectedPrice = event.target.value;
            filterPlacesByPrice(selectedPrice);
        });
    }
}

async function filterPlacesByPrice(price) {
    try {
        const response = await fetch(`${API_BASE_URL}/places`);
        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }
        const data = await response.json();
        const places = data.places;

        if (price === 'All') {
            displayPlaces(places);
            return;
        }

        const filteredPlaces = places.filter(place => place.price <= parseInt(price));
        displayPlaces(filteredPlaces);
    } catch (error) {
        console.error('Error filtering places:', error);
        alert('Error filtering places. Please try again later.');
    }
}

async function fetchPlaces() {
    try {
        const response = await fetch(`${API_BASE_URL}/places`);
        if (!response.ok) {
            throw new Error('Failed to fetch places');
        }
        const data = await response.json();
        displayPlaces(data.places);
    } catch (error) {
        console.error('Error fetching places:', error);
        alert('Error fetching places. Please try again later.');
    }
}

function displayPlaces(places) {
    const placesContainer = document.getElementById('places-container');
    if (!placesContainer) return;

    placesContainer.innerHTML = '';

    // Liste complète des aménités possibles avec leurs icônes et émojis
    const allAmenities = [
        // Confort
        { name: 'wifi', icon: 'wifi', emoji: '📶' },
        { name: 'ac', icon: 'snowflake', emoji: '❄️' },
        { name: 'tv', icon: 'tv', emoji: '📺' },
        { name: 'heating', icon: 'fire', emoji: '🔥' },
        { name: 'workspace', icon: 'laptop', emoji: '💻' },
        
        // Extérieur
        { name: 'pool', icon: 'swimming-pool', emoji: '🏊' },
        { name: 'bbq', icon: 'grill', emoji: '🍖' },
        { name: 'hot tub', icon: 'hot-tub', emoji: '🛁' },
        { name: 'garden', icon: 'tree', emoji: '🌳' },
        { name: 'terrace', icon: 'umbrella-beach', emoji: '🏖️' },
        
        // Installations
        { name: 'gym', icon: 'dumbbell', emoji: '💪' },
        { name: 'spa', icon: 'spa', emoji: '💆' },
        { name: 'fireplace', icon: 'fire', emoji: '🔥' },
        { name: 'sauna', icon: 'hot-tub', emoji: '🧖' },
        { name: 'game room', icon: 'gamepad', emoji: '🎮' },
        
        // Essentiels
        { name: 'parking', icon: 'parking', emoji: '🅿️' },
        { name: 'kitchen', icon: 'utensils', emoji: '🍳' },
        { name: 'security', icon: 'shield-alt', emoji: '🛡️' },
        { name: 'elevator', icon: 'elevator', emoji: '🛗' },
        { name: 'laundry', icon: 'tshirt', emoji: '👕' },
        
        // Services
        { name: 'breakfast', icon: 'coffee', emoji: '☕' },
        { name: 'cleaning', icon: 'broom', emoji: '🧹' },
        { name: 'concierge', icon: 'bell', emoji: '🔔' },
        { name: 'room service', icon: 'utensils', emoji: '🍽️' },
        { name: 'airport shuttle', icon: 'shuttle-van', emoji: '🚐' }
    ];

    // Fonction pour créer des ensembles d'aménités diversifiés
    function createDiverseAmenitySet() {
        // Créer des catégories d'aménités
        const categories = {
            comfort: ['wifi', 'ac', 'tv', 'heating', 'workspace'],
            outdoor: ['pool', 'bbq', 'hot tub', 'garden', 'terrace'],
            facilities: ['gym', 'spa', 'fireplace', 'sauna', 'game room'],
            essentials: ['parking', 'kitchen', 'security', 'elevator', 'laundry'],
            services: ['breakfast', 'cleaning', 'concierge', 'room service', 'airport shuttle']
        };

        // Sélectionner une aménité de chaque catégorie
        const selectedAmenities = [];
        Object.values(categories).forEach(category => {
            const randomIndex = Math.floor(Math.random() * category.length);
            const amenityName = category[randomIndex];
            const amenity = allAmenities.find(a => a.name === amenityName);
            if (amenity) selectedAmenities.push(amenity);
        });

        // Ajouter 2 aménités supplémentaires aléatoires
        const remainingAmenities = allAmenities.filter(a => !selectedAmenities.includes(a));
        const shuffledRemaining = [...remainingAmenities].sort(() => Math.random() - 0.5);
        selectedAmenities.push(...shuffledRemaining.slice(0, 2));

        // Mélanger les aménités sélectionnées
        return selectedAmenities.sort(() => Math.random() - 0.5);
    }

    places.forEach(place => {
        const placeElement = document.createElement('div');
        placeElement.className = 'place-card';
        
        // Créer un ensemble d'aménités diversifié pour chaque place
        const selectedAmenities = createDiverseAmenitySet();

        const amenitiesHTML = `
            <div class="place-amenities">
                <h4>Amenities</h4>
                <ul>
                    ${selectedAmenities.map(amenity => `
                        <li class="amenity-item" data-amenity="${amenity.name}">
                            <i class="fas fa-${amenity.icon}"></i>
                            <span class="amenity-emoji">${amenity.emoji}</span>
                            <span class="amenity-name">${amenity.name}</span>
                            <div class="amenity-tooltip">${amenity.name}</div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;

        placeElement.innerHTML = `
            <img src="${place.image_url || 'images/default-place.jpg'}" alt="${place.title}" class="place-image">
            <div class="place-content">
                <h3>${place.title}</h3>
                <p class="place-description">${place.description}</p>
                <p class="place-price">$${place.price || 'N/A'}/night</p>
                ${amenitiesHTML}
                <button class="view-details-button" data-place-id="${place.id}">View Details</button>
            </div>
        `;

        placesContainer.appendChild(placeElement);
    });

    // Ajouter les écouteurs d'événements pour les boutons de détails
    document.querySelectorAll('.view-details-button').forEach(button => {
        button.addEventListener('click', function () {
            const placeId = this.getAttribute('data-place-id');
            window.location.href = `place.html?id=${placeId}`;
        });
    });

    // Ajouter les écouteurs d'événements pour les aménités
    document.querySelectorAll('.amenity-item').forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.classList.add('amenity-hover');
        });
        item.addEventListener('mouseleave', function() {
            this.classList.remove('amenity-hover');
        });
    });
}

// Helper function to get appropriate icon for each amenity
function getAmenityIcon(amenityName) {
    const iconMap = {
        'wifi': { icon: 'wifi', emoji: '📶' },
        'pool': { icon: 'swimming-pool', emoji: '🏊' },
        'parking': { icon: 'parking', emoji: '🅿️' },
        'kitchen': { icon: 'utensils', emoji: '🍳' },
        'tv': { icon: 'tv', emoji: '📺' },
        'ac': { icon: 'snowflake', emoji: '❄️' },
        'washer': { icon: 'tshirt', emoji: '🧺' },
        'dryer': { icon: 'tshirt', emoji: '👕' },
        'heating': { icon: 'fire', emoji: '🔥' },
        'workspace': { icon: 'laptop', emoji: '💻' },
        'breakfast': { icon: 'coffee', emoji: '☕' },
        'gym': { icon: 'dumbbell', emoji: '💪' },
        'elevator': { icon: 'elevator', emoji: '🛗' },
        'hot tub': { icon: 'hot-tub', emoji: '🛁' },
        'fireplace': { icon: 'fire', emoji: '🔥' },
        'bbq': { icon: 'grill', emoji: '🍖' },
        'security': { icon: 'shield-alt', emoji: '🛡️' },
        'smoke alarm': { icon: 'smoking-ban', emoji: '🚭' },
        'first aid': { icon: 'first-aid', emoji: '🏥' },
        'fire extinguisher': { icon: 'fire-extinguisher', emoji: '🧯' }
    };

    return iconMap[amenityName.toLowerCase()] || { icon: 'check-circle', emoji: '✅' };
}

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.startsWith(name + '=')) {
            return cookie.substring(name.length + 1);
        }
    }
    return null;
}

async function submitReview(token, placeId, reviewText, rating) {
    try {
        const response = await fetch('http://localhost:5500/part4/add-reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                place_id: placeId,
                review: reviewText,
                rating: rating
            })
        });

        handleResponse(response);
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('An error occurred while submitting your review. Please try again.');
    }
}

function handleResponse(response) {
    if (response.ok) {
        alert('Review submitted successfully!');
        document.getElementById('review-form').reset();
    } else {
        alert('Failed to submit review. Please try again.');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const reviewCards = document.querySelectorAll('.review-card');

    reviewCards.forEach(card => {
        card.addEventListener('mouseover', () => {
            card.style.transform = 'scale(1.02)';
            card.style.boxShadow = '10px 10px 20px rgba(0, 0, 0, 0.2), -10px -10px 20px rgba(255, 255, 255, 0.8)';
        });

        card.addEventListener('mouseout', () => {
            card.style.transform = 'scale(1)';
            card.style.boxShadow = '5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.7)';
        });
    });

    const stars = document.querySelectorAll('.review-rating .star');

    stars.forEach((star, index) => {
        star.addEventListener('mouseover', () => {
            highlightStars(index);
        });

        star.addEventListener('mouseout', () => {
            resetStars();
        });

        star.addEventListener('click', () => {
            setRating(index);
        });
    });

    function highlightStars(index) {
        stars.forEach((star, i) => {
            if (i <= index) {
                star.classList.add('filled');
            } else {
                star.classList.remove('filled');
            }
        });
    }

    function resetStars() {
        stars.forEach(star => {
            if (!star.classList.contains('selected')) {
                star.classList.remove('filled');
            }
        });
    }

    function setRating(index) {
        stars.forEach((star, i) => {
            if (i <= index) {
                star.classList.add('filled', 'selected');
            } else {
                star.classList.remove('filled', 'selected');
            }
        });
    }
});

// Add logout functionality
function logout() {
    console.log('Logging out...');
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    checkAuthentication();
    console.log('Redirecting to index page');
    window.location.href = 'index.html';
}