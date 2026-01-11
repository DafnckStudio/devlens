import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-dark-900">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'mx-auto',
            card: 'bg-dark-800 border border-dark-700',
            headerTitle: 'text-white',
            headerSubtitle: 'text-dark-400',
            socialButtonsBlockButton:
              'bg-dark-700 border-dark-600 text-white hover:bg-dark-600',
            dividerLine: 'bg-dark-700',
            dividerText: 'text-dark-500',
            formFieldLabel: 'text-dark-300',
            formFieldInput:
              'bg-dark-700 border-dark-600 text-white placeholder:text-dark-500',
            footerActionLink: 'text-primary-500 hover:text-primary-400',
            formButtonPrimary:
              'bg-primary-500 hover:bg-primary-600 text-white',
          },
        }}
      />
    </div>
  );
}
