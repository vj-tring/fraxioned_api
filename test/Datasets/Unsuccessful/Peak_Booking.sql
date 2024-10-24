TRUNCATE TABLE fxn_booking;

INSERT INTO fxn_booking 
(`id`, `booking_id`, `ownerrez_booking_id`, `checkin_at`, `checkout_at`, `total_nights`, `no_of_guests`, `no_of_pets`, `created_at`, `updated_at`, `cancelled_at`, `is_last_minute_booking`, `no_of_adults`, `no_of_children`, `notes`, `confirmation_code`, `cleaning_fee`, `pet_fee`, `is_cancelled`, `is_completed`, `user_id`, `property_id`, `created_by`, `updated_by`) 
VALUES 
(1, 'FX20240201', 335961, '2026-04-02 16:00:00', '2026-04-10 11:00:00', 8, 10, 2, '2024-10-24 16:26:45', '2024-10-24 16:26:45', NULL, 0, 5, 5, NULL, NULL, 600, 0, 0, 0, 2, 2, 1, NULL);
