-- Demo seed data for walkthroughs and UI demos.
-- Adds inventory, conversations, orders, receipts, and an open POS session.

DO $$
DECLARE
    admin_id BIGINT;

    supplier_body_id BIGINT;
    supplier_glass_id BIGINT;
    supplier_electrical_id BIGINT;

    part_bumper_id BIGINT;
    part_fog_light_id BIGINT;
    part_headlight_id BIGINT;
    part_grille_id BIGINT;
    part_radiator_id BIGINT;
    part_mirror_id BIGINT;
    part_brake_pad_id BIGINT;
    part_clips_id BIGINT;

    customer_thabo_id BIGINT;
    customer_lerato_id BIGINT;
    customer_michael_id BIGINT;
    customer_nandi_id BIGINT;
    customer_sarah_id BIGINT;

    conversation_thabo_id BIGINT;
    conversation_lerato_id BIGINT;
    conversation_nandi_id BIGINT;
    conversation_sarah_id BIGINT;

    order_walkin_id BIGINT;
    order_shopify_id BIGINT;
    order_whatsapp_id BIGINT;
    order_web_id BIGINT;
    order_shopify_fulfilled_id BIGINT;
    order_refunded_id BIGINT;
    order_cancelled_id BIGINT;

    ts_now TIMESTAMPTZ := NOW();
    ts_today_slot_one TIMESTAMPTZ := GREATEST(NOW() - INTERVAL '2 hours', date_trunc('day', NOW()) + INTERVAL '10 minutes');
    ts_today_slot_two TIMESTAMPTZ := GREATEST(NOW() - INTERVAL '5 hours', date_trunc('day', NOW()) + INTERVAL '30 minutes');
