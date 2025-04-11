document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const reviewForm = document.getElementById('review-form');
    const priceFilter = document.getElementById('price-filter');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            console.log('Login form submitted:', { email, password });
            if (email && password) {
                await loginUser(email, password);
            } else {
                alert('Veuillez remplir tous les champs.');
            }
        });
    }

    const token = checkAuthentication();
    const placeId = getPlaceIdFromURL();
    if (priceFilter) {
        priceFilter.addEventListener('change', (event) => {
            const selectedPrice = event.target.value;
            filterPlacesByPrice(selectedPrice);
        });
    }

    setupPriceFilter();
});

document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login-button');
    const modal = document.querySelector('.modal');
    const overlay = document.querySelector('.modal-overlay');

    if (loginButton) {
        loginButton.addEventListener('click', () => {
            modal.classList.add('active');
            overlay.classList.add('active');
        });
    } else {
        console.warn('Warning: loginButton element not found.');
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            modal.classList.remove('active');
            overlay.classList.remove('active');
        });
    }

    const priceFilter = document.getElementById('price-filter');
    if (priceFilter) {
        priceFilter.addEventListener('change', (event) => {
            const selectedPrice = event.target.value;
            filterPlacesByPrice(selectedPrice);
        });
    }

});

document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('#star-rating .star');
    let selectedRating = 0;

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = star.getAttribute('data-value');
            updateStarSelection(selectedRating);
        });
    });

    function updateStarSelection(rating) {
        stars.forEach(star => {
            if (star.getAttribute('data-value') <= rating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
        });
    }

    const reviewForm = document.getElementById('review-form');

    if (!reviewForm) {
        return;
    };

    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const reviewText = document.getElementById('review-text').value;

        if (!selectedRating) {
            alert('Please select a rating before submitting your review.');
            return;
        }

        const token = checkAuthentication();
        const placeId = getPlaceIdFromURL();

        await submitReview(token, placeId, reviewText, selectedRating);
    });
});

async function loginUser(email, password) {
    try {
        const response = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        console.log('Login response:', response);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            alert(`Erreur de connexion : ${errorData.message || 'Problème de réseau.'}`);
            return;
        }

        const data = await response.json();
        console.log('Login successful:', data);
        document.cookie = `token=${data.token}; path=/`;
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error logging in:', error);
        alert(`Une erreur s'est produite : ${error.message}`);
    }
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const addReviewSection = document.getElementById('add-review-section');

    if (!token) {
        if (loginLink) {
            loginLink.style.display = 'block';
        }
        alert('Vous devez être connecté pour accéder à cette section.');
        return null;
    } else {
        if (loginLink) {
            loginLink.style.display = 'none';
        }
        if (addReviewSection) {
            addReviewSection.style.display = 'block';
        }
    }
    return token;
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
        const response = await fetch('http://localhost:5000/api/v1/places');
        if (!response.ok) {
            throw new Error('Échec de la récupération des lieux');
        }
        const data = await response.json();
        const places = data.places;
        if (price === 'All') {
            displayPlaces(places);
            return;
        }
        const filteredPlaces = places.filter(place => place.price <= parseInt(price));
        displayPlaces(filteredPlaces);
    }
    catch (error) {
            console.error('Erreur lors de la récupération des lieux :', error);
            alert('Erreur lors de la récupération des lieux. Veuillez réessayer plus tard.');
        }
}

function displayPlaces(places) {
    const placesContainer = document.getElementById('places-container');
    if (placesContainer) {
        placesContainer.innerHTML = '';
    }

    places.forEach(place => {
        const placeElement = document.createElement('div');
        placeElement.className = 'place-card';
        console.log('Place:', place);
        placeElement.innerHTML =  `
            <img src="${place.image_url}" alt="${place.title}" class="place-image">
            <h2>${place.title}</h2>
            <p>${place.description}</p>
            <p>Price: $${place.price}</p>
            <p>Location: (${place.latitude}, ${place.longitude})</p>
            <button class="view-details">View Details</button>
        `;
        placesContainer.appendChild(placeElement);
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

document.addEventListener('DOMContentLoaded', () => {
    const placesContainer = document.getElementById('places-container');

    if (!placesContainer) {
        console.error('Erreur : L\'élément placesContainer est introuvable.');
        return;
    }

    async function fetchPlaces() {
        try {
            const response = await fetch('http://localhost:5000/api/v1/places');
            if (!response.ok) {
                throw new Error('Échec de la récupération des lieux');
            }
            const data = await response.json();
            const places = data.places;
            displayPlaces(places);
        } catch (error) {
            console.error('Erreur lors de la récupération des lieux :', error);
            alert('Erreur lors de la récupération des lieux. Veuillez réessayer plus tard.');
        }
    }

    function displayPlaces(places) {
        const placesContainer = document.getElementById('places-container');
        if (placesContainer) {
            placesContainer.innerHTML = '';
        }

        if (!places || places.length === 0) {
            console.warn('Aucun lieu trouvé.');
            return;
        }

        places.forEach(place => {
            console.log('C\'est la deuxième function, ouais relou, je sais', place);
            const placeElement = document.createElement('div');
            placeElement.className = 'place-card';
            placeElement.innerHTML = `
                <img src="${place.image_url}" alt="${place.title}" class="place-image">
                <h2>${place.title}</h2>
                <p>${place.description}</p>
                <p>Price: $${place.price}</p>
                <p>Location: (${place.latitude}, ${place.longitude})</p>
                <button class="view-details">View Details</button>
            `;
            placesContainer.appendChild(placeElement);
        });
    }

    fetchPlaces();
});

document.addEventListener('DOMContentLoaded', () => {
    const reviewForm = document.getElementById('review-form');

    if (!reviewForm) {
        console.warn('Warning: reviewForm element not found.');
        return;
    }

    reviewForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const reviewText = document.getElementById('review-text')?.value.trim();

        if (!reviewText) {
            alert('Veuillez rédiger un avis avant de le soumettre.');
            return;
        }

        const token = checkAuthentication();
        const placeId = getPlaceIdFromURL();

        if (!token || !placeId) {
            alert('Une erreur est survenue. Veuillez réessayer.');
            return;
        }

        try {
            await submitReview(token, placeId, reviewText);
        } catch (error) {
            console.error('Erreur lors de la soumission de l\'avis :', error);
            alert('Une erreur est survenue lors de la soumission de votre avis. Veuillez réessayer.');
        }
    });
});