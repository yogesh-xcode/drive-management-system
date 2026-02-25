import { supabase } from "../subabase";

class UserService {
  async get() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    return user
  }
}

export { UserService };

// export const user = {
//   name: "manpower drive",
//   email: "contact@drivems.com",
//   avatar: "/avatars/shadcn.jpg",
// };