BEGIN
    SELECT id INTO admin_id FROM users WHERE email = 'admin@autobody.local';
    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Expected seeded admin user to exist before demo data migration';
    END IF;

    INSERT INTO suppliers (name, contact_name, phone, email, lead_time_days, notes, created_at, updated_at)
    SELECT 'Metro Body Panels', 'Kagiso Maseko', '+27114550001', 'orders@metrobody.local', 2,
           'Fast-turn supplier for bumpers, grilles, and exterior body parts.',
           ts_now - INTERVAL '45 days', ts_now - INTERVAL '10 days'
    WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Metro Body Panels');

    INSERT INTO suppliers (name, contact_name, phone, email, lead_time_days, notes, created_at, updated_at)
    SELECT 'Prime Auto Glass', 'Lerato Pillay', '+27114550002', 'sales@primeglass.local', 3,
           'Glass, lighting, and visibility components for workshop and walk-in orders.',
           ts_now - INTERVAL '40 days', ts_now - INTERVAL '12 days'
    WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Prime Auto Glass');

    INSERT INTO suppliers (name, contact_name, phone, email, lead_time_days, notes, created_at, updated_at)
    SELECT 'Torque Electrical', 'Sipho Dube', '+27114550003', 'dispatch@torqueelectrical.local', 4,
           'Electricals, sensors, and braking consumables.',
           ts_now - INTERVAL '35 days', ts_now - INTERVAL '8 days'
    WHERE NOT EXISTS (SELECT 1 FROM suppliers WHERE name = 'Torque Electrical');

    SELECT id INTO supplier_body_id FROM suppliers WHERE name = 'Metro Body Panels';
    SELECT id INTO supplier_glass_id FROM suppliers WHERE name = 'Prime Auto Glass';
    SELECT id INTO supplier_electrical_id FROM suppliers WHERE name = 'Torque Electrical';

    INSERT INTO parts (
        sku, name, category, make, model, year_range_start, year_range_end,
        qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id,
        active, created_at, updated_at
    )
    SELECT 'AB-TYT-BMP-001', 'Front Bumper Cover', 'Body', 'Toyota', 'Hilux', 2020, 2023,
           4, 2, 220.00, 340.00, 'A1-04', supplier_body_id,
           TRUE, ts_now - INTERVAL '30 days', ts_now - INTERVAL '1 day'
    WHERE NOT EXISTS (SELECT 1 FROM parts WHERE sku = 'AB-TYT-BMP-001');

    INSERT INTO parts (
        sku, name, category, make, model, year_range_start, year_range_end,
        qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id,
        active, created_at, updated_at
    )
    SELECT 'AB-TYT-FGL-021', 'Fog Light Assembly', 'Lighting', 'Toyota', 'Hilux', 2020, 2023,
           12, 4, 18.00, 42.00, 'A3-02', supplier_glass_id,
           TRUE, ts_now - INTERVAL '30 days', ts_now - INTERVAL '2 days'
    WHERE NOT EXISTS (SELECT 1 FROM parts WHERE sku = 'AB-TYT-FGL-021');

    INSERT INTO parts (
        sku, name, category, make, model, year_range_start, year_range_end,
        qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id,
        active, created_at, updated_at
    )
    SELECT 'AB-BMW-HDL-320-L', 'Left Headlight Assembly', 'Lighting', 'BMW', '320i', 2018, 2021,
           1, 2, 310.00, 520.00, 'B1-01', supplier_glass_id,
           TRUE, ts_now - INTERVAL '28 days', ts_now - INTERVAL '2 hours'
    WHERE NOT EXISTS (SELECT 1 FROM parts WHERE sku = 'AB-BMW-HDL-320-L');

    INSERT INTO parts (
        sku, name, category, make, model, year_range_start, year_range_end,
        qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id,
        active, created_at, updated_at
    )
    SELECT 'AB-BMW-GRL-320', 'Kidney Grille Set', 'Body', 'BMW', '320i', 2018, 2021,
           5, 2, 55.00, 110.00, 'B1-05', supplier_body_id,
           TRUE, ts_now - INTERVAL '28 days', ts_now - INTERVAL '4 days'
    WHERE NOT EXISTS (SELECT 1 FROM parts WHERE sku = 'AB-BMW-GRL-320');

    INSERT INTO parts (
        sku, name, category, make, model, year_range_start, year_range_end,
        qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id,
        active, created_at, updated_at
    )
    SELECT 'AB-FRD-RAD-018', 'Radiator Core', 'Cooling', 'Ford', 'Ranger', 2016, 2021,
           3, 3, 150.00, 265.00, 'C2-01', supplier_electrical_id,
           TRUE, ts_now - INTERVAL '26 days', ts_now - INTERVAL '3 days'
    WHERE NOT EXISTS (SELECT 1 FROM parts WHERE sku = 'AB-FRD-RAD-018');

    INSERT INTO parts (
        sku, name, category, make, model, year_range_start, year_range_end,
        qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id,
        active, created_at, updated_at
    )
    SELECT 'AB-VW-MRR-POLO-R', 'Right Door Mirror', 'Body', 'Volkswagen', 'Polo', 2018, 2022,
           14, 5, 22.00, 65.00, 'C4-03', supplier_body_id,
           TRUE, ts_now - INTERVAL '24 days', ts_now - INTERVAL '6 days'
    WHERE NOT EXISTS (SELECT 1 FROM parts WHERE sku = 'AB-VW-MRR-POLO-R');

    INSERT INTO parts (
        sku, name, category, make, model, year_range_start, year_range_end,
        qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id,
        active, created_at, updated_at
    )
    SELECT 'AB-MB-BRK-C200', 'Front Brake Pad Set', 'Brakes', 'Mercedes-Benz', 'C200', 2015, 2019,
           2, 3, 35.00, 95.00, 'D2-07', supplier_electrical_id,
           TRUE, ts_now - INTERVAL '22 days', ts_now - INTERVAL '1 day'
    WHERE NOT EXISTS (SELECT 1 FROM parts WHERE sku = 'AB-MB-BRK-C200');

    INSERT INTO parts (
        sku, name, category, make, model, year_range_start, year_range_end,
        qty_on_hand, low_stock_threshold, cost_price, sell_price, location, supplier_id,
        active, created_at, updated_at
    )
    SELECT 'AB-GEN-CLP-001', 'Panel Clip Pack', 'Consumables', NULL, NULL, NULL, NULL,
           40, 10, 0.80, 2.50, 'E1-12', supplier_electrical_id,
           TRUE, ts_now - INTERVAL '20 days', ts_now - INTERVAL '1 day'
    WHERE NOT EXISTS (SELECT 1 FROM parts WHERE sku = 'AB-GEN-CLP-001');

    SELECT id INTO part_bumper_id FROM parts WHERE sku = 'AB-TYT-BMP-001';
    SELECT id INTO part_fog_light_id FROM parts WHERE sku = 'AB-TYT-FGL-021';
    SELECT id INTO part_headlight_id FROM parts WHERE sku = 'AB-BMW-HDL-320-L';
    SELECT id INTO part_grille_id FROM parts WHERE sku = 'AB-BMW-GRL-320';
    SELECT id INTO part_radiator_id FROM parts WHERE sku = 'AB-FRD-RAD-018';
    SELECT id INTO part_mirror_id FROM parts WHERE sku = 'AB-VW-MRR-POLO-R';
    SELECT id INTO part_brake_pad_id FROM parts WHERE sku = 'AB-MB-BRK-C200';
    SELECT id INTO part_clips_id FROM parts WHERE sku = 'AB-GEN-CLP-001';

    INSERT INTO customers (
        name, phone, email, vehicle_make, vehicle_model, vehicle_year, vehicle_vin, source, created_at, updated_at
    )
    SELECT 'Thabo Mokoena', '+27710000001', 'thabo@example.demo', 'Toyota', 'Hilux', 2021, 'AHTFR22G7M1234567', 'WHATSAPP',
           ts_now - INTERVAL '18 days', ts_now - INTERVAL '90 minutes'
    WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+27710000001');

    INSERT INTO customers (
        name, phone, email, vehicle_make, vehicle_model, vehicle_year, vehicle_vin, source, created_at, updated_at
    )
    SELECT 'Lerato Dlamini', '+27710000002', 'lerato@example.demo', 'BMW', '320i', 2019, 'WBA8E1G54KNS00002', 'WHATSAPP',
           ts_now - INTERVAL '17 days', ts_now - INTERVAL '2 hours'
    WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+27710000002');

    INSERT INTO customers (
        name, phone, email, vehicle_make, vehicle_model, vehicle_year, vehicle_vin, source, created_at, updated_at
    )
    SELECT 'Michael Peterson', '+27710000003', 'michael@example.demo', 'Ford', 'Ranger', 2018, 'MNBUMFF50JW000003', 'WALK_IN',
           ts_now - INTERVAL '16 days', ts_now - INTERVAL '4 hours'
    WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+27710000003');

    INSERT INTO customers (
        name, phone, email, vehicle_make, vehicle_model, vehicle_year, vehicle_vin, source, created_at, updated_at
    )
    SELECT 'Nandi Khumalo', '+27710000004', 'nandi@example.demo', 'Volkswagen', 'Polo', 2020, 'WVWAE45R2LT000004', 'WHATSAPP',
           ts_now - INTERVAL '15 days', ts_now - INTERVAL '1 day'
    WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+27710000004');

    INSERT INTO customers (
        name, phone, email, vehicle_make, vehicle_model, vehicle_year, vehicle_vin, source, created_at, updated_at
    )
    SELECT 'Sarah Naidoo', '+27710000005', 'sarah@example.demo', 'Mercedes-Benz', 'C200', 2017, 'WDDWF4JBXHR000005', 'SHOPIFY',
           ts_now - INTERVAL '14 days', ts_now - INTERVAL '3 days'
    WHERE NOT EXISTS (SELECT 1 FROM customers WHERE phone = '+27710000005');

    SELECT id INTO customer_thabo_id FROM customers WHERE phone = '+27710000001';
    SELECT id INTO customer_lerato_id FROM customers WHERE phone = '+27710000002';
    SELECT id INTO customer_michael_id FROM customers WHERE phone = '+27710000003';
    SELECT id INTO customer_nandi_id FROM customers WHERE phone = '+27710000004';
    SELECT id INTO customer_sarah_id FROM customers WHERE phone = '+27710000005';

    INSERT INTO conversations (
        customer_id, wa_thread_id, status, bot_step, escalated, escalated_to, part_request, created_at, updated_at
    )
    SELECT customer_thabo_id, 'demo-wa-thread-001', 'ACTIVE', 'ASK_PART', FALSE, NULL,
           'Need a front bumper and fog light for a 2021 Hilux.', ts_now - INTERVAL '6 hours', ts_now - INTERVAL '90 minutes'
    WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE wa_thread_id = 'demo-wa-thread-001');

    INSERT INTO conversations (
        customer_id, wa_thread_id, status, bot_step, escalated, escalated_to, part_request, created_at, updated_at
    )
    SELECT customer_lerato_id, 'demo-wa-thread-002', 'ESCALATED', 'ESCALATED', TRUE, admin_id,
           'Urgent request for BMW 320i headlight and grille quote.', ts_now - INTERVAL '5 hours', ts_now - INTERVAL '2 hours'
    WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE wa_thread_id = 'demo-wa-thread-002');

    INSERT INTO conversations (
        customer_id, wa_thread_id, status, bot_step, escalated, escalated_to, part_request, created_at, updated_at
    )
    SELECT customer_nandi_id, 'demo-wa-thread-003', 'ACTIVE', 'PROVIDE_STOCK', FALSE, NULL,
           'Checking right mirror availability for a Polo 2020.', ts_now - INTERVAL '3 hours', ts_now - INTERVAL '70 minutes'
    WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE wa_thread_id = 'demo-wa-thread-003');

    INSERT INTO conversations (
        customer_id, wa_thread_id, status, bot_step, escalated, escalated_to, part_request, created_at, updated_at
    )
    SELECT customer_sarah_id, 'demo-wa-thread-004', 'RESOLVED', 'DONE', FALSE, NULL,
           'Asked for brake pad delivery timeline.', ts_now - INTERVAL '2 days', ts_now - INTERVAL '1 day'
    WHERE NOT EXISTS (SELECT 1 FROM conversations WHERE wa_thread_id = 'demo-wa-thread-004');

    SELECT id INTO conversation_thabo_id FROM conversations WHERE wa_thread_id = 'demo-wa-thread-001';
    SELECT id INTO conversation_lerato_id FROM conversations WHERE wa_thread_id = 'demo-wa-thread-002';
    SELECT id INTO conversation_nandi_id FROM conversations WHERE wa_thread_id = 'demo-wa-thread-003';
    SELECT id INTO conversation_sarah_id FROM conversations WHERE wa_thread_id = 'demo-wa-thread-004';

    INSERT INTO messages (conversation_id, direction, content, wa_message_id, created_at)
    SELECT conversation_thabo_id, 'INBOUND', 'Hi, do you have a Hilux bumper and fog light in stock?', 'demo-msg-001-in', ts_now - INTERVAL '6 hours'
    WHERE NOT EXISTS (SELECT 1 FROM messages WHERE wa_message_id = 'demo-msg-001-in');

    INSERT INTO messages (conversation_id, direction, content, wa_message_id, created_at)
    SELECT conversation_thabo_id, 'OUTBOUND', 'We have both items. I can send pricing or connect you to the desk.', 'demo-msg-001-out', ts_now - INTERVAL '5 hours 50 minutes'
    WHERE NOT EXISTS (SELECT 1 FROM messages WHERE wa_message_id = 'demo-msg-001-out');

    INSERT INTO messages (conversation_id, direction, content, wa_message_id, created_at)
    SELECT conversation_lerato_id, 'INBOUND', 'Need the left headlight and grille urgently for my BMW 320i.', 'demo-msg-002-in', ts_now - INTERVAL '5 hours'
    WHERE NOT EXISTS (SELECT 1 FROM messages WHERE wa_message_id = 'demo-msg-002-in');

    INSERT INTO messages (conversation_id, direction, content, wa_message_id, created_at)
    SELECT conversation_lerato_id, 'OUTBOUND', 'Escalating this to a human for urgent pricing and delivery options.', 'demo-msg-002-out', ts_now - INTERVAL '4 hours 55 minutes'
    WHERE NOT EXISTS (SELECT 1 FROM messages WHERE wa_message_id = 'demo-msg-002-out');

    INSERT INTO messages (conversation_id, direction, content, wa_message_id, created_at)
    SELECT conversation_nandi_id, 'INBOUND', 'Please confirm if the Polo right mirror is available today.', 'demo-msg-003-in', ts_now - INTERVAL '3 hours'
    WHERE NOT EXISTS (SELECT 1 FROM messages WHERE wa_message_id = 'demo-msg-003-in');

    INSERT INTO messages (conversation_id, direction, content, wa_message_id, created_at)
    SELECT conversation_sarah_id, 'OUTBOUND', 'Your brake pads were dispatched with the afternoon courier.', 'demo-msg-004-out', ts_now - INTERVAL '1 day 2 hours'
    WHERE NOT EXISTS (SELECT 1 FROM messages WHERE wa_message_id = 'demo-msg-004-out');

    IF NOT EXISTS (
        SELECT 1 FROM pos_sessions WHERE user_id = admin_id AND closed_at IS NULL
    ) THEN
        INSERT INTO pos_sessions (user_id, opened_at, opening_float, notes)
        VALUES (
            admin_id,
            GREATEST(ts_now - INTERVAL '3 hours', date_trunc('day', ts_now) + INTERVAL '20 minutes'),
            250.00,
            '[DEMO] Register opened for dashboard walkthrough'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM orders WHERE notes = '[DEMO:ORDER:WALKIN-001]') THEN
        INSERT INTO orders (
            customer_id, source, status, subtotal, discount, total, notes, handled_by, version, created_at, updated_at
        )
        VALUES (
            customer_michael_id, 'WALK_IN', 'PENDING', 342.50, 12.50, 330.00,
            '[DEMO:ORDER:WALKIN-001]', admin_id, 0, ts_today_slot_one, ts_today_slot_one
        )
        RETURNING id INTO order_walkin_id;

        INSERT INTO order_items (order_id, part_id, qty, unit_price, created_at)
        VALUES
            (order_walkin_id, part_radiator_id, 1, 265.00, ts_today_slot_one),
            (order_walkin_id, part_clips_id, 31, 2.50, ts_today_slot_one);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM orders WHERE notes = '[DEMO:ORDER:SHOPIFY-002]') THEN
        INSERT INTO orders (
            customer_id, source, status, subtotal, discount, total, shopify_order_id, notes, handled_by, version, created_at, updated_at
        )
        VALUES (
            customer_sarah_id, 'SHOPIFY', 'CONFIRMED', 615.00, 35.00, 580.00, 'SH-DEMO-100245',
            '[DEMO:ORDER:SHOPIFY-002]', admin_id, 0, ts_today_slot_two, ts_today_slot_two
        )
        RETURNING id INTO order_shopify_id;

        INSERT INTO order_items (order_id, part_id, qty, unit_price, created_at)
        VALUES
            (order_shopify_id, part_bumper_id, 1, 340.00, ts_today_slot_two),
            (order_shopify_id, part_fog_light_id, 3, 42.00, ts_today_slot_two),
            (order_shopify_id, part_clips_id, 60, 2.50, ts_today_slot_two);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM orders WHERE notes = '[DEMO:ORDER:WHATSAPP-003]') THEN
        INSERT INTO orders (
            customer_id, source, status, subtotal, discount, total, notes, handled_by, version, created_at, updated_at
        )
        VALUES (
            customer_thabo_id, 'WHATSAPP', 'PENDING', 424.00, 24.00, 400.00,
            '[DEMO:ORDER:WHATSAPP-003]', admin_id, 0, ts_now - INTERVAL '1 day 2 hours', ts_now - INTERVAL '1 day 90 minutes'
        )
        RETURNING id INTO order_whatsapp_id;

        INSERT INTO order_items (order_id, part_id, qty, unit_price, created_at)
        VALUES
            (order_whatsapp_id, part_bumper_id, 1, 340.00, ts_now - INTERVAL '1 day 2 hours'),
            (order_whatsapp_id, part_fog_light_id, 2, 42.00, ts_now - INTERVAL '1 day 2 hours');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM orders WHERE notes = '[DEMO:ORDER:WEB-004]') THEN
        INSERT INTO orders (
            customer_id, source, status, subtotal, discount, total, notes, handled_by, version, created_at, updated_at
        )
        VALUES (
            customer_michael_id, 'WEB', 'FULFILLED', 455.00, 0.00, 455.00,
            '[DEMO:ORDER:WEB-004]', admin_id, 0, ts_now - INTERVAL '3 days 3 hours', ts_now - INTERVAL '3 days'
        )
        RETURNING id INTO order_web_id;

        INSERT INTO order_items (order_id, part_id, qty, unit_price, created_at)
        VALUES
            (order_web_id, part_radiator_id, 1, 265.00, ts_now - INTERVAL '3 days 3 hours'),
            (order_web_id, part_mirror_id, 1, 65.00, ts_now - INTERVAL '3 days 3 hours'),
            (order_web_id, part_brake_pad_id, 1, 95.00, ts_now - INTERVAL '3 days 3 hours'),
            (order_web_id, part_clips_id, 12, 2.50, ts_now - INTERVAL '3 days 3 hours');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM orders WHERE notes = '[DEMO:ORDER:SHOPIFY-005]') THEN
        INSERT INTO orders (
            customer_id, source, status, subtotal, discount, total, shopify_order_id, notes, handled_by, version, created_at, updated_at
        )
        VALUES (
            customer_sarah_id, 'SHOPIFY', 'FULFILLED', 615.00, 20.00, 595.00, 'SH-DEMO-100198',
            '[DEMO:ORDER:SHOPIFY-005]', admin_id, 0, ts_now - INTERVAL '7 days 5 hours', ts_now - INTERVAL '7 days 4 hours'
        )
        RETURNING id INTO order_shopify_fulfilled_id;

        INSERT INTO order_items (order_id, part_id, qty, unit_price, created_at)
        VALUES
            (order_shopify_fulfilled_id, part_headlight_id, 1, 520.00, ts_now - INTERVAL '7 days 5 hours'),
            (order_shopify_fulfilled_id, part_clips_id, 30, 2.50, ts_now - INTERVAL '7 days 5 hours'),
            (order_shopify_fulfilled_id, part_fog_light_id, 1, 42.00, ts_now - INTERVAL '7 days 5 hours');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM orders WHERE notes = '[DEMO:ORDER:WHATSAPP-006]') THEN
        INSERT INTO orders (
            customer_id, source, status, subtotal, discount, total, notes, handled_by, version, created_at, updated_at
        )
        VALUES (
            customer_lerato_id, 'WHATSAPP', 'REFUNDED', 630.00, 0.00, 630.00,
            '[DEMO:ORDER:WHATSAPP-006]', admin_id, 0, ts_now - INTERVAL '12 days', ts_now - INTERVAL '11 days 12 hours'
        )
        RETURNING id INTO order_refunded_id;

        INSERT INTO order_items (order_id, part_id, qty, unit_price, created_at)
        VALUES
            (order_refunded_id, part_headlight_id, 1, 520.00, ts_now - INTERVAL '12 days'),
            (order_refunded_id, part_grille_id, 1, 110.00, ts_now - INTERVAL '12 days');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM orders WHERE notes = '[DEMO:ORDER:WALKIN-007]') THEN
        INSERT INTO orders (
            customer_id, source, status, subtotal, discount, total, notes, handled_by, version, created_at, updated_at
        )
        VALUES (
            customer_nandi_id, 'WALK_IN', 'CANCELLED', 65.00, 0.00, 65.00,
            '[DEMO:ORDER:WALKIN-007]', admin_id, 0, ts_now - INTERVAL '15 days 2 hours', ts_now - INTERVAL '15 days'
        )
        RETURNING id INTO order_cancelled_id;

        INSERT INTO order_items (order_id, part_id, qty, unit_price, created_at)
        VALUES
            (order_cancelled_id, part_mirror_id, 1, 65.00, ts_now - INTERVAL '15 days 2 hours');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM stock_movements WHERE reference = 'DEMO-RECEIVE-BUMPER') THEN
        INSERT INTO stock_movements (part_id, movement_type, qty, reference, notes, performed_by, created_at)
        VALUES
            (part_bumper_id, 'RECEIVE', 8, 'DEMO-RECEIVE-BUMPER', 'Initial demo stock receipt', admin_id, ts_now - INTERVAL '14 days'),
            (part_fog_light_id, 'RECEIVE', 20, 'DEMO-RECEIVE-FOG', 'Initial demo stock receipt', admin_id, ts_now - INTERVAL '14 days'),
            (part_headlight_id, 'RECEIVE', 3, 'DEMO-RECEIVE-HEADLIGHT', 'Initial demo stock receipt', admin_id, ts_now - INTERVAL '14 days'),
            (part_grille_id, 'RECEIVE', 6, 'DEMO-RECEIVE-GRILLE', 'Initial demo stock receipt', admin_id, ts_now - INTERVAL '14 days'),
            (part_radiator_id, 'RECEIVE', 5, 'DEMO-RECEIVE-RADIATOR', 'Initial demo stock receipt', admin_id, ts_now - INTERVAL '14 days'),
            (part_mirror_id, 'RECEIVE', 15, 'DEMO-RECEIVE-MIRROR', 'Initial demo stock receipt', admin_id, ts_now - INTERVAL '14 days'),
            (part_brake_pad_id, 'RECEIVE', 4, 'DEMO-RECEIVE-BRAKE', 'Initial demo stock receipt', admin_id, ts_now - INTERVAL '14 days'),
            (part_clips_id, 'RECEIVE', 150, 'DEMO-RECEIVE-CLIPS', 'Initial demo stock receipt', admin_id, ts_now - INTERVAL '14 days');
    END IF;

    IF order_walkin_id IS NOT NULL THEN
        INSERT INTO stock_movements (part_id, movement_type, qty, reference, notes, performed_by, created_at)
        VALUES
            (part_radiator_id, 'SALE', 1, 'DEMO-ORDER-WALKIN-001', 'Demo walk-in order', admin_id, ts_today_slot_one),
            (part_clips_id, 'SALE', 31, 'DEMO-ORDER-WALKIN-001', 'Demo walk-in order', admin_id, ts_today_slot_one);
    END IF;

    IF order_shopify_id IS NOT NULL THEN
        INSERT INTO stock_movements (part_id, movement_type, qty, reference, notes, performed_by, created_at)
        VALUES
            (part_bumper_id, 'SALE', 1, 'DEMO-ORDER-SHOPIFY-002', 'Demo Shopify order', admin_id, ts_today_slot_two),
            (part_fog_light_id, 'SALE', 3, 'DEMO-ORDER-SHOPIFY-002', 'Demo Shopify order', admin_id, ts_today_slot_two),
            (part_clips_id, 'SALE', 60, 'DEMO-ORDER-SHOPIFY-002', 'Demo Shopify order', admin_id, ts_today_slot_two);
    END IF;

    IF order_whatsapp_id IS NOT NULL THEN
        INSERT INTO stock_movements (part_id, movement_type, qty, reference, notes, performed_by, created_at)
        VALUES
            (part_bumper_id, 'SALE', 1, 'DEMO-ORDER-WHATSAPP-003', 'Demo WhatsApp order', admin_id, ts_now - INTERVAL '1 day 2 hours'),
            (part_fog_light_id, 'SALE', 2, 'DEMO-ORDER-WHATSAPP-003', 'Demo WhatsApp order', admin_id, ts_now - INTERVAL '1 day 2 hours');
    END IF;
END $$;
