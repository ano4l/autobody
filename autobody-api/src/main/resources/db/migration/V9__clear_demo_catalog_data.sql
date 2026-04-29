DELETE FROM messages;
DELETE FROM conversations;
DELETE FROM stock_movements;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM pos_sessions;
DELETE FROM customers;
DELETE FROM parts;
DELETE FROM suppliers;

UPDATE posibolt_sync_state
SET products_synced = 0,
    stock_synced = 0,
    orders_synced = 0,
    last_error = NULL,
    updated_at = NOW()
WHERE id = 1;
