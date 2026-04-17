const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

exports.syncUser = async (req, res) => {
  const { id, email, name } = req.body;

  if (!id || !email) {
    return res.status(400).json({ error: 'Missing required user fields' });
  }

  try {
    // Sync with Supabase Database via API (Bypassing Prisma Firewall Block)
    const { data, error } = await supabase
      .from('User')
      .upsert({ 
        id, 
        email, 
        name,
        xp: 0,
        matchesPlayed: 0
      }, { onConflict: 'id' });

    if (error) throw error;

    res.status(200).json({ 
      message: 'User synced successfully via API fallback', 
      user: data 
    });
  } catch (error) {
    console.error('API Sync Error:', error);
    res.status(500).json({ error: 'Failed to sync user' });
  }
};
