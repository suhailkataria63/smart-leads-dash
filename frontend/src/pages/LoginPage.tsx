import { Button, Card, Input } from "../components";

function LoginPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center">
      <Card className="w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">Login</h1>
          <p className="mt-1 text-sm text-slate-600">Authentication logic will be added later.</p>
        </div>
        <div className="space-y-4">
          <Input label="Email" name="email" placeholder="you@example.com" type="email" />
          <Input label="Password" name="password" placeholder="Password" type="password" />
          <Button className="w-full">Login</Button>
        </div>
      </Card>
    </div>
  );
}

export { LoginPage };

