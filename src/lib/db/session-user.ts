import { auth } from "@/auth";
import { ensureUser } from "./memory-repo";

export async function currentDbUser() {
  const session = await auth();
  const email = session?.user?.email;
  const id = session?.user?.id;
  if (!email || !id) return null;
  const user = await ensureUser({
    id,
    email,
    name: session.user?.name,
    image: session.user?.image,
  });
  return user ? { id: user.id, email: user.email } : { id, email };
}
