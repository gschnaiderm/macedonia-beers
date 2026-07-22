import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

export function AuthControls() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 border-l pl-4 sm:pl-6 border-red-100 shrink-0">
      <Show when="signed-out">
        <SignInButton mode="modal">
          <button className="text-zinc-600 hover:text-red-600 transition-colors font-medium">
            Iniciar Sesión
          </button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button className="rounded-full bg-red-600 px-4 py-1.5 sm:py-2 text-white hover:bg-red-700 transition-colors font-medium">
            Registrarse
          </button>
        </SignUpButton>
      </Show>
      <Show when="signed-in">
        <UserButton />
      </Show>
    </div>
  );
}
