/* 
  This is a SAMPLE FILE to get you started.
  Please, follow the project instructions to complete the tasks.
*/

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');

  if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          await loginUser(email, password);
      });
  }
});

async function loginUser(email, password) {
  try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/auth/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Login successful:', data);
      document.cookie = `token=${data.token}; path=/`;
      window.location.href = 'index.html';
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
      alert('There was a problem with the fetch operation: ' + error.message);
  }

  document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    setupPriceFilter();
});

function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
        const [key, value] = cookie.trim().split('=');
        if (key === name) {
            return value;
        }
    }
    return null;
}

function checkAuthentication() {
    const token = getCookie('token');
    const loginLink = document.getElementById('login-link');
    const addReviewSection = document.getElementById('add-review-section');

    if (!token) {
        console.log('User is not authenticated');
        loginLink.style.display = 'block';
        window.location.href = 'index.html';
        return null;
    } else {
        console.log('User is authenticated');
        loginLink.style.display = 'none';
        addReviewSection.style.display = 'block';
        const placeID = getPlaceIdFromURL();
        fetchPlaceDetails(token, placeID);
    }
    return token;
}

async function fetchPlaces(token) {
    try {
        const response = await fetch('http://127.0.0.1:5000/api/v1/places', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const placeStatus = await response.json();
            console.log('Error fetching places:', placeStatus);
            displayPlaces(places);
        } else {
            console.error('Error fetching places:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching places:', error);
    }
}

function displayPlaces(places) {
    const placesList = document.getElementById('places-list');
    placesList.innerHTML = ''; // Clear previous entries

    places.forEach(place => {
        const placeDiv = document.createElement('div');
        placeDiv.classList.add('place');
        placeDiv.innerHTML = `
            <h1>${place.name}</h1>
            <p>${place.description}</p>
            <p><strong>Location:</strong> ${place.location}</p>
            <p><strong>Price:</strong> $${place.price}</p>
            <p><strong>Amenities:</strong> $${place.amenities.join(', ')}</p>
            <h3>Reviews:</h3>
            <ul>
                ${place.reviews.map(review => `<li>${review}</li>`).join('')}
            </ul>
        `;
        placeDiv.dataset.price = place.price;
        placesList.appendChild(placeDiv);
    });
}

function setupPriceFilter() {
    const priceFilter = document.getElementById('price-filter');
    priceFilter.addEventListener('change', (event) => {
        const selectedPrice = event.target.value;
        filterPlacesByPrice(selectedPrice);
    });
}

function filterPlacesByPrice(price) {
    const places = document.querySelectorAll('.place');
    places.forEach(place => {
        const placePrice = parseFloat(place.dataset.price);
        if (price === 'All' || placePrice <= parseFloat(price)) {
            place.style.display = 'block';
        } else {
            place.style.display = 'none';
        }
    });
}

function getPlaceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('place_id');
}

document.addEventListener('DOMContentLoaded', () => {
  const reviewForm = document.getElementById('review-form');
  const token = checkAuthentication();
  const placeId = getPlaceIdFromURL();

  if (reviewForm) {
      reviewForm.addEventListener('submit', async (event) => {
          event.preventDefault();
          const reviewText = document.getElementById('review-text').value;
          await submitReview(token, placeId, reviewText);
      });
  }
});

async function submitReview(token, placeId, reviewText) {
  try {
      const response = await fetch('http://127.0.0.1:5000/api/v1/reviews', {
          method: 'POST',
          headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ placeId, reviewText })
      });

      if (response.ok) {
          alert('Avis soumis avec succès !');
          document.getElementById('review-text').value = ''; 
      } else {
          const errorData = await response.json();
          alert(`Échec de la soumission de l'avis : ${errorData.message}`);
      }
  } catch (error) {
      console.error('Erreur lors de la soumission de l’avis :', error);
      alert('Une erreur est survenue lors de la soumission de l’avis.');
  }
}}