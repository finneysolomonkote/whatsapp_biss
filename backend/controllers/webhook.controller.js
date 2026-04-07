const supabase = require('../config/database');
const crypto = require('crypto');

const handleWhatsApp = async (req, res, next) => {
  try {
    const body = req.body;

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            for (const message of change.value.messages || []) {
              const contactPhone = message.from;
              const messageText = message.text?.body || '';

              let { data: contact } = await supabase
                .from('contacts')
                .select('*')
                .eq('phone', contactPhone)
                .maybeSingle();

              if (!contact) {
                const { data: newContact } = await supabase
                  .from('contacts')
                  .insert({
                    phone: contactPhone,
                    first_name: contactPhone,
                    tenant_id: entry.id
                  })
                  .select()
                  .single();

                contact = newContact;
              }

              if (contact) {
                let { data: conversation } = await supabase
                  .from('conversations')
                  .select('*')
                  .eq('contact_id', contact.id)
                  .eq('status', 'open')
                  .maybeSingle();

                if (!conversation) {
                  const { data: newConversation } = await supabase
                    .from('conversations')
                    .insert({
                      tenant_id: contact.tenant_id,
                      contact_id: contact.id,
                      status: 'open',
                      last_message_at: new Date().toISOString(),
                      last_message_preview: messageText.substring(0, 100),
                      unread_count: 1
                    })
                    .select()
                    .single();

                  conversation = newConversation;
                }

                if (conversation) {
                  await supabase.from('messages').insert({
                    tenant_id: contact.tenant_id,
                    conversation_id: conversation.id,
                    contact_id: contact.id,
                    content: messageText,
                    direction: 'inbound',
                    status: 'delivered',
                    timestamp: new Date().toISOString(),
                    external_id: message.id
                  });
                }
              }
            }
          }
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

const handleRazorpay = async (req, res, next) => {
  try {
    const body = req.body;
    const signature = req.headers['x-razorpay-signature'];

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const event = body.event;
    const payload = body.payload.payment.entity;

    switch (event) {
      case 'payment.authorized':
      case 'payment.captured': {
        await supabase
          .from('payments')
          .update({
            payment_id: payload.id,
            status: 'completed',
            completed_at: new Date().toISOString()
          })
          .eq('order_id', payload.order_id);
        break;
      }

      case 'payment.failed': {
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            failure_reason: payload.error_description
          })
          .eq('order_id', payload.order_id);
        break;
      }

      case 'refund.created': {
        await supabase
          .from('payments')
          .update({
            status: 'refunded',
            refund_id: payload.id,
            refunded_at: new Date().toISOString()
          })
          .eq('payment_id', payload.payment_id);
        break;
      }
    }

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleWhatsApp,
  handleRazorpay
};
