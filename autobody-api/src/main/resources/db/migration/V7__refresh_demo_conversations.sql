-- Refresh demo WhatsApp conversations so the local dashboard always has live inbox activity.

UPDATE conversations
SET status = 'ACTIVE',
    bot_step = 'ASK_PART',
    escalated = FALSE,
    escalated_to = NULL,
    updated_at = NOW() - INTERVAL '12 minutes'
WHERE wa_thread_id = 'demo-wa-thread-001';

UPDATE conversations
SET status = 'ESCALATED',
    bot_step = 'ESCALATED',
    escalated = TRUE,
    escalated_to = (SELECT id FROM users WHERE email = 'admin@autobody.local'),
    updated_at = NOW() - INTERVAL '18 minutes'
WHERE wa_thread_id = 'demo-wa-thread-002';

UPDATE conversations
SET status = 'ACTIVE',
    bot_step = 'PROVIDE_STOCK',
    escalated = FALSE,
    escalated_to = NULL,
    updated_at = NOW() - INTERVAL '6 minutes'
WHERE wa_thread_id = 'demo-wa-thread-003';

UPDATE conversations
SET status = 'RESOLVED',
    bot_step = 'DONE',
    escalated = FALSE,
    escalated_to = NULL,
    updated_at = NOW() - INTERVAL '1 day'
WHERE wa_thread_id = 'demo-wa-thread-004';
