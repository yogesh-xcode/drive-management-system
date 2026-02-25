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
}

export default new Auth();
