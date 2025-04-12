INSERT INTO users (id, first_name, last_name, email, password, is_admin)
VALUES
    ('8a24f2d2-4d34-4eee-af4d-702b90a9bc96', 'Salut', 'string', 'salut@gmail.com', '$2b$12$7SmtZ5iY7NQl13vNTHdf2uz2QcJyTDj9AKEilYGAIBHaNSbGGlSDu', TRUE);

INSERT INTO amenities (id, name)
VALUES
('07c58f46-ecfc-42ae-b861-23dfc68b46db', 'Wifi'),
('60e93525-9c79-4f4e-aca4-c5a1a69a9a6e', 'Swimming Pool'),
('08c7ef97-19f1-47ed-8975-e87a6179f7d6', 'Air conditioning');

INSERT INTO places (id, title, description, price, latitude, longitude, owner_id)
VALUES
('8595d235-da9b-499b-861f-192288975036', 'Cozy Country Cottage', 'A charming cottage nestled in the countryside, featuring rustic decor and scenic views.', 90.00, 48.8566, 2.3522, 'ea152844-7d1b-4f0f-8204-d04a0907db98'),
('80ee0dd1-3503-42fb-9ac1-0c57ebb29e97', 'Luxury Villa with Pool', 'Experience a luxurious stay in this spacious villa featuring a private pool, landscaped gardens, and 5-star facilities.', 300.00, 34.0522, -118.2437, 'ea152844-7d1b-4f0f-8204-d04a0907db98'),
('3b1f1ce1-9664-45ed-99bf-2db3d4fada5a', 'Modern Downtown Loft', 'A trendy loft located in the heart of the city offering modern amenities and a vibrant nightlife.', 50.00, 40.7128, -74.006, 'ea152844-7d1b-4f0f-8204-d04a0907db98');

INSERT INTO places_amenities (place_id, amenity_id)
VALUES
('8595d235-da9b-499b-861f-192288975036', '07c58f46-ecfc-42ae-b861-23dfc68b46db'),
('80ee0dd1-3503-42fb-9ac1-0c57ebb29e97', '60e93525-9c79-4f4e-aca4-c5a1a69a9a6e'),
('3b1f1ce1-9664-45ed-99bf-2db3d4fada5a', '08c7ef97-19f1-47ed-8975-e87a6179f7d6');

INSERT INTO reviews (id, text, rating, user_id, place_id)
VALUES
('6a62a9ce-fe95-4fa9-b331-8c60a612b730', 'This place is amazing', 5, 'aa1fbac2-c982-4f33-9254-c24670c225c6', '3b1f1ce1-9664-45ed-99bf-2db3d4fada5a');
