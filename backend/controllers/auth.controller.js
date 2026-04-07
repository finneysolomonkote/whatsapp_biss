const supabase = require('../config/database');

const signup = async (req, res, next) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name
        }
      }
    });

    if (error) throw error;

    res.status(201).json({
      success: true,
      data: {
        user: data.user,
        session: data.session
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    res.json({
      success: true,
      data: {
        user: data.user,
        session: data.session,
        access_token: data.session.access_token
      }
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  logout,
  getProfile
};
