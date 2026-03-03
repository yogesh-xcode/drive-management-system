import { supabase } from "@/lib/subabase";
import { SignInParams, SignUpParams } from "@/types";

class Auth {
  async signUp(user: SignUpParams) {
    return await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: {
          display_name: user.display_name,
        },
      },
    });
  }

  async signIn(user: SignInParams) {
    return await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password,
    });
  }

  handleForgotPassword = async (email: string) => {
    await supabase.auth.resetPasswordForEmail(email);
  };

  async signOut() {
    return await supabase.auth.signOut();
  }

  async updateProfile(displayName: string) {
    return await supabase.auth.updateUser({
      data: { display_name: displayName },
    });
  }

  async updatePassword(password: string) {
    return await supabase.auth.updateUser({ password });
  }
}

export default new Auth();
