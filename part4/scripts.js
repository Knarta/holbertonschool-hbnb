// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
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
    const submitButton = document.getElementById('submit-button');
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessage = document.getElementById('error-message');

    // Reset UI state
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
    submitButton.disabled = true;
    loadingIndicator.style.display = 'flex';

    try {
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
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        // Update the connection status before redirecting
        checkAuthentication();

        window.location.href = 'http://localhost:5500/part4/index.html';
    } catch (error) {
        errorMessage.textContent = error.message;
        errorMessage.style.display = 'block';
    } finally {
        submitButton.disabled = false;
        loadingIndicator.style.display = 'none';
    }
}

function checkAuthentication() {
    const token = localStorage.getItem('token');
    const loginButton = document.getElementById('login-button');
    const logoutButton = document.getElementById('logout-button');

    if (token) {
        if (loginButton) loginButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'block';
        return true;
    } else {
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
    if (!placesContainer) return; // Exit if container doesn't exist

    placesContainer.innerHTML = ''; // Clear existing content

    places.forEach(place => {
        const placeElement = document.createElement('div');
        placeElement.className = 'place-card';
        placeElement.innerHTML = `
            <img src="${place.image_url || 'images/default-place.jpg'}" alt="${place.name}" class="place-image">
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <p>Price: $${place.price || 'N/A'}</p>
            <button class="view-details-button" data-place-id="${place.id}">View Details</button>
        `;
        placesContainer.appendChild(placeElement);
    });

    // Add event listeners to all view details buttons
    document.querySelectorAll('.view-details-button').forEach(button => {
        button.addEventListener('click', function () {
            const placeId = this.getAttribute('data-place-id');
            window.location.href = `place.html?id=${placeId}`;
        });
    });
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
        const response = await fetch('https://api.example.com/reviews', {
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
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    checkAuthentication();
    window.location.href = 'http://localhost:5500/part4/index.html';
}